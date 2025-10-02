/**
 * Layout Optimization Module
 * Based on NASA automated layout evaluation tools and adjacency analysis
 */

class LayoutOptimizer {
    constructor() {
        this.currentLayout = [];
        this.optimizationHistory = [];
        this.adjacencyMatrix = this.initializeAdjacencyMatrix();
        
        this.nasaStandards = new NASAStandards();
        this.initEventListeners();
    }

    initializeAdjacencyMatrix() {
        return {
            // High positive scores (4-5): Critical adjacencies
            'galley-dining': { score: 5, reason: 'Food preparation and consumption workflow' },
            'sleep-hygiene': { score: 5, reason: 'Morning and evening routines' },
            'work-control': { score: 5, reason: 'Operational efficiency' },
            'medical-sleep': { score: 4, reason: 'Emergency access' },
            
            // Medium positive scores (2-3): Beneficial adjacencies
            'eclss-storage': { score: 3, reason: 'Supply access for life support' },
            'work-storage': { score: 3, reason: 'Equipment and supply access' },
            'exercise-recreation': { score: 3, reason: 'Activity grouping' },
            'greenhouse-eclss': { score: 2, reason: 'Life support integration' },
            
            // Negative scores: Avoid these adjacencies
            'sleep-exercise': { score: -4, reason: 'Noise disturbance during rest' },
            'sleep-work': { score: -4, reason: 'Work-life separation' },
            'galley-hygiene': { score: -5, reason: 'Hygiene concerns' },
            'dining-hygiene': { score: -5, reason: 'Hygiene concerns' },
            'medical-exercise': { score: -3, reason: 'Activity conflict' },
            'control-recreation': { score: -2, reason: 'Distraction from operations' }
        };
    }

    initEventListeners() {
        document.getElementById('optimize-layout')?.addEventListener('click', () => {
            this.optimizeLayout();
        });

        document.getElementById('generate-alternatives')?.addEventListener('click', () => {
            this.generateAlternativeLayouts();
        });

        document.getElementById('reset-layout')?.addEventListener('click', () => {
            this.resetToDefaultLayout();
        });
    }

    optimizeLayout() {
        const areas = window.interiorDesigner ? 
            Array.from(window.interiorDesigner.functionalAreas.values()) : [];
        
        if (areas.length === 0) {
            alert('Please add functional areas to the layout first');
            return;
        }

        console.log('Starting layout optimization...');

        // Store current layout for comparison
        const currentScore = this.calculateLayoutScore(areas);
        this.optimizationHistory.push({
            timestamp: new Date().toISOString(),
            score: currentScore,
            layout: this.snapshotLayout(areas)
        });

        // Run optimization algorithm
        const optimizedLayout = this.runOptimizationAlgorithm(areas);
        
        // Apply optimized layout
        this.applyOptimizedLayout(optimizedLayout);
        
        // Update metrics display
        this.updateOptimizationMetrics(optimizedLayout);
        
        console.log(`Layout optimized. Score improved from ${currentScore} to ${this.calculateLayoutScore(optimizedLayout)}`);
    }

    runOptimizationAlgorithm(areas) {
        // Simple simulated annealing approach for layout optimization
        let currentLayout = [...areas];
        let currentScore = this.calculateLayoutScore(currentLayout);
        let temperature = 1.0;
        const coolingRate = 0.95;
        const iterations = 100;

        for (let i = 0; i < iterations; i++) {
            // Generate neighbor layout by swapping two random areas
            const neighborLayout = this.generateNeighborLayout([...currentLayout]);
            const neighborScore = this.calculateLayoutScore(neighborLayout);

            // Accept neighbor if it's better or with probability based on temperature
            if (neighborScore > currentScore || 
                Math.exp((neighborScore - currentScore) / temperature) > Math.random()) {
                currentLayout = neighborLayout;
                currentScore = neighborScore;
            }

            // Cool down
            temperature *= coolingRate;
        }

        return currentLayout;
    }

