/**
 * Mission Planning Module
 * Based on NASA Moon to Mars Architecture Definition Document
 */

class MissionPlanner {
    constructor() {
        this.currentMission = {
            destination: 'lunar-surface',
            crewSize: 4,
            duration: 180, // days
            evaFrequency: 4, // per week
            construction: 'prefab',
            missionPhase: 'initial'
        };

        this.missionTemplates = {
            'lunar-surface': {
                name: 'Lunar Surface Habitat',
                description: 'Artemis Base Camp - Sustainable lunar presence supporting science and exploration',
                icon: '🌕',
                architecture: {
                    phase: 'Artemis III-V',
                    objectives: ['Science', 'ISRU Demo', 'Long-duration habitation'],
                    reference: 'Moon to Mars Architecture Definition Document'
                },
                constraints: {
                    launchVehicle: 'SLS Block 1B',
                    fairing: { diameter: 8.4, length: 19.1 },
                    massLimit: 42,
                    deployment: 'Single launch'
                },
                environment: {
                    gravity: 0.16,
                    temperature: '-173°C to 127°C',
                    radiation: 'High',
                    dust: 'Abrasive regolith'
                }
            },
            'mars-transit': {
                name: 'Mars Transit Habitat',
                description: 'Deep Space Transport - Crew accommodation for journey to Mars',
                icon: '🚀',
                architecture: {
                    phase: 'Mars Mission Phase 1',
                    objectives: ['Crew transport', 'Deep space operations', 'Contingency support'],
                    reference: 'NASA Mars Transit Habitat Design'
                },
                constraints: {
                    launchVehicle: 'Starship',
                    fairing: { diameter: 9.0, length: 18.0 },
                    massLimit: 100,
                    deployment: 'Orbital assembly'
                },
                environment: {
                    gravity: 0.0,
                    temperature: 'Controlled',
                    radiation: 'Very High',
                    microgravity: 'Long-duration'
                }
            },
            'mars-surface': {
                name: 'Mars Surface Habitat',
                description: 'Mars Base - Long-duration surface habitation with ISRU support',
                icon: '🪐',
                architecture: {
                    phase: 'Mars Mission Phase 2',
                    objectives: ['Surface operations', 'Science', 'ISRU Production'],
                    reference: 'Mars Surface Architecture'
                },
                constraints: {
                    launchVehicle: 'Starship',
                    fairing: { diameter: 9.0, length: 18.0 },
                    massLimit: 100,
                    deployment: 'Pre-deployment'
                },
                environment: {
                    gravity: 0.38,
                    temperature: '-125°C to 20°C',
                    radiation: 'Moderate-High',
                    dust: 'Fine regolith'
                }
            },
            'gateway': {
                name: 'Lunar Gateway Module',
                description: 'Orbital platform supporting lunar surface operations and deep space testing',
                icon: '🛰️',
                architecture: {
                    phase: 'Artemis IV+',
                    objectives: ['Orbital operations', 'Technology demo', 'Science'],
                    reference: 'Lunar Gateway Specifications'
                },
                constraints: {
                    launchVehicle: 'Falcon Heavy',
                    fairing: { diameter: 5.2, length: 13.2 },
                    massLimit: 16,
                    deployment: 'Commercial launch'
                },
                environment: {
                    gravity: 0.0,
                    temperature: 'Controlled',
                    radiation: 'Moderate',
                    microgravity: 'Continuous'
                }
            }
        };

        this.nasaStandards = new NASAStandards();
        this.initEventListeners();
        this.updateMissionDisplay();
        console.log('Mission Planner initialized');
    }

