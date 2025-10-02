/**
 * Three.js Visualization Module
 * Advanced 3D rendering for interior and exterior habitat views
 */

class ThreeJSScene {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.habitatMesh = null;
        this.interiorGroup = null;
        this.exteriorGroup = null;
        
        this.currentView = 'exterior'; // 'exterior' or 'interior'
        this.currentLevel = 0;
        this.placedObjects = new Map();
        this.functionalAreas = new Map();
        this.equipmentItems = new Map();
        
        this.gridHelper = null;
        this.axesHelper = null;
        
        this.init();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0f1a);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(15, 8, 15);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Add orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.dampingFactor = 0.05;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 50;

        // Create groups for organization
        this.exteriorGroup = new THREE.Group();
        this.interiorGroup = new THREE.Group();
        this.scene.add(this.exteriorGroup);
        this.scene.add(this.interiorGroup);

        // Setup lighting
        this.setupLighting();

        // Add helpers
        this.gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
        this.scene.add(this.gridHelper);

        this.axesHelper = new THREE.AxesHelper(5);
        this.scene.add(this.axesHelper);

        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation loop
        this.animate();

        console.log('Three.js scene initialized');
    }

    setupLighting() {
        // Clear existing lights
        this.scene.children.forEach(child => {
            if (child.isLight) {
                this.scene.remove(child);
            }
        });

        if (this.currentView === 'exterior') {
            this.setupExteriorLighting();
        } else {
            this.setupInteriorLighting();
        }
    }

    setupExteriorLighting() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);

        // Hemisphere light for natural outdoor feel
        const hemisphereLight = new THREE.HemisphereLight(0x443333, 0x111122, 0.3);
        this.scene.add(hemisphereLight);
    }

    setupInteriorLighting() {
        // Soft ambient light for interior
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Multiple point lights for interior illumination
        const pointLight1 = new THREE.PointLight(0xffffff, 0.6, 15);
        pointLight1.position.set(0, 3, 0);
        pointLight1.castShadow = true;
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xffffff, 0.4, 12);
        pointLight2.position.set(4, 3, 4);
        pointLight2.castShadow = true;
        this.scene.add(pointLight2);

        const pointLight3 = new THREE.PointLight(0xffffff, 0.4, 12);
        pointLight3.position.set(-4, 3, -4);
        pointLight3.castShadow = true;
        this.scene.add(pointLight3);

        // Spotlights for work areas
        const spotLight = new THREE.SpotLight(0xffffff, 0.3, 20, Math.PI / 6, 0.5, 1);
        spotLight.position.set(0, 5, 0);
        spotLight.target.position.set(0, 0, 0);
        this.scene.add(spotLight);
        this.scene.add(spotLight.target);
    }

    createHabitat(structure, radius, height, levels = 1) {
        // Clear previous habitat
        this.clearHabitat();

        let geometry;
        const material = new THREE.MeshPhongMaterial({
            color: 0x4fc3f7,
            transparent: true,
            opacity: 0.8,
            wireframe: false
        });

        switch (structure) {
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
                this.habitatMesh = new THREE.Mesh(geometry, material);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(radius, 32, 32);
                this.habitatMesh = new THREE.Mesh(geometry, material);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(radius, height/4, 16, 100);
                this.habitatMesh = new THREE.Mesh(geometry, material);
                break;
            case 'modular':
                this.habitatMesh = this.createModularStructure(radius, height);
                break;
            case 'horizontal':
                geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
                this.habitatMesh = new THREE.Mesh(geometry, material);
                break;
            case 'vertical':
                geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
                this.habitatMesh = new THREE.Mesh(geometry, material);
                this.habitatMesh.rotation.x = Math.PI / 2;
                break;
            default:
                geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
                this.habitatMesh = new THREE.Mesh(geometry, material);
        }

        this.habitatMesh.castShadow = true;
        this.habitatMesh.receiveShadow = true;
        this.exteriorGroup.add(this.habitatMesh);

        // Add internal structure for multi-level habitats
        if (levels > 1) {
            this.createInternalLevels(radius, height, levels);
        }

        // Add habitat details
        this.addHabitatDetails(structure, radius, height);

        return this.habitatMesh;
    }

    createModularStructure(radius, height) {
        const group = new THREE.Group();
        const moduleRadius = radius / 2;
        const moduleHeight = height / 2;

        // Create 4 interconnected modules
        const positions = [
            { x: moduleRadius + 1, y: 0, z: 0 },
            { x: -moduleRadius - 1, y: 0, z: 0 },
            { x: 0, y: 0, z: moduleRadius + 1 },
            { x: 0, y: 0, z: -moduleRadius - 1 }
        ];

        positions.forEach((pos, index) => {
            const geometry = new THREE.CylinderGeometry(moduleRadius, moduleRadius, moduleHeight, 32);
            const material = new THREE.MeshPhongMaterial({
                color: 0x4fc3f7,
                transparent: true,
                opacity: 0.8
            });
            const module = new THREE.Mesh(geometry, material);
            module.position.set(pos.x, pos.y, pos.z);
            module.castShadow = true;
            module.receiveShadow = true;
            group.add(module);

            // Add connecting tunnels
            if (index > 0) {
                this.createConnectingTunnel(group, positions[0], pos, moduleRadius);
            }
        });

        return group;
    }

    createConnectingTunnel(group, start, end, radius) {
        const distance = Math.sqrt(
            Math.pow(end.x - start.x, 2) + 
            Math.pow(end.z - start.z, 2)
        );
        
        const tunnelGeometry = new THREE.CylinderGeometry(radius/3, radius/3, distance, 8);
        const tunnelMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
        
        // Position and rotate tunnel
        tunnel.position.set(
            (start.x + end.x) / 2,
            0,
            (start.z + end.z) / 2
        );
        
        const angle = Math.atan2(end.z - start.z, end.x - start.x);
        tunnel.rotation.y = angle + Math.PI / 2;
        
        group.add(tunnel);
    }

    createInternalLevels(radius, height, levels) {
        const levelHeight = height / levels;
        
        for (let i = 1; i < levels; i++) {
            const levelY = -height / 2 + i * levelHeight;
            
            // Create floor
            const floorGeometry = new THREE.CircleGeometry(radius - 0.1, 32);
            const floorMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x8B7355,
                side: THREE.DoubleSide
            });
            const floor = new THREE.Mesh(floorGeometry, floorMaterial);
            floor.rotation.x = Math.PI / 2;
            floor.position.y = levelY;
            floor.receiveShadow = true;
            this.interiorGroup.add(floor);

            // Create support structure
            this.createLevelSupports(radius, levelY, levelHeight);
        }
    }

    createLevelSupports(radius, levelY, levelHeight) {
        const supportGeometry = new THREE.CylinderGeometry(0.1, 0.1, levelHeight / 10, 8);
        const supportMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const support = new THREE.Mesh(supportGeometry, supportMaterial);
            support.position.set(
                Math.cos(angle) * (radius - 0.5),
                levelY - levelHeight / 20,
                Math.sin(angle) * (radius - 0.5)
            );
            this.interiorGroup.add(support);
        }
    }

    addHabitatDetails(structure, radius, height) {
        // Add windows
        this.addWindows(radius, height);
        
        // Add docking ports
        this.addDockingPorts(structure, radius, height);
        
        // Add radiators and external equipment
        this.addExternalEquipment(radius, height);
    }

    addWindows(radius, height) {
        const windowGeometry = new THREE.PlaneGeometry(0.8, 0.4);
        const windowMaterial = new THREE.MeshBasicMaterial({
            color: 0x87ceeb,
            transparent: true,
            opacity: 0.7
        });

        // Add windows around habitat
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(
                Math.cos(angle) * (radius + 0.1),
                height / 4,
                Math.sin(angle) * (radius + 0.1)
            );
            window.rotation.y = angle + Math.PI / 2;
            this.exteriorGroup.add(window);
        }
    }

    addDockingPorts(structure, radius, height) {
        const portGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
        const portMaterial = new THREE.MeshPhongMaterial({ color: 0x666666 });

        // Add docking ports based on structure type
        if (structure === 'cylinder' || structure === 'horizontal') {
            const port1 = new THREE.Mesh(portGeometry, portMaterial);
            port1.position.set(0, 0, height / 2 + 0.1);
            this.exteriorGroup.add(port1);

            const port2 = new THREE.Mesh(portGeometry, portMaterial);
            port2.position.set(0, 0, -height / 2 - 0.1);
            this.exteriorGroup.add(port2);
        }
    }

    addExternalEquipment(radius, height) {
        // Add solar panels
        const panelGeometry = new THREE.BoxGeometry(3, 0.1, 1);
        const panelMaterial = new THREE.MeshPhongMaterial({ color: 0x222222 });
        
        const solarPanel1 = new THREE.Mesh(panelGeometry, panelMaterial);
        solarPanel1.position.set(radius + 2, 0, 0);
        this.exteriorGroup.add(solarPanel1);

        const solarPanel2 = new THREE.Mesh(panelGeometry, panelMaterial);
        solarPanel2.position.set(-radius - 2, 0, 0);
        this.exteriorGroup.add(solarPanel2);

        // Add radiators
        const radiatorGeometry = new THREE.BoxGeometry(2, 0.05, 1);
        const radiatorMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        
        const radiator1 = new THREE.Mesh(radiatorGeometry, radiatorMaterial);
        radiator1.position.set(0, height / 2 + 0.5, radius + 0.5);
        this.exteriorGroup.add(radiator1);
    }

    switchToInteriorView() {
        this.currentView = 'interior';
        this.exteriorGroup.visible = false;
        this.interiorGroup.visible = true;
        this.setupLighting();
        
        // Position camera inside habitat
        this.camera.position.set(0, 2, 0);
        this.controls.target.set(0, 2, 5);
        this.controls.update();

        // Show interior navigation
        this.showInteriorNavigation();

        console.log('Switched to interior view');
    }

    switchToExteriorView() {
        this.currentView = 'exterior';
        this.exteriorGroup.visible = true;
        this.interiorGroup.visible = false;
        this.setupLighting();
        
        // Position camera outside habitat
        this.camera.position.set(15, 8, 15);
        this.controls.target.set(0, 0, 0);
        this.controls.update();

        // Hide interior navigation
        this.hideInteriorNavigation();

        console.log('Switched to exterior view');
    }

    showInteriorNavigation() {
        const nav = document.querySelector('.interior-navigation');
        if (nav) {
            nav.style.display = 'flex';
        }
    }

    hideInteriorNavigation() {
        const nav = document.querySelector('.interior-navigation');
        if (nav) {
            nav.style.display = 'none';
        }
    }

    createFunctionalArea(areaType, position, size, color = 0x4caf50) {
        const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: 0.6
        });
        
        const area = new THREE.Mesh(geometry, material);
        area.position.copy(position);
        area.userData = { 
            type: 'functionalArea', 
            areaType: areaType,
            size: size
        };
        
        this.interiorGroup.add(area);
        this.functionalAreas.set(areaType, area);
        
        // Add label
        this.addAreaLabel(areaType, position, size);
        
        return area;
    }

    addAreaLabel(areaType, position, size) {
        // In a real implementation, this would create a 2D or 3D text label
        console.log(`Created ${areaType} at (${position.x.toFixed(1)}, ${position.y.toFixed(1)}, ${position.z.toFixed(1)})`);
    }

    addEquipment(equipmentType, position, rotation = new THREE.Euler(0, 0, 0)) {
        let geometry, material, equipment;
        
        const templates = {
            'sleep-station': { size: [0.9, 0.4, 1.8], color: 0x8B4513 },
            'exercise-equipment': { size: [0.8, 0.3, 1.5], color: 0x333333 },
            'galley-equipment': { size: [0.6, 0.8, 0.6], color: 0xcccccc },
            'lab-equipment': { size: [1.5, 0.9, 0.8], color: 0x2288cc },
            'control-consoles': { size: [1, 0.8, 0.5], color: 0x222222 },
            'oxygen-system': { size: [0.8, 1.2, 0.6], color: 0xff4444 },
            'water-recycler': { size: [0.6, 1, 0.4], color: 0x4444ff },
            'co2-scrubber': { size: [0.5, 0.8, 0.5], color: 0x44ff44 }
        };

        const template = templates[equipmentType] || { size: [1, 1, 1], color: 0xff0000 };
        
        geometry = new THREE.BoxGeometry(...template.size);
        material = new THREE.MeshPhongMaterial({ color: template.color });
        equipment = new THREE.Mesh(geometry, material);
        
        equipment.position.copy(position);
        equipment.rotation.copy(rotation);
        equipment.userData = { 
            type: 'equipment', 
            equipmentType: equipmentType 
        };
        equipment.castShadow = true;
        equipment.receiveShadow = true;
        
        this.interiorGroup.add(equipment);
        const id = `equipment_${Date.now()}`;
        this.equipmentItems.set(id, equipment);
        
        return { id, equipment };
    }

    removeEquipment(id) {
        const equipment = this.equipmentItems.get(id);
        if (equipment) {
            this.interiorGroup.remove(equipment);
            this.equipmentItems.delete(id);
        }
    }

    changeInteriorLevel(delta) {
        const habitat = window.habitatBuilder?.getCurrentHabitat();
        if (!habitat || habitat.levels <= 1) return;

        const newLevel = this.currentLevel + delta;
        if (newLevel >= 0 && newLevel < habitat.levels) {
            this.currentLevel = newLevel;
            this.updateLevelView();
        }
    }

    updateLevelView() {
        const habitat = window.habitatBuilder?.getCurrentHabitat();
        if (!habitat) return;

        const levelHeight = habitat.length / habitat.levels;
        const levelY = -habitat.length / 2 + this.currentLevel * levelHeight + levelHeight / 2;

        // Update camera position for current level
        this.camera.position.y = levelY + 1.7; // Eye level
        this.controls.target.y = levelY + 1.7;
        this.controls.update();

        // Update level indicator
        const levelIndicator = document.getElementById('current-level');
        if (levelIndicator) {
            levelIndicator.textContent = (this.currentLevel + 1).toString();
        }

        // Highlight current level areas
        this.highlightCurrentLevel();
    }

    highlightCurrentLevel() {
        // Implementation for highlighting the current level
        // This could adjust opacity or colors of areas on different levels
    }

    clearHabitat() {
        // Clear exterior group
        while (this.exteriorGroup.children.length > 0) {
            this.exteriorGroup.remove(this.exteriorGroup.children[0]);
        }

        // Clear interior group
        while (this.interiorGroup.children.length > 0) {
            this.interiorGroup.remove(this.interiorGroup.children[0]);
        }

        this.habitatMesh = null;
        this.functionalAreas.clear();
        this.equipmentItems.clear();
    }

    clearScene() {
        this.clearHabitat();
        
        // Clear other objects except lights and helpers
        const objectsToRemove = [];
        this.scene.traverse((child) => {
            if (child.isMesh && 
                child !== this.gridHelper && 
                child !== this.axesHelper && 
                !child.isLight) {
                objectsToRemove.push(child);
            }
        });
        
        objectsToRemove.forEach(obj => this.scene.remove(obj));
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotate habitat if in exterior view and rotation is set
        if (this.currentView === 'exterior' && this.habitatMesh && window.habitatBuilder) {
            const rotationSpeed = window.habitatBuilder.getRotationSpeed();
            this.habitatMesh.rotation.y += rotationSpeed * 0.01;
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    getSceneData() {
        return {
            currentView: this.currentView,
            currentLevel: this.currentLevel,
            habitat: this.habitatMesh ? {
                position: this.habitatMesh.position.toArray(),
                rotation: this.habitatMesh.rotation.toArray(),
                scale: this.habitatMesh.scale.toArray()
            } : null,
            functionalAreas: Array.from(this.functionalAreas.entries()).map(([type, area]) => ({
                type,
                position: area.position.toArray(),
                rotation: area.rotation.toArray(),
                size: area.userData.size
            })),
            equipment: Array.from(this.equipmentItems.entries()).map(([id, equipment]) => ({
                id,
                type: equipment.userData.equipmentType,
                position: equipment.position.toArray(),
                rotation: equipment.rotation.toArray()
            }))
        };
    }

    loadSceneData(data) {
        this.clearScene();
        this.currentView = data.currentView;
        this.currentLevel = data.currentLevel || 0;

        // Note: In a full implementation, this would recreate the entire scene
        // from the saved data including habitat, areas, and equipment
        
        if (data.currentView === 'interior') {
            this.switchToInteriorView();
        } else {
            this.switchToExteriorView();
        }

        this.updateLevelView();
    }

    // Utility methods for drag and drop
    getIntersectionPoint(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);

        // Create a ground plane at y=0
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const intersectionPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(groundPlane, intersectionPoint);

        return intersectionPoint;
    }

    // Method to handle dropping items in the scene
    handleDrop(event, itemType, itemData) {
        const position = this.getIntersectionPoint(event);
        
        if (this.currentView === 'interior') {
            if (itemType === 'functionalArea') {
                this.createFunctionalArea(
                    itemData.areaType,
                    position,
                    new THREE.Vector3(3, 2, 3),
                    itemData.color
                );
            } else if (itemType === 'equipment') {
                this.addEquipment(itemData.equipmentType, position);
            }
        }
        
        return position;
    }
}