    generateNeighborLayout(layout) {
        if (layout.length < 2) return layout;

        // Swap positions of two random areas
        const index1 = Math.floor(Math.random() * layout.length);
        let index2 = Math.floor(Math.random() * layout.length);
        while (index2 === index1) {
            index2 = Math.floor(Math.random() * layout.length);
        }

        // Swap positions
        const tempPos = layout[index1].position.clone();
        layout[index1].position.copy(layout[index2].position);
        layout[index2].position.copy(tempPos);

        return layout;
    }

    calculateLayoutScore(areas) {
        let totalScore = 0;
        let pairCount = 0;

        // Calculate adjacency scores for all area pairs
        for (let i = 0; i < areas.length; i++) {
            for (let j = i + 1; j < areas.length; j++) {
                const area1 = areas[i];
                const area2 = areas[j];
                const pairScore = this.calculatePairScore(area1, area2);
                
                totalScore += pairScore;
                pairCount++;
            }
        }

        // Normalize score to 0-100 range
        const averageScore = pairCount > 0 ? totalScore / pairCount : 0;
        const normalizedScore = Math.max(0, Math.min(100, (averageScore + 5) * 10));

        return Math.round(normalizedScore);
    }

    calculatePairScore(area1, area2) {
        const type1 = area1.config.name.toLowerCase().replace(' ', '-');
        const type2 = area2.config.name.toLowerCase().replace(' ', '-');
        
        // Check both orderings of the pair
        const pairKey1 = `${type1}-${type2}`;
        const pairKey2 = `${type2}-${type1}`;
        
        const adjacency = this.adjacencyMatrix[pairKey1] || this.adjacencyMatrix[pairKey2];
        
        if (adjacency) {
            const distance = area1.position.distanceTo(area2.position);
            return this.adjustScoreForDistance(adjacency.score, distance);
        }

        return 0; // Neutral score for unlisted pairs
    }

    adjustScoreForDistance(baseScore, distance) {
        // Adjust score based on actual distance between areas
        if (baseScore > 0) {
            // Positive adjacencies prefer shorter distances
            return baseScore * Math.max(0, (8 - distance) / 8);
        } else if (baseScore < 0) {
            // Negative adjacencies prefer longer distances
            return baseScore * Math.max(0, distance / 8);
        }
        return 0;
    }

    applyOptimizedLayout(optimizedAreas) {
        if (!window.threeScene || !window.interiorDesigner) return;

        // Update positions in Three.js scene
        optimizedAreas.forEach(area => {
            const existingArea = window.interiorDesigner.functionalAreas.get(area.config.name);
            if (existingArea && existingArea.mesh) {
                existingArea.mesh.position.copy(area.position);
                existingArea.position.copy(area.position);
            }
        });

        // Update equipment positions relative to their areas
        this.updateEquipmentPositions();

        // Refresh the scene
        window.threeScene.controls.update();
    }

    updateEquipmentPositions() {
        // This would reposition equipment based on their parent areas
        // Implementation depends on equipment-area relationships
    }

    updateOptimizationMetrics(optimizedLayout) {
        const score = this.calculateLayoutScore(optimizedLayout);
        const trafficFlow = this.assessTrafficFlow(optimizedLayout);
        const privacyScore = this.assessPrivacyZones(optimizedLayout);

        // Update metrics display
        document.getElementById('adjacency-score').textContent = `${score}%`;
        document.getElementById('traffic-flow').textContent = trafficFlow;
        document.getElementById('privacy-score').textContent = privacyScore;

        // Update score color based on value
        const scoreElement = document.getElementById('adjacency-score');
        scoreElement.className = score >= 80 ? 'good' : score >= 60 ? 'fair' : 'poor';
    }

    assessTrafficFlow(layout) {
        // Simplified traffic flow assessment
        const highTrafficAreas = ['galley', 'dining', 'hygiene', 'control'];
        let flowScore = 0;

        layout.forEach(area => {
            if (highTrafficAreas.includes(area.config.name)) {
                // Check if high-traffic areas are reasonably accessible
                const accessibility = this.calculateAccessibility(area, layout);
                flowScore += accessibility;
            }
        });

        const averageFlow = flowScore / highTrafficAreas.length;
        
        if (averageFlow >= 0.8) return 'Excellent';
        if (averageFlow >= 0.6) return 'Good';
        if (averageFlow >= 0.4) return 'Fair';
        return 'Poor';
    }