    initEventListeners() {
        document.querySelectorAll('.mission-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const destination = e.currentTarget.getAttribute('data-destination');
                this.setDestination(destination);
            });
        });

        document.getElementById('crew-size').addEventListener('input', (e) => {
            this.setCrewSize(parseInt(e.target.value));
        });

        document.getElementById('mission-duration').addEventListener('input', (e) => {
            this.setDuration(parseInt(e.target.value));
        });

        document.getElementById('eva-frequency').addEventListener('input', (e) => {
            this.setEVAFrequency(parseInt(e.target.value));
        });

        document.querySelectorAll('.tech-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const tech = e.currentTarget.getAttribute('data-tech');
                this.setConstructionTechnology(tech);
            });
        });
    }

    setDestination(destination) {
        this.currentMission.destination = destination;

        document.querySelectorAll('.mission-option').forEach(opt => {
            opt.classList.remove('active');
        });
        document.querySelector(`[data-destination="${destination}"]`).classList.add('active');

        this.updateMissionDisplay();
        this.updateNASAStandards();

        // --- ADICIONADO: Comunica com a cena 3D para mudar a textura do chão ---
        if (window.threeScene && typeof window.threeScene.updateGroundTexture === 'function') {
            window.threeScene.updateGroundTexture(destination);
        }

        if (window.habitatBuilder) {
            window.habitatBuilder.onMissionChange(this.currentMission);
        }
        if (window.interiorDesigner) {
            window.interiorDesigner.onMissionChange(this.currentMission);
        }
    }

    setCrewSize(crewSize) {
        this.currentMission.crewSize = crewSize;
        document.getElementById('crew-size-value').textContent = `${crewSize} astronauts`;
        this.updateNASAStandards();
    }

    setDuration(duration) {
        this.currentMission.duration = duration;
        const months = (duration / 30).toFixed(1);
        document.getElementById('mission-duration-value').textContent = `${duration} days (${months} months)`;
        this.updateNASAStandards();
    }

    setEVAFrequency(frequency) {
        this.currentMission.evaFrequency = frequency;
        document.getElementById('eva-frequency-value').textContent = `${frequency}/week`;
    }

    setConstructionTechnology(tech) {
        this.currentMission.construction = tech;
        document.querySelectorAll('.tech-option').forEach(opt => {
            opt.classList.remove('active');
        });
        document.querySelector(`[data-tech="${tech}"]`).classList.add('active');
        this.updateNASAStandards();
    }

    updateMissionDisplay() {
        const template = this.missionTemplates[this.currentMission.destination];
        const title = document.getElementById('habitat-title');
        const description = document.getElementById('habitat-description');
        if (title && description) {
            title.textContent = template.name;
            description.textContent = template.description;
        }
        this.updateArchitectureInfo(template);
    }

    updateArchitectureInfo(template) {
        const infoPanel = document.querySelector('.info-panel .tech-specs');
        if (infoPanel) {
            infoPanel.innerHTML = `
                <div class="spec-item">
                    <span>Architecture Phase:</span>
                    <span>${template.architecture.phase}</span>
                </div>
                <div class="spec-item">
                    <span>Primary Objectives:</span>
                    <span>${template.architecture.objectives.slice(0, 2).join(', ')}</span>
                </div>
                <div class="spec-item">
                    <span>Launch System:</span>
                    <span>${template.constraints.launchVehicle}</span>
                </div>
                <div class="spec-item">
                    <span>Environment:</span>
                    <span>${template.environment.gravity}g, ${template.environment.radiation} radiation</span>
                </div>
            `;
        }
    }

    updateNASAStandards() {
        const lifeSupport = this.nasaStandards.getLifeSupportRequirements();
        document.getElementById('nhv-value').textContent = `${this.nasaStandards.standards.netHabitableVolume.longDuration} m³/crew`;
        document.getElementById('food-value').textContent = `${lifeSupport.foodProduction.required} kg/crew/day`;
        document.getElementById('water-value').textContent = `> ${lifeSupport.waterRecycling.target * 100}%`;
        document.getElementById('radiation-value').textContent = `${this.getRadiationRequirement()} g/cm²`;
        this.updateComplianceBanner();
    }

    getRadiationRequirement() {
        const requirements = {
            'lunar-surface': 20,
            'mars-transit': 30,
            'mars-surface': 25,
            'gateway': 15
        };
        return requirements[this.currentMission.destination];
    }

    updateComplianceBanner() {
        const validation = this.nasaStandards.validateCrewAccommodation(this.currentMission.destination, this.currentMission.crewSize, this.currentMission.duration);
        const nhvStatus = document.getElementById('nhv-status');
        const mmpactStatus = document.getElementById('mmpact-status');
        const nextstepStatus = document.getElementById('nextstep-status');
        if (validation.valid) {
            nhvStatus.textContent = 'Compliant';
            nhvStatus.className = 'status-compliant';
        } else {
            nhvStatus.textContent = 'Review Required';
            nhvStatus.className = 'status-warning';
        }
        const tech = this.nasaStandards.standards.technologyReadiness[this.currentMission.construction];
        if (tech.trl >= 6) {
            mmpactStatus.textContent = 'Compatible';
            mmpactStatus.className = 'status-compliant';
        } else {
            mmpactStatus.textContent = 'Tech Development';
            mmpactStatus.className = 'status-warning';
        }
        if (this.currentMission.crewSize <= 6 && this.currentMission.duration <= 360) {
            nextstepStatus.textContent = 'Compliant';
            nextstepStatus.className = 'status-compliant';
        } else {
            nextstepStatus.textContent = 'Extended Mission';
            nextstepStatus.className = 'status-warning';
        }
    }

    getCurrentMission() {
        return { ...this.currentMission };
    }
}