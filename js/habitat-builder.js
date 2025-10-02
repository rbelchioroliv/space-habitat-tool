/**
 * Habitat Builder Module
 * Based on NASA Habitat Taxonomy and Construction Technology Roadmap
 */

class HabitatBuilder {
    constructor() {
        this.currentHabitat = {
            structure: 'cylinder',
            diameter: 8,
            length: 12,
            levels: 2,
            rotation: 0,
            construction: 'prefab'
        };

        this.structureTemplates = {
            cylinder: {
                name: 'Cylindrical Module',
                description: 'Standard ISS-style module with optimal structural efficiency',
                geometry: 'cylinder',
                volumeCalc: (d, l) => Math.PI * Math.pow(d / 2, 2) * l,
                areaCalc: (d, l, levels) => Math.PI * Math.pow(d / 2, 2) * levels,
                massFactor: 35,
                efficiency: 0.75,
                reference: 'ISS Heritage Design'
            },
            sphere: {
                name: 'Spherical Module',
                description: 'Optimal volume-to-surface ratio for radiation protection',
                geometry: 'sphere',
                volumeCalc: (d, l) => (4 / 3) * Math.PI * Math.pow(d / 2, 3),
                areaCalc: (d, l, levels) => 4 * Math.PI * Math.pow(d / 2, 2) * 0.6,
                massFactor: 40,
                efficiency: 0.70,
                reference: 'Radiation-optimized Design'
            },
            torus: {
                name: 'Torus Module',
                description: 'Ring structure for artificial gravity applications',
                geometry: 'torus',
                volumeCalc: (d, l) => 2 * Math.PI * Math.PI * (d / 2) * Math.pow(l / 4, 2),
                areaCalc: (d, l, levels) => 4 * Math.PI * Math.PI * (d / 2) * (l / 4) * 0.8,
                massFactor: 45,
                efficiency: 0.65,
                reference: 'Artificial Gravity Studies'
            },
            modular: {
                name: 'Modular Cluster',
                description: 'CSA-inspired interconnected modules for flexibility',
                geometry: 'modular',
                volumeCalc: (d, l) => 4 * Math.PI * Math.pow(d / 4, 2) * (l / 2),
                areaCalc: (d, l, levels) => 4 * Math.PI * Math.pow(d / 4, 2) * levels,
                massFactor: 38,
                efficiency: 0.72,
                reference: 'CSA Multi-functionality Concept'
            },
            horizontal: {
                name: 'Horizontal Layout',
                description: 'Surface-optimized for easy access and operations',
                geometry: 'cylinder',
                volumeCalc: (d, l) => Math.PI * Math.pow(d / 2, 2) * l,
                areaCalc: (d, l, levels) => Math.PI * Math.pow(d / 2, 2) * levels,
                massFactor: 36,
                efficiency: 0.78,
                reference: 'Lunar Surface Optimization'
            },
            vertical: {
                name: 'Vertical Layout',
                description: 'Minimized landing footprint for constrained sites',
                geometry: 'cylinder',
                volumeCalc: (d, l) => Math.PI * Math.pow(d / 2, 2) * l,
                areaCalc: (d, l, levels) => Math.PI * Math.pow(d / 2, 2) * levels,
                massFactor: 37,
                efficiency: 0.76,
                reference: 'Compact Landing Design'
            }
        };

        this.constructionMethods = {
            prefab: {
                name: 'Pre-fabricated',
                description: 'Earth-manufactured rigid structures',
                trl: 9,
                massEfficiency: 0.8,
                deployment: 'Direct launch',
                reference: 'Traditional Spacecraft Manufacturing'
            },
            inflatable: {
                name: 'Inflatable Softgoods',
                description: 'Launch-compacted, deployed on-site',
                trl: 7,
                massEfficiency: 0.6,
                deployment: 'Inflation deployment',
                reference: 'Bigelow/NASA Softgoods Development'
            },
            isl: {
                name: 'In-Situ Manufacturing',
                description: 'Local resource utilization construction',
                trl: 4,
                massEfficiency: 0.3,
                deployment: 'Robotic assembly',
                reference: 'MMPACT Technology Roadmap'
            },
            hybrid: {
                name: 'Hybrid Approach',
                description: 'Combination of pre-fab and in-situ elements',
                trl: 5,
                massEfficiency: 0.7,
                deployment: 'Integrated assembly',
                reference: 'Advanced Habitat Concepts'
            }
        };

        this.nasaStandards = new NASAStandards();
        this.initEventListeners();
        this.updateHabitatDisplay();
    }

