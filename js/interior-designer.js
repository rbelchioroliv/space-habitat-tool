/**
 * Interior Design Module
 * Based on NASA NextSTEP Habitability Guidelines and CSA Multi-functionality
 */

class InteriorDesigner {
    constructor() {
        this.currentView = 'exterior';
        this.currentLevel = 0;
        this.functionalAreas = new Map();
        this.equipmentItems = new Map();
        this.roomLayout = [];
        
        this.areaTemplates = {
            sleep: {
                name: 'Sleep Quarters',
                color: 0x4caf50,
                minArea: 4,
                recommended: 6,
                equipment: ['sleep-station', 'storage', 'desk'],
                privacy: 'high',
                noiseSensitive: true,
                category: 'crew-support'
            },
            hygiene: {
                name: 'Hygiene Facility',
                color: 0x2196f3,
                minArea: 3,
                recommended: 4,
                equipment: ['water-recycler', 'shower', 'sink'],
                privacy: 'medium',
                noiseSensitive: false,
                category: 'crew-support'
            },
            medical: {
                name: 'Medical Bay',
                color: 0xf44336,
                minArea: 6,
                recommended: 8,
                equipment: ['medical-bed', 'monitor', 'cabinet'],
                privacy: 'medium',
                noiseSensitive: true,
                category: 'crew-support'
            },
            galley: {
                name: 'Galley',
                color: 0xff9800,
                minArea: 6,
                recommended: 8,
                equipment: ['galley-equipment', 'storage', 'prep-table'],
                privacy: 'low',
                noiseSensitive: false,
                category: 'sustenance'
            },
            dining: {
                name: 'Dining Area',
                color: 0x795548,
                minArea: 8,
                recommended: 10,
                equipment: ['table', 'chairs', 'storage'],
                privacy: 'low',
                noiseSensitive: false,
                category: 'sustenance'
            },
            exercise: {
                name: 'Exercise Area',
                color: 0x9c27b0,
                minArea: 10,
                recommended: 12,
                equipment: ['exercise-equipment', 'treadmill', 'weights'],
                privacy: 'low',
                noiseSensitive: false,
                category: 'well-being'
            },
            work: {
                name: 'Workstation/Lab',
                color: 0x607d8b,
                minArea: 8,
                recommended: 10,
                equipment: ['lab-equipment', 'computer', 'storage'],
                privacy: 'medium',
                noiseSensitive: true,
                category: 'operations'
            },
            control: {
                name: 'Control Station',
                color: 0x00bcd4,
                minArea: 6,
                recommended: 8,
                equipment: ['control-consoles', 'monitors', 'chair'],
                privacy: 'medium',
                noiseSensitive: true,
                category: 'operations'
            },
            recreation: {
                name: 'Recreation Area',
                color: 0xe91e63,
                minArea: 10,
                recommended: 12,
                equipment: ['sofa', 'entertainment', 'table'],
                privacy: 'low',
                noiseSensitive: false,
                category: 'well-being'
            },
            storage: {
                name: 'Storage',
                color: 0x9e9e9e,
                minArea: 6,
                recommended: 8,
                equipment: ['shelves', 'racks', 'containers'],
                privacy: 'low',
                noiseSensitive: false,
                category: 'operations'
            },
            greenhouse: {
                name: 'Food Production',
                color: 0x8bc34a,
                minArea: 12,
                recommended: 15,
                equipment: ['plant-rack', 'grow-lights', 'irrigation'],
                privacy: 'low',
                noiseSensitive: false,
                category: 'sustenance'
            },
            eclss: {
                name: 'Life Support',
                color: 0x8bc34a,
                minArea: 8,
                recommended: 10,
                equipment: ['oxygen-system', 'co2-scrubber', 'water-recycler'],
                privacy: 'low',
                noiseSensitive: false,
                category: 'operations'
            }
        };

        this.nasaStandards = new NASAStandards();
        this.initEventListeners();
        this.initDragAndDrop();
    }

