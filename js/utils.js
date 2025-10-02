/**
 * Utility Functions and Data Management
 * Common utilities for the Space Habitat Design Tool
 */

class HabitatUtils {
    static calculateCylinderVolume(radius, height) {
        return Math.PI * radius * radius * height;
    }

    static calculateSphereVolume(radius) {
        return (4/3) * Math.PI * Math.pow(radius, 3);
    }

    static calculateTorusVolume(majorRadius, minorRadius) {
        return 2 * Math.PI * Math.PI * majorRadius * minorRadius * minorRadius;
    }

    static calculateFloorArea(radius, levels) {
        return Math.PI * radius * radius * levels;
    }

    static calculateArtificialGravity(radius, rpm) {
        if (rpm === 0) return 0;
        const angularVelocity = (rpm * 2 * Math.PI) / 60;
        return (angularVelocity * angularVelocity * radius) / 9.81;
    }

    static formatNumber(num, decimals = 0) {
        return num.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    }

    static generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    }

    static downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    static downloadPDF(data, filename) {
        // Simplified PDF generation - in real implementation, use a PDF library
        const content = this.generatePDFContent(data);
        const blob = new Blob([content], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    static generatePDFContent(data) {
        // Simple text-based PDF content generation
        // In real implementation, use libraries like jsPDF or pdfkit
        let content = `NASA Space Habitat Design Report\n`;
        content += `Generated: ${new Date().toLocaleDateString()}\n\n`;
        
        content += `MISSION OVERVIEW\n`;
        content += `Destination: ${data.mission.destination}\n`;
        content += `Crew Size: ${data.mission.crewSize}\n`;
        content += `Duration: ${data.mission.duration} days\n\n`;
        
        content += `HABITAT SPECIFICATIONS\n`;
        content += `Structure: ${data.habitat.structure.type}\n`;
        content += `Dimensions: ${data.habitat.dimensions.diameter}m diameter × ${data.habitat.dimensions.length}m length\n`;
        content += `Levels: ${data.habitat.dimensions.levels}\n`;
        content += `Total Volume: ${Math.round(data.habitat.performance.totalVolume)} m³\n`;
        content += `Net Habitable Volume: ${Math.round(data.habitat.performance.netHabitableVolume)} m³\n`;
        content += `Mass: ${data.habitat.performance.mass.toFixed(1)} tons\n\n`;
        
        content += `COMPLIANCE ASSESSMENT\n`;
        data.compliance.assessments.forEach(assessment => {
            content += `${assessment.category}: ${assessment.status} (${assessment.score}/100)\n`;
        });
        
        content += `Overall Score: ${data.compliance.overallScore}/100\n`;
        
        return content;
    }

    static validateDimensions(shape, diameter, length, construction) {
        const constraints = {
            prefab: { maxDiameter: 8.4, maxLength: 19.1 },
            inflatable: { maxDiameter: 6.0, maxLength: 12.0 },
            isl: { maxDiameter: null, maxLength: null },
            hybrid: { maxDiameter: 7.0, maxLength: 15.0 }
        };

        const constraint = constraints[construction];
        const issues = [];

        if (constraint.maxDiameter && diameter > constraint.maxDiameter) {
            issues.push(`Diameter (${diameter}m) exceeds ${construction} constraint (${constraint.maxDiameter}m)`);
        }

        if (constraint.maxLength && length > constraint.maxLength) {
            issues.push(`Length (${length}m) exceeds ${construction} constraint (${constraint.maxLength}m)`);
        }

        return {
            valid: issues.length === 0,
            issues: issues
        };
    }

    static calculateMassEstimate(volume, structureType, construction) {
        const densityFactors = {
            cylinder: 35,
            sphere: 40,
            torus: 45,
            modular: 38,
            horizontal: 36,
            vertical: 37
        };

        const efficiencyFactors = {
            prefab: 0.8,
            inflatable: 0.6,
            isl: 0.3,
            hybrid: 0.7
        };

        const density = densityFactors[structureType] || 35;
        const efficiency = efficiencyFactors[construction] || 0.7;
        
        return (volume * density * efficiency) / 1000; // Convert to tons
    }

    static getMissionColor(missionType) {
        const colors = {
            'lunar-surface': '#4caf50',
            'mars-transit': '#2196f3',
            'mars-surface': '#ff9800',
            'gateway': '#9c27b0'
        };
        return colors[missionType] || '#666666';
    }

    static getStructureIcon(structureType) {
        const icons = {
            'cylinder': '⭕',
            'sphere': '🔴',
            'torus': '⭕',
            'modular': '🧩',
            'horizontal': '⬌',
            'vertical': '⬍'
        };
        return icons[structureType] || '🏗️';
    }
}

// Data storage and management
class HabitatDataManager {
    constructor() {
        this.currentDesign = null;
        this.designs = this.loadDesigns();
    }

    loadDesigns() {
        try {
            return JSON.parse(localStorage.getItem('nasaHabitatDesigns') || '[]');
        } catch (error) {
            console.error('Error loading designs:', error);
            return [];
        }
    }

    saveDesigns() {
        try {
            localStorage.setItem('nasaHabitatDesigns', JSON.stringify(this.designs));
        } catch (error) {
            console.error('Error saving designs:', error);
        }
    }

    saveDesign(designData) {
        try {
            const design = {
                id: designData.id || HabitatUtils.generateId(),
                name: designData.name || `Habitat Design ${new Date().toLocaleDateString()}`,
                data: designData,
                timestamp: new Date().toISOString(),
                version: '1.0'
            };

            // Update existing or add new
            const existingIndex = this.designs.findIndex(d => d.id === design.id);
            if (existingIndex >= 0) {
                this.designs[existingIndex] = design;
            } else {
                this.designs.push(design);
            }

            this.currentDesign = design;
            this.saveDesigns();

            return design.id;
        } catch (error) {
            console.error('Error saving design:', error);
            return null;
        }
    }

    loadDesign(id) {
        const design = this.designs.find(d => d.id === id);
        if (design) {
            this.currentDesign = design;
        }
        return design;
    }

    deleteDesign(id) {
        this.designs = this.designs.filter(d => d.id !== id);
        this.saveDesigns();
        
        if (this.currentDesign && this.currentDesign.id === id) {
            this.currentDesign = null;
        }
    }

    getAllDesigns() {
        return this.designs.map(design => ({
            id: design.id,
            name: design.name,
            timestamp: design.timestamp,
            mission: design.data.mission,
            habitat: design.data.habitat
        }));
    }

    exportDesign(id, format = 'json') {
        const design = this.loadDesign(id);
        if (!design) return null;

        const filename = `nasa_habitat_design_${design.id}.${format}`;

        if (format === 'json') {
            HabitatUtils.downloadJSON(design.data, filename);
        } else if (format === 'pdf') {
            HabitatUtils.downloadPDF(design.data, filename);
        }

        return filename;
    }

    importDesign(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const designData = JSON.parse(e.target.result);
                    const designId = this.saveDesign(designData);
                    resolve(this.loadDesign(designId));
                } catch (error) {
                    reject(new Error('Invalid design file format'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }

    generateDesignSummary(design) {
        const habitat = design.habitat;
        const mission = design.mission;

        return {
            id: design.id,
            name: design.name,
            mission: `${mission.destination} - ${mission.crewSize} crew, ${mission.duration} days`,
            habitat: `${habitat.structure.type} - ${Math.round(habitat.performance.totalVolume)} m³, ${habitat.performance.mass.toFixed(1)} t`,
            compliance: design.compliance?.overallScore || 'Not assessed',
            timestamp: design.timestamp
        };
    }

    // Backup and restore functionality
    exportAllDesigns() {
        const backup = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            designs: this.designs
        };

        HabitatUtils.downloadJSON(backup, 'nasa_habitat_designs_backup.json');
    }

    importBackup(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backup = JSON.parse(e.target.result);
                    if (backup.designs && Array.isArray(backup.designs)) {
                        this.designs = backup.designs;
                        this.saveDesigns();
                        resolve(this.designs.length);
                    } else {
                        reject(new Error('Invalid backup file format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Error reading backup file'));
            reader.readAsText(file);
        });
    }
}

// Notification system
class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        this.container = document.createElement('div');
        this.container.className = 'notification-container';
        this.container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 300px;
        `;
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            background: ${this.getBackgroundColor(type)};
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
            border-left: 4px solid ${this.getBorderColor(type)};
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <span style="font-size: 1.2em;">${this.getIcon(type)}</span>
                <span>${message}</span>
            </div>
        `;

        this.container.appendChild(notification);

        // Auto-remove after duration
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);

        return notification;
    }

    getBackgroundColor(type) {
        const colors = {
            success: 'rgba(76, 175, 80, 0.9)',
            error: 'rgba(244, 67, 54, 0.9)',
            warning: 'rgba(255, 152, 0, 0.9)',
            info: 'rgba(33, 150, 243, 0.9)'
        };
        return colors[type] || colors.info;
    }

    getBorderColor(type) {
        const colors = {
            success: '#4caf50',
            error: '#f44336',
            warning: '#ff9800',
            info: '#2196f3'
        };
        return colors[type] || colors.info;
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }
}

// Add CSS animations for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HabitatUtils,
        HabitatDataManager,
        NotificationSystem
    };
}