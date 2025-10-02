/**
 * Main Application Controller
 * Coordinates all modules and manages the overall application state
 */

class SpaceHabitatApp {
    constructor() {
        this.dataManager = new HabitatDataManager();
        this.notificationSystem = new NotificationSystem();
        this.isInitialized = false;

        this.modules = {
            missionPlanner: null,
            habitatBuilder: null,
            threeScene: null,
            interiorDesigner: null,
            layoutOptimizer: null
        };

        this.init();
    }

    async init() {
        try {
            this.showLoadingState();

            console.log('Starting application initialization...');

            // Initialize modules in correct sequence
            await this.initializeModules();

            // Verify all modules are ready
            if (!this.checkModuleReadiness()) {
                throw new Error('Some modules failed to initialize properly');
            }

            this.setupGlobalEventListeners();
            this.setupUIInteractions();
            this.setupErrorHandling();

            this.isInitialized = true;
            this.hideLoadingState();

            this.notificationSystem.show(
                'NASA Space Habitat Design Tool Ready',
                'success',
                3000
            );

            console.log('Space Habitat Design Tool initialized successfully');

        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.notificationSystem.show(
                'Error initializing application: ' + error.message,
                'error'
            );

            // Show more detailed error info
            this.showErrorDetails(error);
        }
    }

