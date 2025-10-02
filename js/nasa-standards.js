/**
 * NASA Standards and Compliance Module
 * Based on Moon to Mars Architecture and Habitability Guidelines
 */

class NASAStandards {
    constructor() {
        this.standards = {
            netHabitableVolume: {
                shortStay: 20, // m³ per crew member
                longDuration: 25, // m³ per crew member
                marsTransit: 30, // m³ per crew member
                reference: "Stromgren et al. - Defining Net Habitable Volume"
            },
            functionalAreas: {
                sleep: { minArea: 4, recommended: 6 },
                hygiene: { minArea: 3, recommended: 4 },
                medical: { minArea: 6, recommended: 8 },
                galley: { minArea: 6, recommended: 8 },
                dining: { minArea: 8, recommended: 10 },
                exercise: { minArea: 10, recommended: 12 },
                work: { minArea: 8, recommended: 10 },
                control: { minArea: 6, recommended: 8 },
                recreation: { minArea: 10, recommended: 12 },
                storage: { minArea: 6, recommended: 8 },
                greenhouse: { minArea: 12, recommended: 15 },
                eclss: { minArea: 8, recommended: 10 }
            },
            adjacencyRequirements: {
                highPriority: [
                    { areas: ['galley', 'dining'], reason: 'Meal preparation and consumption workflow' },
                    { areas: ['sleep', 'hygiene'], reason: 'Morning and evening routines' },
                    { areas: ['medical', 'sleep'], reason: 'Emergency access' },
                    { areas: ['work', 'control'], reason: 'Operational efficiency' }
                ],
                avoidAdjacency: [
                    { areas: ['sleep', 'exercise'], reason: 'Noise disturbance' },
                    { areas: ['sleep', 'work'], reason: 'Work-life separation' },
                    { areas: ['galley', 'hygiene'], reason: 'Hygiene concerns' },
                    { areas: ['dining', 'hygiene'], reason: 'Hygiene concerns' }
                ]
            },
            missionSpecific: {
                lunarSurface: {
                    duration: [30, 180],
                    crewSize: [2, 6],
                    evaFrequency: 'high',
                    construction: ['prefab', 'inflatable', 'isl'],
                    reference: "Artemis Base Camp Requirements"
                },
                marsTransit: {
                    duration: [180, 360],
                    crewSize: [4, 6],
                    evaFrequency: 'none',
                    construction: ['prefab', 'inflatable'],
                    reference: "Deep Space Transport Design"
                },
                marsSurface: {
                    duration: [500, 1000],
                    crewSize: [4, 12],
                    evaFrequency: 'medium',
                    construction: ['isl', 'hybrid', 'prefab'],
                    reference: "Mars Surface Habitat Standards"
                },
                gateway: {
                    duration: [30, 90],
                    crewSize: [2, 4],
                    evaFrequency: 'low',
                    construction: ['prefab'],
                    reference: "Lunar Gateway Specifications"
                }
            },
            technologyReadiness: {
                prefab: { trl: 9, massEfficiency: 0.8, volumeEfficiency: 0.75 },
                inflatable: { trl: 7, massEfficiency: 0.6, volumeEfficiency: 0.9 },
                isl: { trl: 4, massEfficiency: 0.3, volumeEfficiency: 0.95 },
                hybrid: { trl: 5, massEfficiency: 0.7, volumeEfficiency: 0.85 }
            },
            lifeSupport: {
                waterRecycling: { minimum: 0.85, target: 0.98, reference: "ECLSS Standards" },
                oxygenGeneration: { capacity: 0.83, backup: 2, reference: "OGS Requirements" },
                co2Removal: { rate: 1.0, reference: "CDRA Specifications" },
                foodProduction: { required: 2.5, supplemental: 1.0, reference: "Food System Planning" }
            }
        };
    }

    calculateNetHabitableVolume(totalVolume, structureType) {
        const efficiency = this.standards.technologyReadiness[structureType].volumeEfficiency;
        const nhv = totalVolume * efficiency * 0.8; // 80% of efficient volume is habitable
        return Math.max(0, nhv);
    }

    validateCrewAccommodation(missionType, crewSize, duration) {
        // Safe defaults if mission template not found
        const mission = this.standards.missionSpecific[missionType] || {
            crewSize: [2, 6],
            duration: [30, 180]
        };

        const validCrew = crewSize >= mission.crewSize[0] && crewSize <= mission.crewSize[1];
        const validDuration = duration >= mission.duration[0] && duration <= mission.duration[1];

        return {
            valid: validCrew && validDuration,
            issues: [
                !validCrew ? `Crew size ${crewSize} outside recommended range [${mission.crewSize[0]}-${mission.crewSize[1]}]` : null,
                !validDuration ? `Mission duration ${duration} days outside recommended range [${mission.duration[0]}-${mission.duration[1]}]` : null
            ].filter(Boolean)
        };
    }