    assessPrivacyZones(layout) {
        const privateAreas = ['sleep', 'medical', 'hygiene'];
        let privacyScore = 0;

        layout.forEach(area => {
            if (privateAreas.includes(area.config.name)) {
                const isolation = this.calculateIsolation(area, layout);
                privacyScore += isolation;
            }
        });

        const averagePrivacy = privacyScore / privateAreas.length;
        
        if (averagePrivacy >= 0.8) return 'Excellent';
        if (averagePrivacy >= 0.6) return 'Good';
        if (averagePrivacy >= 0.4) return 'Adequate';
        return 'Inadequate';
    }

    calculateAccessibility(area, layout) {
        // Calculate how accessible an area is from other important areas
        let totalDistance = 0;
        let connectionCount = 0;

        layout.forEach(otherArea => {
            if (otherArea !== area) {
                const distance = area.position.distanceTo(otherArea.position);
                totalDistance += distance;
                connectionCount++;
            }
        });

        const averageDistance = connectionCount > 0 ? totalDistance / connectionCount : 0;
        return Math.max(0, 1 - averageDistance / 10); // Normalize to 0-1
    }

    calculateIsolation(area, layout) {
        // Calculate how isolated an area is from non-private areas
        let minDistance = Infinity;

        layout.forEach(otherArea => {
            if (otherArea !== area && !['sleep', 'medical', 'hygiene'].includes(otherArea.config.name)) {
                const distance = area.position.distanceTo(otherArea.position);
                minDistance = Math.min(minDistance, distance);
            }
        });

        return Math.min(1, minDistance / 8); // Normalize to 0-1
    }

    generateAlternativeLayouts() {
        const areas = window.interiorDesigner ? 
            Array.from(window.interiorDesigner.functionalAreas.values()) : [];
        
        if (areas.length === 0) return;

        console.log('Generating alternative layouts...');

        const alternatives = [];
        const numAlternatives = 3;

        for (let i = 0; i < numAlternatives; i++) {
            const alternative = this.generateRandomLayout([...areas]);
            const score = this.calculateLayoutScore(alternative);
            
            alternatives.push({
                layout: alternative,
                score: score,
                description: this.generateLayoutDescription(alternative)
            });
        }

        // Sort by score (descending)
        alternatives.sort((a, b) => b.score - a.score);

        // Display alternatives to user
        this.displayLayoutAlternatives(alternatives);
    }

    generateRandomLayout(areas) {
        const layout = [...areas];
        const habitat = window.habitatBuilder?.getCurrentHabitat();
        const radius = habitat ? habitat.diameter / 2 - 1 : 5;

        // Randomize positions
        layout.forEach(area => {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * radius * 0.8;
            
            area.position.set(
                Math.cos(angle) * distance,
                0,
                Math.sin(angle) * distance
            );
        });

        return layout;
    }

    generateLayoutDescription(layout) {
        const score = this.calculateLayoutScore(layout);
        
        if (score >= 80) {
            return 'Excellent layout with optimal adjacencies and traffic flow';
        } else if (score >= 60) {
            return 'Good layout with most critical adjacencies satisfied';
        } else if (score >= 40) {
            return 'Fair layout with some adjacency issues to address';
        } else {
            return 'Poor layout requiring significant optimization';
        }
    }