    showErrorDetails(error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(244, 67, 54, 0.9);
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 10001;
        max-width: 500px;
        text-align: center;
    `;
        errorDiv.innerHTML = `
        <h3>Initialization Error</h3>
        <p>${error.message}</p>
        <p style="font-size: 0.9em; margin-top: 10px;">
            Please refresh the page to try again.
        </p>
        <button onclick="location.reload()" style="
            background: white;
            color: #f44336;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 15px;
            cursor: pointer;
        ">Reload Page</button>
    `;
        document.body.appendChild(errorDiv);
    }

    showLoadingState() {
        // Create loading overlay
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(10, 15, 25, 0.95);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            color: white;
            font-size: 1.2rem;
        `;

        loadingOverlay.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 3rem; margin-bottom: 20px;">🚀</div>
                <h2>NASA Space Habitat Design Tool</h2>
                <p>Initializing Moon to Mars Architecture...</p>
                <div style="margin-top: 20px; width: 200px; height: 4px; background: rgba(255,255,255,0.2); border-radius: 2px;">
                    <div style="width: 100%; height: 100%; background: var(--nasa-blue); border-radius: 2px; animation: pulse 1.5s infinite;"></div>
                </div>
            </div>
        `;

        // Add pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(loadingOverlay);
    }

    hideLoadingState() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => loadingOverlay.remove(), 500);
        }
    }

    async initializeModules() {
        const initializationTimeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Initialization timeout')), 10000);
        });

        try {
            await Promise.race([this.initializeModulesSequence(), initializationTimeout]);
        } catch (error) {
            throw new Error(`Module initialization failed: ${error.message}`);
        }
    }

    async initializeModulesSequence() {
        // Create global references
        window.habitatUtils = HabitatUtils;
        window.habitatDataManager = this.dataManager;
        window.notificationSystem = this.notificationSystem;

        console.log('Step 1: Initializing Mission Planner...');
        this.modules.missionPlanner = new MissionPlanner();
        window.missionPlanner = this.modules.missionPlanner;

        console.log('Step 2: Initializing Habitat Builder...');
        this.modules.habitatBuilder = new HabitatBuilder();
        window.habitatBuilder = this.modules.habitatBuilder;

        console.log('Step 3: Initializing 3D Scene...');
        this.modules.threeScene = new ThreeJSScene('visualization-container');
        window.threeScene = this.modules.threeScene;

        console.log('Step 4: Initializing Interior Designer...');
        this.modules.interiorDesigner = new InteriorDesigner();
        window.interiorDesigner = this.modules.interiorDesigner;

        console.log('Step 5: Initializing Layout Optimizer...');
        this.modules.layoutOptimizer = new LayoutOptimizer();
        window.layoutOptimizer = this.modules.layoutOptimizer;

        console.log('All modules initialized, performing final setup...');

        // Final setup after all modules are ready
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setupGlobalEventListeners() {
        // View controls
        document.getElementById('view-exterior')?.addEventListener('click', () => {
            this.modules.interiorDesigner.switchToExteriorView();
        });

        document.getElementById('view-interior')?.addEventListener('click', () => {
            this.modules.interiorDesigner.switchToInteriorView();
        });

        document.getElementById('view-top')?.addEventListener('click', () => {
            this.modules.threeScene.setView('top');
        });

        document.getElementById('view-side')?.addEventListener('click', () => {
            this.modules.threeScene.setView('side');
        });

        document.getElementById('view-3d')?.addEventListener('click', () => {
            this.modules.threeScene.setView('3d');
        });

        document.getElementById('toggle-grid')?.addEventListener('click', () => {
            this.modules.threeScene.toggleGrid();
        });

        document.getElementById('toggle-structure')?.addEventListener('click', () => {
            this.toggleStructureVisibility();
        });

        // Action buttons
        document.getElementById('save-design')?.addEventListener('click', () => {
            this.saveCurrentDesign();
        });

        document.getElementById('export-report')?.addEventListener('click', () => {
            this.exportDesignReport();
        });

        document.getElementById('validate-design')?.addEventListener('click', () => {
            this.validateWithNASAStandards();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Window resize with debounce
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleWindowResize();
            }, 250);
        });

        // Before unload warning
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        });
    }

    setupUIInteractions() {
        // Add tooltips to important controls
        this.addTooltips();

        // Setup tab switching
        this.setupTabSystem();

        // Setup drag and drop enhancements
        this.setupEnhancedDragAndDrop();
    }

    addTooltips() {
        const tooltips = {
            'crew-size': 'Number of astronauts the habitat must support. Affects volume requirements and layout.',
            'mission-duration': 'Length of mission in days. Longer missions require more amenities and space.',
            'eva-frequency': 'Expected number of Extra-Vehicular Activities per week. Affects airlock design.',
            'diameter': 'Habitat diameter in meters. Constrained by launch vehicle fairing size.',
            'length': 'Habitat length in meters. Affects internal layout and structural integrity.',
            'levels': 'Number of internal decks or levels. Increases usable floor area.',
            'rotation': 'Rotation speed for artificial gravity simulation. 2-3 RPM typical for comfort.'
        };

        Object.entries(tooltips).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) {
                element.title = text;
            }
        });
    }

    setupTabSystem() {
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update tab UI
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Tab-specific initialization
        switch (tabName) {
            case 'analysis':
                this.updateHabitabilityAnalysis();
                break;
            case 'layout':
                this.updateLayoutOptimization();
                break;
        }
    }

    setupEnhancedDragAndDrop() {
        // Add visual feedback for drag operations
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('area-option') ||
                e.target.classList.contains('equipment-item')) {
                document.body.classList.add('drag-in-progress');
            }
        });

        document.addEventListener('dragend', (e) => {
            document.body.classList.remove('drag-in-progress');
        });

        // Add drop zone highlighting
        const sceneContainer = document.getElementById('visualization-container');
        if (sceneContainer) {
            sceneContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                sceneContainer.classList.add('drop-zone-active');
            });

            sceneContainer.addEventListener('dragleave', (e) => {
                sceneContainer.classList.remove('drop-zone-active');
            });

            sceneContainer.addEventListener('drop', (e) => {
                sceneContainer.classList.remove('drop-zone-active');
            });
        }
    }

    setupErrorHandling() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.notificationSystem.show(
                'An unexpected error occurred. Please refresh the page.',
                'error'
            );
        });

        // Promise rejection handler
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            this.notificationSystem.show(
                'An operation failed to complete. Please try again.',
                'error'
            );
        });
    }

    handleKeyboardShortcuts(event) {
        // Ctrl+S to save
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            this.saveCurrentDesign();
        }

        // Ctrl+E to export
        if (event.ctrlKey && event.key === 'e') {
            event.preventDefault();
            this.exportDesignReport();
        }

        // Ctrl+D to validate
        if (event.ctrlKey && event.key === 'd') {
            event.preventDefault();
            this.validateWithNASAStandards();
        }

        // Escape to clear selection
        if (event.key === 'Escape') {
            this.clearSelection();
        }

        // Tab navigation
        if (event.ctrlKey && event.key >= '1' && event.key <= '4') {
            event.preventDefault();
            const tabIndex = parseInt(event.key) - 1;
            const tabs = ['functions', 'layout', 'objects', 'analysis'];
            this.switchTab(tabs[tabIndex]);
        }
    }

    handleWindowResize() {
        // Handle responsive layout adjustments
        if (this.modules.threeScene) {
            this.modules.threeScene.onWindowResize();
        }
    }

    saveCurrentDesign() {
        try {
            const mission = this.modules.missionPlanner.getCurrentMission();
            const habitat = this.modules.habitatBuilder.getCurrentHabitat();
            const interior = this.modules.interiorDesigner.getInteriorData();
            const layout = this.modules.layoutOptimizer.generateOptimizationReport();

            const designData = {
                mission,
                habitat,
                interior,
                layout,
                compliance: this.generateComplianceReport(),
                timestamp: new Date().toISOString()
            };

            const designId = this.dataManager.saveDesign(designData);

            this.notificationSystem.show(
                `Design saved successfully (ID: ${designId.slice(-6)})`,
                'success',
                3000
            );

            return designId;
        } catch (error) {
            console.error('Error saving design:', error);
            this.notificationSystem.show(
                'Error saving design: ' + error.message,
                'error'
            );
            return null;
        }
    }

    async exportDesignReport() {
        try {
            const design = this.saveCurrentDesign();
            if (!design) return;

            // Generate comprehensive report
            const report = this.generateDesignReport();

            // Export as PDF
            this.dataManager.exportDesign(design, 'pdf');

            this.notificationSystem.show(
                'Design report exported successfully',
                'success',
                3000
            );
        } catch (error) {
            console.error('Error exporting report:', error);
            this.notificationSystem.show(
                'Error exporting report: ' + error.message,
                'error'
            );
        }
    }

    validateWithNASAStandards() {
        try {
            const mission = this.modules.missionPlanner.getCurrentMission();
            const habitat = this.modules.habitatBuilder.getCurrentHabitat();

            const nasaStandards = new NASAStandards();
            const report = nasaStandards.generateComplianceReport(habitat, mission);

            // Display validation results
            this.displayValidationResults(report);

            this.notificationSystem.show(
                `NASA Standards Validation Complete: ${report.overallScore}/100`,
                report.overallScore >= 80 ? 'success' : 'warning',
                5000
            );

        } catch (error) {
            console.error('Error validating design:', error);
            this.notificationSystem.show(
                'Error validating design: ' + error.message,
                'error'
            );
        }
    }

    displayValidationResults(report) {
        // Create validation results modal
        const modalHTML = `
            <div class="validation-modal">
                <h3>NASA Standards Compliance Report</h3>
                <div class="validation-score">
                    Overall Score: <span class="score-${report.overallScore >= 80 ? 'high' : report.overallScore >= 60 ? 'medium' : 'low'}">${report.overallScore}/100</span>
                </div>
                <div class="validation-details">
                    ${report.assessments.map(assessment => `
                        <div class="assessment-item ${assessment.status}">
                            <span class="status-icon">${assessment.status === 'compliant' ? '✓' : assessment.status === 'warning' ? '⚠' : '✗'}</span>
                            <span class="assessment-category">${assessment.category}</span>
                            <span class="assessment-score">${assessment.score}/100</span>
                            <div class="assessment-message">${assessment.message}</div>
                        </div>
                    `).join('')}
                </div>
                ${report.recommendations.length > 0 ? `
                    <div class="recommendations">
                        <h4>Recommendations</h4>
                        <ul>
                            ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                <button onclick="this.parentElement.remove()">Close</button>
            </div>
        `;

        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .validation-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(30, 30, 50, 0.95);
                padding: 20px;
                border-radius: 10px;
                border: 2px solid var(--nasa-blue);
                z-index: 1000;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                color: white;
            }
            .validation-score {
                text-align: center;
                font-size: 1.5rem;
                margin: 15px 0;
            }
            .score-high { color: var(--nasa-green); }
            .score-medium { color: var(--nasa-orange); }
            .score-low { color: var(--nasa-red); }
            .assessment-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                margin: 5px 0;
                border-radius: 5px;
                background: rgba(255,255,255,0.1);
            }
            .assessment-item.compliant { border-left: 4px solid var(--nasa-green); }
            .assessment-item.warning { border-left: 4px solid var(--nasa-orange); }
            .assessment-item.non-compliant { border-left: 4px solid var(--nasa-red); }
            .status-icon { font-weight: bold; }
            .assessment-category { flex: 1; font-weight: bold; }
            .assessment-score { color: #ccc; }
            .assessment-message { 
                flex-basis: 100%;
                font-size: 0.9rem;
                margin-top: 5px;
                color: #aaa;
            }
        `;

        document.head.appendChild(style);
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    generateComplianceReport() {
        const mission = this.modules.missionPlanner.getCurrentMission();
        const habitat = this.modules.habitatBuilder.getCurrentHabitat();
        const nasaStandards = new NASAStandards();

        return nasaStandards.generateComplianceReport(habitat, mission);
    }

    generateDesignReport() {
        const mission = this.modules.missionPlanner.getCurrentMission();
        const habitat = this.modules.habitatBuilder.getCurrentHabitat();
        const interior = this.modules.interiorDesigner.getInteriorData();
        const layout = this.modules.layoutOptimizer.generateOptimizationReport();
        const compliance = this.generateComplianceReport();

        return {
            title: 'NASA Space Habitat Design Report',
            mission,
            habitat,
            interior,
            layout,
            compliance,
            generated: new Date().toISOString(),
            references: [
                'NASA Moon to Mars Architecture Definition Document',
                'NextSTEP Habitability Design Guidelines',
                'Net Habitable Volume Requirements (Stromgren et al.)',
                'MMPACT Construction Technology Roadmap'
            ]
        };
    }

    updateHabitabilityAnalysis() {
        // Update the habitability analysis tab with current data
        if (this.modules.interiorDesigner) {
            this.modules.interiorDesigner.updateHabitabilityAssessment();
        }
    }

    updateLayoutOptimization() {
        // Update layout optimization metrics
        if (this.modules.layoutOptimizer) {
            const areas = this.modules.interiorDesigner ?
                Array.from(this.modules.interiorDesigner.functionalAreas.values()) : [];
            this.modules.layoutOptimizer.updateOptimizationMetrics(areas);
        }
    }

    toggleStructureVisibility() {
        // Toggle between wireframe and solid views
        if (this.modules.threeScene && this.modules.threeScene.habitatMesh) {
            const habitat = this.modules.threeScene.habitatMesh;
            habitat.material.wireframe = !habitat.material.wireframe;
        }
    }

    clearSelection() {
        // Clear any current selections in the scene
        if (this.modules.threeScene) {
            // Implementation would depend on selection system
        }
    }

    hasUnsavedChanges() {
        // Check if there are unsaved changes
        // This would track changes since last save
        return false; // Simplified implementation
    }

    // Public API methods
    getCurrentDesign() {
        return this.saveCurrentDesign();
    }

    loadDesign(designId) {
        const design = this.dataManager.loadDesign(designId);
        if (design) {
            // Load mission parameters
            this.modules.missionPlanner.setDestination(design.data.mission.destination);
            this.modules.missionPlanner.setCrewSize(design.data.mission.crewSize);
            this.modules.missionPlanner.setDuration(design.data.mission.duration);
            this.modules.missionPlanner.setConstructionTechnology(design.data.mission.construction);

            // Load habitat parameters
            this.modules.habitatBuilder.setStructure(design.data.habitat.structure.type);
            this.modules.habitatBuilder.setDiameter(design.data.habitat.dimensions.diameter);
            this.modules.habitatBuilder.setLength(design.data.habitat.dimensions.length);
            this.modules.habitatBuilder.setLevels(design.data.habitat.dimensions.levels);
            this.modules.habitatBuilder.setRotation(design.data.habitat.performance.artificialGravity);

            // Load interior layout
            if (design.data.interior) {
                this.modules.interiorDesigner.loadInteriorData(design.data.interior);
            }

            this.notificationSystem.show(
                `Design "${design.name}" loaded successfully`,
                'success',
                3000
            );

            return true;
        }
        return false;
    }

    // Utility methods for external access
    resetApplication() {
        if (confirm('Are you sure you want to reset all design work?')) {
            location.reload();
        }
    }

    getApplicationInfo() {
        return {
            version: '1.0',
            modules: Object.keys(this.modules),
            initialized: this.isInitialized,
            designsCount: this.dataManager.designs.length,
            lastSave: this.dataManager.currentDesign?.timestamp
        };
    }

    checkModuleReadiness() {
        const modules = [
            'missionPlanner',
            'habitatBuilder',
            'threeScene',
            'interiorDesigner',
            'layoutOptimizer'
        ];

        const ready = modules.every(module => {
            const isReady = this.modules[module] !== null;
            if (!isReady) {
                console.warn(`Module ${module} not ready`);
            }
            return isReady;
        });

        console.log('All modules ready:', ready);
        return ready;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.spaceHabitatApp = new SpaceHabitatApp();
});

// Export for module usage if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SpaceHabitatApp;
}