    initEventListeners() {
        // View switching
        document.getElementById('view-interior')?.addEventListener('click', () => {
            this.switchToInteriorView();
        });

        document.getElementById('view-exterior')?.addEventListener('click', () => {
            this.switchToExteriorView();
        });

        // Level navigation
        document.getElementById('level-up')?.addEventListener('click', () => {
            this.changeLevel(1);
        });

        document.getElementById('level-down')?.addEventListener('click', () => {
            this.changeLevel(-1);
        });

        // Equipment selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('equipment-item')) {
                const equipmentType = e.target.getAttribute('data-equipment');
                this.selectEquipment(equipmentType);
            }
        });

        // Functional area selection
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('area-option')) {
                const areaType = e.target.getAttribute('data-area');
                this.selectArea(areaType);
            }
        });
    }

    initDragAndDrop() {
        let draggedItem = null;

        // Drag start for functional areas
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('area-option')) {
                draggedItem = {
                    type: 'area',
                    areaType: e.target.getAttribute('data-area')
                };
                e.target.classList.add('dragging');
            } else if (e.target.classList.contains('equipment-item')) {
                draggedItem = {
                    type: 'equipment',
                    equipmentType: e.target.getAttribute('data-equipment')
                };
                e.target.classList.add('dragging');
            }
        });

        document.addEventListener('dragend', (e) => {
            e.target.classList.remove('dragging');
            draggedItem = null;
        });

        // Drop handling in 3D scene
        const sceneContainer = document.getElementById('visualization-container');
        if (sceneContainer) {
            sceneContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            sceneContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                if (draggedItem && window.threeScene) {
                    this.handleSceneDrop(e, draggedItem);
                }
            });
        }
    }

    handleSceneDrop(event, draggedItem) {
        if (window.threeScene.currentView !== 'interior') {
            alert('Please switch to interior view to place items');
            return;
        }

        const position = window.threeScene.handleDrop(event, draggedItem.type, draggedItem);

        if (draggedItem.type === 'area') {
            this.placeFunctionalArea(draggedItem.areaType, position);
        } else if (draggedItem.type === 'equipment') {
            this.placeEquipment(draggedItem.equipmentType, position);
        }

        this.updateHabitabilityAssessment();
    }

    switchToInteriorView() {
        this.currentView = 'interior';
        
        // Update UI
        document.getElementById('view-interior').classList.add('active');
        document.getElementById('view-exterior').classList.remove('active');
        
        // Switch Three.js scene to interior view
        if (window.threeScene) {
            window.threeScene.switchToInteriorView();
        }

        // Generate automatic interior layout if none exists
        if (this.functionalAreas.size === 0) {
            this.generateAutomaticLayout();
        }

        this.updateInteriorUI();
    }

    switchToExteriorView() {
        this.currentView = 'exterior';
        
        // Update UI
        document.getElementById('view-exterior').classList.add('active');
        document.getElementById('view-interior').classList.remove('active');
        
        // Switch Three.js scene to exterior view
        if (window.threeScene) {
            window.threeScene.switchToExteriorView();
        }

        this.updateInteriorUI();
    }

    generateAutomaticLayout() {
        const mission = window.missionPlanner?.getCurrentMission();
        const habitat = window.habitatBuilder?.getCurrentHabitat();
        
        if (!mission || !habitat) return;

        // Calculate required areas based on mission parameters
        const requiredAreas = this.calculateRequiredAreas(mission, habitat);
        
        // Generate layout positions
        const positions = this.calculateLayoutPositions(requiredAreas, habitat);
        
        // Create areas at calculated positions
        requiredAreas.forEach((areaType, index) => {
            if (positions[index]) {
                this.placeFunctionalArea(areaType, positions[index]);
            }
        });

        console.log('Generated automatic interior layout');
    }

    calculateRequiredAreas(mission, habitat) {
        const areas = [];
        const crewSize = mission.crewSize;
        const duration = mission.duration;

        // Essential areas for all missions
        areas.push('control', 'eclss', 'storage', 'galley', 'dining');

        // Crew accommodation
        for (let i = 0; i < crewSize; i++) {
            areas.push('sleep');
        }

        // Hygiene facilities (one per 4 crew)
        const hygieneCount = Math.ceil(crewSize / 4);
        for (let i = 0; i < hygieneCount; i++) {
            areas.push('hygiene');
        }

        // Mission-specific areas
        areas.push('medical', 'work');

        // Areas for long-duration missions
        if (duration > 180) {
            areas.push('exercise', 'recreation');
        }

        // Areas for very long missions
        if (duration > 360) {
            areas.push('greenhouse');
        }

        return areas;
    }

    calculateLayoutPositions(areas, habitat) {
        const positions = [];
        const radius = habitat.diameter / 2 - 1; // Leave margin for walls
        const angleStep = (2 * Math.PI) / areas.length;

        areas.forEach((area, index) => {
            const angle = index * angleStep;
            const distance = radius * 0.7; // Position areas inward from walls
            
            const x = Math.cos(angle) * distance;
            const z = Math.sin(angle) * distance;
            const y = 0; // Ground level

            positions.push(new THREE.Vector3(x, y, z));
        });

        return positions;
    }

    placeFunctionalArea(areaType, position) {
        const areaConfig = this.areaTemplates[areaType];
        if (!areaConfig || !window.threeScene) return;

        const size = new THREE.Vector3(3, 2.5, 3);
        const area = window.threeScene.createFunctionalArea(areaType, position, size, areaConfig.color);

        this.functionalAreas.set(areaType, {
            mesh: area,
            position: position,
            config: areaConfig,
            equipment: new Set()
        });

        // Add default equipment for this area
        this.addDefaultEquipment(areaType, position);

        // Update UI to show area as placed
        this.updateAreaUI(areaType, true);

        return area;
    }

    addDefaultEquipment(areaType, position) {
        const areaConfig = this.areaTemplates[areaType];
        if (!areaConfig || !window.threeScene) return;

        areaConfig.equipment.forEach((equipmentType, index) => {
            const equipmentPos = new THREE.Vector3(
                position.x + (index - 1) * 1.2,
                position.y + 0.5,
                position.z
            );

            this.placeEquipment(equipmentType, equipmentPos);
        });
    }

    placeEquipment(equipmentType, position) {
        if (!window.threeScene) return;

        const result = window.threeScene.addEquipment(equipmentType, position);
        
        this.equipmentItems.set(result.id, {
            type: equipmentType,
            mesh: result.equipment,
            position: position
        });

        return result.id;
    }

    changeLevel(delta) {
        if (window.threeScene) {
            window.threeScene.changeInteriorLevel(delta);
            this.currentLevel = window.threeScene.currentLevel;
        }
    }

    selectEquipment(equipmentType) {
        // Highlight equipment of this type in the scene
        this.highlightEquipment(equipmentType);
        
        // Show equipment properties
        this.showEquipmentProperties(equipmentType);
    }

    selectArea(areaType) {
        // Highlight area in the scene
        this.highlightArea(areaType);
        
        // Show area properties and options
        this.showAreaProperties(areaType);
    }

    highlightEquipment(equipmentType) {
        // Implementation to highlight equipment in the 3D scene
        this.equipmentItems.forEach((equipment, id) => {
            if (equipment.type === equipmentType && equipment.mesh.material) {
                equipment.mesh.material.emissive = new THREE.Color(0x444444);
            }
        });
    }

    highlightArea(areaType) {
        const area = this.functionalAreas.get(areaType);
        if (area && area.mesh.material) {
            area.mesh.material.opacity = 0.9;
            area.mesh.material.emissive = new THREE.Color(0x222222);
        }
    }

    showEquipmentProperties(equipmentType) {
        const propertiesPanel = document.getElementById('equipment-props-content');
        if (!propertiesPanel) return;

        propertiesPanel.innerHTML = `
            <div class="property-group">
                <h4>${this.getEquipmentName(equipmentType)}</h4>
                <div class="property-item">
                    <label>Type:</label>
                    <span>${equipmentType}</span>
                </div>
                <div class="property-item">
                    <label>Power Requirements:</label>
                    <span>${this.getPowerRequirement(equipmentType)} W</span>
                </div>
                <div class="property-item">
                    <label>Mass:</label>
                    <span>${this.getMassEstimate(equipmentType)} kg</span>
                </div>
            </div>
        `;

        document.querySelector('.equipment-properties').style.display = 'block';
    }

    showAreaProperties(areaType) {
        const areaConfig = this.areaTemplates[areaType];
        if (!areaConfig) return;

        // Implementation to show area properties panel
        console.log(`Showing properties for ${areaConfig.name}`);
    }

    updateAreaUI(areaType, isPlaced) {
        const areaElement = document.querySelector(`[data-area="${areaType}"]`);
        if (areaElement) {
            if (isPlaced) {
                areaElement.classList.add('placed');
            } else {
                areaElement.classList.remove('placed');
            }
        }
    }

    updateInteriorUI() {
        // Show/hide interior-specific UI elements
        const interiorNav = document.querySelector('.interior-navigation');
        if (interiorNav) {
            interiorNav.style.display = this.currentView === 'interior' ? 'flex' : 'none';
        }
    }

    updateHabitabilityAssessment() {
        const feedbackContainer = document.getElementById('habitability-feedback');
        if (!feedbackContainer) return;

        const areas = Array.from(this.functionalAreas.values());
        const assessment = this.nasaStandards.assessFunctionalAreaLayout(areas);

        feedbackContainer.innerHTML = '';

        if (assessment.length === 0) {
            feedbackContainer.innerHTML = `
                <div class="feedback-item compliant">
                    <span>✓</span>
                    <span>Layout meets NASA habitability guidelines</span>
                </div>
            `;
            return;
        }

        assessment.forEach(item => {
            const feedbackItem = document.createElement('div');
            feedbackItem.className = `feedback-item ${item.type}`;
            feedbackItem.innerHTML = `
                <span>${item.type === 'success' ? '✓' : item.type === 'warning' ? '⚠' : '✗'}</span>
                <span>${item.message}</span>
            `;
            feedbackContainer.appendChild(feedbackItem);
        });
    }

    getEquipmentName(equipmentType) {
        const names = {
            'sleep-station': 'Sleep Station',
            'exercise-equipment': 'Exercise Equipment',
            'galley-equipment': 'Galley Equipment',
            'lab-equipment': 'Laboratory Equipment',
            'control-consoles': 'Control Consoles',
            'oxygen-system': 'Oxygen Generation System',
            'water-recycler': 'Water Recycling System',
            'co2-scrubber': 'CO2 Scrubbing System'
        };
        return names[equipmentType] || equipmentType;
    }

    getPowerRequirement(equipmentType) {
        const requirements = {
            'sleep-station': 50,
            'exercise-equipment': 200,
            'galley-equipment': 300,
            'lab-equipment': 150,
            'control-consoles': 100,
            'oxygen-system': 500,
            'water-recycler': 400,
            'co2-scrubber': 300
        };
        return requirements[equipmentType] || 100;
    }

    getMassEstimate(equipmentType) {
        const masses = {
            'sleep-station': 80,
            'exercise-equipment': 120,
            'galley-equipment': 150,
            'lab-equipment': 200,
            'control-consoles': 100,
            'oxygen-system': 300,
            'water-recycler': 250,
            'co2-scrubber': 180
        };
        return masses[equipmentType] || 100;
    }

    onMissionChange(mission) {
        // Regenerate layout when mission changes significantly
        if (this.functionalAreas.size > 0) {
            this.regenerateLayoutForMission(mission);
        }
    }

    regenerateLayoutForMission(mission) {
        // Clear existing layout
        this.functionalAreas.clear();
        this.equipmentItems.clear();
        
        if (window.threeScene) {
            window.threeScene.clearHabitat();
        }

        // Generate new layout for current mission
        this.generateAutomaticLayout();
    }

    getInteriorData() {
        return {
            currentView: this.currentView,
            currentLevel: this.currentLevel,
            functionalAreas: Array.from(this.functionalAreas.entries()).map(([type, area]) => ({
                type,
                position: area.position.toArray(),
                config: area.config
            })),
            equipment: Array.from(this.equipmentItems.entries()).map(([id, equipment]) => ({
                id,
                type: equipment.type,
                position: equipment.position.toArray()
            })),
            layout: this.roomLayout
        };
    }

    loadInteriorData(data) {
        this.functionalAreas.clear();
        this.equipmentItems.clear();

        this.currentView = data.currentView;
        this.currentLevel = data.currentLevel || 0;

        // Recreate functional areas
        data.functionalAreas.forEach(areaData => {
            const position = new THREE.Vector3().fromArray(areaData.position);
            this.placeFunctionalArea(areaData.type, position);
        });

        // Recreate equipment
        data.equipment.forEach(equipmentData => {
            const position = new THREE.Vector3().fromArray(equipmentData.position);
            this.placeEquipment(equipmentData.type, position);
        });

        this.roomLayout = data.layout || [];

        if (this.currentView === 'interior') {
            this.switchToInteriorView();
        }

        this.updateHabitabilityAssessment();
    }
}