    assessFunctionalAreaLayout(areas) {
        const assessments = [];
        const areaNames = areas.map(area => area.type);

        // Check required adjacencies
        this.standards.adjacencyRequirements.highPriority.forEach(req => {
            const hasBoth = req.areas.every(area => areaNames.includes(area));
            if (hasBoth) {
                const area1 = areas.find(a => a.type === req.areas[0]);
                const area2 = areas.find(a => a.type === req.areas[1]);
                const distance = this.calculateDistance(area1.position, area2.position);

                if (distance > 8) {
                    assessments.push({
                        type: 'warning',
                        message: `${req.areas[0]} and ${req.areas[1]} are too far apart`,
                        reason: req.reason,
                        recommendation: 'Consider moving closer together'
                    });
                } else {
                    assessments.push({
                        type: 'success',
                        message: `${req.areas[0]} and ${req.areas[1]} properly adjacent`,
                        reason: req.reason
                    });
                }
            }
        });

        // Check avoidances
        this.standards.adjacencyRequirements.avoidAdjacency.forEach(avoid => {
            const hasBoth = avoid.areas.every(area => areaNames.includes(area));
            if (hasBoth) {
                const area1 = areas.find(a => a.type === avoid.areas[0]);
                const area2 = areas.find(a => a.type === avoid.areas[1]);
                const distance = this.calculateDistance(area1.position, area2.position);

                if (distance < 4) {
                    assessments.push({
                        type: 'error',
                        message: `${avoid.areas[0]} and ${avoid.areas[1]} are too close`,
                        reason: avoid.reason,
                        recommendation: 'Increase separation distance'
                    });
                }
            }
        });

        return assessments;
    }

    calculateDistance(pos1, pos2) {
        if (!pos1 || !pos2) return Infinity;
        const dx = pos1.x - pos2.x;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dz * dz);
    }

    generateComplianceReport(habitatData, missionData) {
        const report = {
            timestamp: new Date().toISOString(),
            mission: missionData,
            habitat: habitatData,
            assessments: [],
            overallScore: 0,
            recommendations: []
        };

        // NHV Assessment
        const requiredNHV = this.standards.netHabitableVolume[missionData.duration > 180 ? 'longDuration' : 'shortStay'] * missionData.crewSize;
        const actualNHV = this.calculateNetHabitableVolume(habitatData.volume, habitatData.construction);
        const nhvRatio = actualNHV / requiredNHV;

        if (nhvRatio >= 1) {
            report.assessments.push({
                category: 'Volume',
                status: 'compliant',
                message: `Net Habitable Volume exceeds requirements (${actualNHV.toFixed(1)} m³ vs ${requiredNHV} m³ required)`,
                score: 100
            });
        } else if (nhvRatio >= 0.8) {
            report.assessments.push({
                category: 'Volume',
                status: 'warning',
                message: `Net Habitable Volume marginal (${actualNHV.toFixed(1)} m³ vs ${requiredNHV} m³ required)`,
                score: Math.round(nhvRatio * 100)
            });
        } else {
            report.assessments.push({
                category: 'Volume',
                status: 'non-compliant',
                message: `Insufficient Net Habitable Volume (${actualNHV.toFixed(1)} m³ vs ${requiredNHV} m³ required)`,
                score: Math.round(nhvRatio * 100)
            });
        }

        // Mission Parameters Assessment
        const missionValidation = this.validateCrewAccommodation(missionData.destination, missionData.crewSize, missionData.duration);
        if (missionValidation.valid) {
            report.assessments.push({
                category: 'Mission',
                status: 'compliant',
                message: 'Mission parameters within recommended ranges',
                score: 100
            });
        } else {
            report.assessments.push({
                category: 'Mission',
                status: 'warning',
                message: 'Mission parameters outside optimal ranges',
                details: missionValidation.issues,
                score: 70
            });
        }

        // Technology Assessment
        const tech = this.standards.technologyReadiness[habitatData.construction];
        if (tech.trl >= 7) {
            report.assessments.push({
                category: 'Technology',
                status: 'compliant',
                message: `Construction technology at TRL ${tech.trl} - Ready for implementation`,
                score: 100
            });
        } else if (tech.trl >= 5) {
            report.assessments.push({
                category: 'Technology',
                status: 'warning',
                message: `Construction technology at TRL ${tech.trl} - Requires development`,
                score: 70
            });
        } else {
            report.assessments.push({
                category: 'Technology',
                status: 'non-compliant',
                message: `Construction technology at TRL ${tech.trl} - Not ready for mission use`,
                score: 40
            });
        }

        // Calculate overall score
        report.overallScore = Math.round(report.assessments.reduce((sum, assessment) => sum + assessment.score, 0) / report.assessments.length);

        // Generate recommendations
        if (nhvRatio < 0.9) {
            report.recommendations.push(`Increase habitat volume to meet Net Habitable Volume requirements`);
        }
        if (tech.trl < 7) {
            report.recommendations.push(`Consider alternative construction methods with higher TRL`);
        }
        if (!missionValidation.valid) {
            report.recommendations.push(`Review mission parameters for optimal crew performance`);
        }

        return report;
    }

    getAreaRequirements(areaType) {
        return this.standards.functionalAreas[areaType] || { minArea: 4, recommended: 6 };
    }

    getMissionStandards(missionType) {
        return this.standards.missionSpecific[missionType];
    }

    getLifeSupportRequirements() {
        return this.standards.lifeSupport;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NASAStandards;
}