    initEventListeners() {
        // Structure selection
        document.querySelectorAll('.structure-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const structure = e.currentTarget.getAttribute('data-structure');
                this.setStructure(structure);
            });
        });

        // Dimension controls
        document.getElementById('diameter').addEventListener('input', (e) => {
            this.setDiameter(parseFloat(e.target.value));
        });

        document.getElementById('length').addEventListener('input', (e) => {
            this.setLength(parseFloat(e.target.value));
        });

        document.getElementById('levels').addEventListener('input', (e) => {
            this.setLevels(parseInt(e.target.value));
        });

        document.getElementById('rotation').addEventListener('input', (e) => {
            this.setRotation(parseFloat(e.target.value));
        });
    }

    setStructure(structure) {
        this.currentHabitat.structure = structure;

        document.querySelectorAll('.structure-option').forEach(opt => {
            opt.classList.remove('active');
        });
        document.querySelector(`[data-structure="${structure}"]`).classList.add('active');

        this.updateHabitatDisplay();
        this.update3DVisualization();
    }

    setDiameter(diameter) {
        this.currentHabitat.diameter = diameter;
        document.getElementById('diameter-value').textContent = `${diameter.toFixed(1)} m`;
        this.updateHabitatMetrics();
        this.update3DVisualization();
    }

    setLength(length) {
        this.currentHabitat.length = length;
        document.getElementById('length-value').textContent = `${length.toFixed(1)} m`;
        this.updateHabitatMetrics();
        this.update3DVisualization();
    }

    setLevels(levels) {
        this.currentHabitat.levels = levels;
        document.getElementById('levels-value').textContent = `${levels} level${levels > 1 ? 's' : ''}`;
        this.updateHabitatMetrics();
        this.update3DVisualization();
    }

    setRotation(rotation) {
        this.currentHabitat.rotation = rotation;
        document.getElementById('rotation-value').textContent = `${rotation.toFixed(1)} RPM`;
        this.updateHabitatMetrics();
    }

    updateHabitatDisplay() {
        const template = this.structureTemplates[this.currentHabitat.structure];

        // Update habitat info
        const title = document.getElementById('habitat-title');
        const description = document.getElementById('habitat-description');

        if (title && description) {
            title.textContent = template.name;
            description.textContent = template.description;
        }

        this.updateHabitatMetrics();
    }

    updateHabitatMetrics() {
        const template = this.structureTemplates[this.currentHabitat.structure];

        // Safe access to mission planner
        let mission;
        try {
            mission = window.missionPlanner ? window.missionPlanner.getCurrentMission() : { crewSize: 4, construction: 'prefab' };
        } catch (error) {
            mission = { crewSize: 4, construction: 'prefab' };
        }

        const totalVolume = template.volumeCalc(this.currentHabitat.diameter, this.currentHabitat.length);
        const floorArea = template.areaCalc(this.currentHabitat.diameter, this.currentHabitat.length, this.currentHabitat.levels);
        const netHabitableVolume = this.nasaStandards.calculateNetHabitableVolume(totalVolume, mission.construction);
        const volumePerCrew = netHabitableVolume / mission.crewSize;

        // Mass calculation based on construction method
        const construction = this.constructionMethods[mission.construction];
        const mass = (totalVolume * template.massFactor * construction.massEfficiency) / 1000;

        // Update display
        document.getElementById('total-volume').textContent = `${Math.round(totalVolume)} m³`;
        document.getElementById('nhv-metric').textContent = `${Math.round(netHabitableVolume)} m³`;
        document.getElementById('floor-area').textContent = `${Math.round(floorArea)} m²`;
        document.getElementById('mass-estimate').textContent = `${mass.toFixed(1)} t`;
        document.getElementById('volume-per-crew').textContent = `${Math.round(volumePerCrew)} m³`;

        // Launch compatibility - safe check
        let validation = { valid: true };
        try {
            if (window.missionPlanner) {
                validation = window.missionPlanner.validateMissionConstraints(this.getCurrentHabitat());
            }
        } catch (error) {
            console.warn('Mission planner not ready for validation:', error);
        }

        const launchElement = document.getElementById('launch-compatible');
        if (validation.valid) {
            launchElement.textContent = 'Yes';
            launchElement.className = 'metric-value compliant';
        } else {
            launchElement.textContent = 'No';
            launchElement.className = 'metric-value warning';
        }

        // Update constraints analysis - safe check
        try {
            if (window.missionPlanner) {
                window.missionPlanner.updateConstraintsAnalysis(this.getCurrentHabitat());
            }
        } catch (error) {
            console.warn('Mission planner not ready for constraints analysis:', error);
        }
    }

    update3DVisualization() {
        if (window.threeScene && window.threeScene.currentView === 'exterior') {
            window.threeScene.createHabitat(
                this.currentHabitat.structure,
                this.currentHabitat.diameter / 2,
                this.currentHabitat.length,
                this.currentHabitat.levels
            );
        }
    }

    getRotationSpeed() {
        return this.currentHabitat.rotation;
    }

    getCurrentHabitat() {
        const template = this.structureTemplates[this.currentHabitat.structure];
        const mission = window.missionPlanner ? window.missionPlanner.getCurrentMissionSafe() : { crewSize: 4, construction: 'prefab' };

        const totalVolume = template.volumeCalc(this.currentHabitat.diameter, this.currentHabitat.length);
        const floorArea = template.areaCalc(this.currentHabitat.diameter, this.currentHabitat.length, this.currentHabitat.levels);
        const netHabitableVolume = this.nasaStandards.calculateNetHabitableVolume(totalVolume, mission.construction);
        const construction = this.constructionMethods[mission.construction];
        const mass = (totalVolume * template.massFactor * construction.massEfficiency) / 1000;

        return {
            structure: this.currentHabitat.structure,
            diameter: this.currentHabitat.diameter,
            length: this.currentHabitat.length,
            levels: this.currentHabitat.levels,
            rotation: this.currentHabitat.rotation,
            construction: mission.construction,
            volume: totalVolume,
            netHabitableVolume: netHabitableVolume,
            floorArea: floorArea,
            mass: mass,
            volumePerCrew: netHabitableVolume / mission.crewSize,
            artificialGravity: this.calculateArtificialGravity()
        };
    }

    calculateArtificialGravity() {
        if (this.currentHabitat.rotation === 0) return 0;

        const radius = this.currentHabitat.diameter / 2;
        const angularVelocity = (this.currentHabitat.rotation * 2 * Math.PI) / 60;
        const gravity = (angularVelocity * angularVelocity * radius) / 9.81;

        return Math.min(gravity, 1.0); // Cap at 1g
    }

    onMissionChange(mission) {
        // Adjust habitat parameters based on mission requirements
        const template = this.nasaStandards.getMissionStandards(mission.destination);
        const requiredNHV = this.nasaStandards.standards.netHabitableVolume.longDuration * mission.crewSize;

        // Calculate required total volume
        const construction = this.constructionMethods[mission.construction];
        const requiredTotalVolume = requiredNHV / (0.8 * construction.massEfficiency);

        // Suggest appropriate dimensions if current volume is insufficient
        const currentVolume = this.structureTemplates[this.currentHabitat.structure].volumeCalc(
            this.currentHabitat.diameter,
            this.currentHabitat.length
        );

        if (currentVolume < requiredTotalVolume) {
            // Auto-adjust to meet minimum requirements
            const scaleFactor = Math.pow(requiredTotalVolume / currentVolume, 1 / 3);
            this.setDiameter(this.currentHabitat.diameter * scaleFactor);
            this.setLength(this.currentHabitat.length * scaleFactor);

            // Update sliders
            document.getElementById('diameter').value = this.currentHabitat.diameter;
            document.getElementById('length').value = this.currentHabitat.length;
        }

        this.updateHabitatMetrics();
    }

    generateHabitatSpecs() {
        const habitat = this.getCurrentHabitat();
        const mission = window.missionPlanner ? window.missionPlanner.getCurrentMission() : null;
        const template = this.structureTemplates[habitat.structure];

        return {
            habitat: {
                structure: {
                    type: habitat.structure,
                    template: template.name,
                    reference: template.reference
                },
                dimensions: {
                    diameter: habitat.diameter,
                    length: habitat.length,
                    levels: habitat.levels
                },
                performance: {
                    totalVolume: habitat.volume,
                    netHabitableVolume: habitat.netHabitableVolume,
                    floorArea: habitat.floorArea,
                    mass: habitat.mass,
                    artificialGravity: habitat.artificialGravity
                },
                construction: {
                    method: habitat.construction,
                    details: this.constructionMethods[habitat.construction],
                    efficiency: template.efficiency
                }
            },
            mission: mission,
            compliance: this.nasaStandards.generateComplianceReport(habitat, mission),
            timestamp: new Date().toISOString()
        };
    }

    optimizeForMission(missionType) {
        const mission = this.missionTemplates[missionType];
        const standards = this.nasaStandards.getMissionStandards(missionType);

        // Set optimal parameters for mission type
        switch (missionType) {
            case 'lunar-surface':
                this.setStructure('horizontal');
                this.setDiameter(8);
                this.setLength(12);
                this.setLevels(2);
                break;
            case 'mars-transit':
                this.setStructure('cylinder');
                this.setDiameter(6);
                this.setLength(15);
                this.setLevels(3);
                this.setRotation(2.0);
                break;
            case 'mars-surface':
                this.setStructure('modular');
                this.setDiameter(10);
                this.setLength(8);
                this.setLevels(1);
                break;
            case 'gateway':
                this.setStructure('cylinder');
                this.setDiameter(4.5);
                this.setLength(10);
                this.setLevels(2);
                break;
        }

        this.update3DVisualization();
    }
}