    displayLayoutAlternatives(alternatives) {
        // Create modal or panel to display alternatives
        const modalHTML = `
            <div class="layout-alternatives-modal">
                <h3>Alternative Layout Options</h3>
                <div class="alternatives-list">
                    ${alternatives.map((alt, index) => `
                        <div class="alternative-option">
                            <h4>Option ${index + 1} (Score: ${alt.score}%)</h4>
                            <p>${alt.description}</p>
                            <button onclick="window.layoutOptimizer.applyAlternativeLayout(${index})">
                                Apply This Layout
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button onclick="this.parentElement.remove()">Close</button>
            </div>
        `;

        // Add styles for the modal
        const style = document.createElement('style');
        style.textContent = `
            .layout-alternatives-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(30, 30, 50, 0.95);
                padding: 20px;
                border-radius: 10px;
                border: 2px solid var(--nasa-blue);
                z-index: 1000;
                max-width: 500px;
                max-height: 80vh;
                overflow-y: auto;
            }
            .alternatives-list {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin: 15px 0;
            }
            .alternative-option {
                background: rgba(50, 50, 70, 0.6);
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid var(--nasa-green);
            }
        `;

        document.head.appendChild(style);
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    applyAlternativeLayout(alternativeIndex) {
        const alternatives = this.optimizationHistory
            .filter(entry => entry.layout)
            .slice(-3); // Get last 3 alternatives

        if (alternatives[alternativeIndex]) {
            this.applyOptimizedLayout(alternatives[alternativeIndex].layout);
            document.querySelector('.layout-alternatives-modal')?.remove();
        }
    }

    resetToDefaultLayout() {
        if (window.interiorDesigner) {
            window.interiorDesigner.regenerateLayoutForMission(
                window.missionPlanner.getCurrentMission()
            );
        }
        
        this.updateOptimizationMetrics(
            Array.from(window.interiorDesigner.functionalAreas.values())
        );
    }

    snapshotLayout(areas) {
        return areas.map(area => ({
            config: area.config,
            position: area.position.clone(),
            mesh: area.mesh // Note: In real implementation, we might not want to store the mesh
        }));
    }

    generateOptimizationReport() {
        const areas = window.interiorDesigner ? 
            Array.from(window.interiorDesigner.functionalAreas.values()) : [];
        
        const score = this.calculateLayoutScore(areas);
        const trafficFlow = this.assessTrafficFlow(areas);
        const privacyScore = this.assessPrivacyZones(areas);

        return {
            timestamp: new Date().toISOString(),
            overallScore: score,
            metrics: {
                trafficFlow: trafficFlow,
                privacyZones: privacyScore,
                adjacencyCompliance: this.calculateAdjacencyCompliance(areas)
            },
            recommendations: this.generateOptimizationRecommendations(areas),
            areas: areas.map(area => ({
                type: area.config.name,
                position: area.position.toArray(),
                category: area.config.category
            }))
        };
    }

    calculateAdjacencyCompliance(areas) {
        let compliantPairs = 0;
        let totalPairs = 0;

        for (let i = 0; i < areas.length; i++) {
            for (let j = i + 1; j < areas.length; j++) {
                const pairScore = this.calculatePairScore(areas[i], areas[j]);
                if (pairScore > 0) {
                    compliantPairs++;
                }
                totalPairs++;
            }
        }

        return totalPairs > 0 ? Math.round((compliantPairs / totalPairs) * 100) : 100;
    }

    generateOptimizationRecommendations(areas) {
        const recommendations = [];
        const issues = this.identifyLayoutIssues(areas);

        issues.forEach(issue => {
            recommendations.push({
                issue: issue.description,
                severity: issue.severity,
                suggestion: issue.suggestion
            });
        });

        if (recommendations.length === 0) {
            recommendations.push({
                issue: 'No major layout issues identified',
                severity: 'low',
                suggestion: 'Current layout meets NASA habitability guidelines'
            });
        }

        return recommendations;
    }

    identifyLayoutIssues(areas) {
        const issues = [];

        // Check for critical adjacency violations
        Object.entries(this.adjacencyMatrix).forEach(([pair, data]) => {
            if (data.score < -3) { // Critical negative adjacencies
                const [type1, type2] = pair.split('-');
                
                const area1 = areas.find(a => a.config.name.toLowerCase().includes(type1));
                const area2 = areas.find(a => a.config.name.toLowerCase().includes(type2));
                
                if (area1 && area2) {
                    const distance = area1.position.distanceTo(area2.position);
                    if (distance < 4) {
                        issues.push({
                            description: `${area1.config.name} and ${area2.config.name} are too close`,
                            severity: 'high',
                            suggestion: `Increase separation between ${area1.config.name} and ${area2.config.name} to at least 4 meters`
                        });
                    }
                }
            }
        });

        return issues;
    }
}