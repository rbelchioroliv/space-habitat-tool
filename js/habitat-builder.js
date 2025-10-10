/**
 * Habitat Builder Module
 * Manages the creation and modification of the habitat structure based on user inputs.
 */

class HabitatBuilder {
    constructor() {
        this.currentHabitat = {
            structure: {
                type: 'cylinder',
            },
            dimensions: {
                diameter: 8.0,
                length: 12.0,
                levels: 2
            },
            performance: {
                totalVolume: 0,
                netHabitableVolume: 0,
                floorArea: 0,
                massEstimate: 0,
                artificialGravity: 0
            }
        };

        this.initEventListeners();
        // REMOVIDO: a chamada this.updateHabitat() foi retirada daqui para evitar o erro.
        console.log('Habitat Builder initialized');
    }

    initEventListeners() {
        document.querySelectorAll('.structure-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const structureType = e.currentTarget.getAttribute('data-structure');
                this.setStructure(structureType);
            });
        });

        document.getElementById('diameter').addEventListener('input', (e) => this.setDiameter(parseFloat(e.target.value)));
        document.getElementById('length').addEventListener('input', (e) => this.setLength(parseFloat(e.target.value)));
        document.getElementById('levels').addEventListener('input', (e) => this.setLevels(parseInt(e.target.value)));
        document.getElementById('rotation').addEventListener('input', (e) => this.setRotation(parseFloat(e.target.value)));
    }

    setStructure(structureType) {
        this.currentHabitat.structure.type = structureType;
        document.querySelectorAll('.structure-option').forEach(opt => opt.classList.remove('active'));
        document.querySelector(`[data-structure="${structureType}"]`).classList.add('active');
        this.updateHabitat();
        console.log(`Habitat structure changed to: ${structureType}`);
    }

    setDiameter(diameter) {
        this.currentHabitat.dimensions.diameter = diameter;
        document.getElementById('diameter-value').textContent = `${diameter.toFixed(1)} m`;
        this.updateHabitat();
    }

    setLength(length) {
        this.currentHabitat.dimensions.length = length;
        document.getElementById('length-value').textContent = `${length.toFixed(1)} m`;
        this.updateHabitat();
    }

    setLevels(levels) {
        this.currentHabitat.dimensions.levels = levels;
        document.getElementById('levels-value').textContent = `${levels} levels`;
        this.updateHabitat();
    }

    setRotation(rpm) {
        this.currentHabitat.performance.artificialGravity = rpm;
        document.getElementById('rotation-value').textContent = `${rpm.toFixed(1)} RPM`;
    }

    updateHabitat() {
        this.calculateMetrics();
        this.updateMetricsDisplay();

        if (window.threeScene) {
            window.threeScene.createHabitat(
                this.currentHabitat.structure.type,
                this.currentHabitat.dimensions.diameter / 2,
                this.currentHabitat.dimensions.length,
                this.currentHabitat.dimensions.levels
            );
        }

        // A chamada para o missionPlanner continua aqui, pois ela só dará erro no construtor.
        if (window.missionPlanner && typeof window.missionPlanner.onHabitatChange === 'function') {
            window.missionPlanner.onHabitatChange(this.getCurrentHabitat());
        }
    }

    calculateMetrics() {
        const { diameter, length, levels } = this.currentHabitat.dimensions;
        const radius = diameter / 2;
        const totalVolume = Math.PI * Math.pow(radius, 2) * length;
        const netHabitableVolume = totalVolume * 0.8;
        const floorArea = (Math.PI * Math.pow(radius, 2)) * levels;
        const massEstimate = totalVolume * 0.03;
        this.currentHabitat.performance = {
            ...this.currentHabitat.performance,
            totalVolume,
            netHabitableVolume,
            floorArea,
            massEstimate
        };
    }

    updateMetricsDisplay() {
        const { totalVolume, netHabitableVolume, floorArea, massEstimate } = this.currentHabitat.performance;
        const crewSize = window.missionPlanner ? window.missionPlanner.getCurrentMission().crewSize : 4;
        document.getElementById('total-volume').textContent = `${totalVolume.toFixed(0)} m³`;
        document.getElementById('nhv-metric').textContent = `${netHabitableVolume.toFixed(0)} m³`;
        document.getElementById('floor-area').textContent = `${floorArea.toFixed(0)} m²`;
        document.getElementById('mass-estimate').textContent = `${massEstimate.toFixed(1)} t`;
        document.getElementById('volume-per-crew').textContent = `${(netHabitableVolume / crewSize).toFixed(1)} m³`;
    }

    getCurrentHabitat() {
        return { ...this.currentHabitat };
    }
    
    getRotationSpeed() {
        return this.currentHabitat.performance.artificialGravity;
    }
}