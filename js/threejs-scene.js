/**
 * Three.js Visualization Module
 * Advanced 3D rendering for interior and exterior habitat views
 */
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js';

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

        this.currentView = 'exterior';
        this.currentLevel = 0;
        this.placedObjects = new Map();
        this.functionalAreas = new Map();
        this.equipmentItems = new Map();

        this.gridHelper = null;
        this.axesHelper = null;

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0f1a);

        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(15, 8, 15);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 50;

        this.exteriorGroup = new THREE.Group();
        this.interiorGroup = new THREE.Group();
        this.scene.add(this.exteriorGroup);
        this.scene.add(this.interiorGroup);

        this.setupLighting();

        this.gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
        this.scene.add(this.gridHelper);

        this.axesHelper = new THREE.AxesHelper(5);
        this.scene.add(this.axesHelper);

        window.addEventListener('resize', () => this.onWindowResize());

        this.animate();

        console.log('Three.js scene initialized');
    }

    setupLighting() {
        this.scene.children.forEach(child => {
            if (child.isLight) this.scene.remove(child);
        });

        if (this.currentView === 'exterior') this.setupExteriorLighting();
        else this.setupInteriorLighting();
    }

    setupExteriorLighting() {
        const ambient = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambient);

        const directional = new THREE.DirectionalLight(0xffffff, 0.9);
        directional.position.set(10, 10, 5);
        directional.castShadow = true;
        directional.shadow.mapSize.width = 2048;
        directional.shadow.mapSize.height = 2048;
        this.scene.add(directional);

        const hemisphere = new THREE.HemisphereLight(0x443333, 0x111122, 0.4);
        this.scene.add(hemisphere);
    }

    setupInteriorLighting() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambient);

        const p1 = new THREE.PointLight(0xffffff, 0.6, 15);
        p1.position.set(0, 3, 0);
        this.scene.add(p1);

        const p2 = new THREE.PointLight(0xffffff, 0.4, 12);
        p2.position.set(4, 3, 4);
        this.scene.add(p2);

        const p3 = new THREE.PointLight(0xffffff, 0.4, 12);
        p3.position.set(-4, 3, -4);
        this.scene.add(p3);

        const spot = new THREE.SpotLight(0xffffff, 0.3, 20, Math.PI / 6, 0.5, 1);
        spot.position.set(0, 5, 0);
        spot.target.position.set(0, 0, 0);
        this.scene.add(spot);
        this.scene.add(spot.target);
    }

    createHabitat(structure, radius, height, levels = 1) {
        this.clearHabitat();

        const loader = new GLTFLoader();

        loader.load(
            // Caminho correto
            'assets/nave1.glb',
            (gltf) => {
                this.habitatMesh = gltf.scene;

                // Ajuste de tamanho e posição
                this.habitatMesh.scale.set(2, 2, 2);
                this.habitatMesh.position.set(0, 2, 0);

                this.habitatMesh.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                this.exteriorGroup.add(this.habitatMesh);
                console.log('✅ Modelo nave1.glb carregado com sucesso.');

                if (levels > 1) this.createInternalLevels(radius, height, levels);
                this.addHabitatDetails(structure, radius, height);
            },
            (xhr) => {
                console.log(`Carregando modelo nave1.glb: ${(xhr.loaded / xhr.total * 100).toFixed(1)}%`);
            },
            (error) => {
                console.error('⚠️ Erro ao carregar nave1.glb, carregando fallback...', error);

                const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
                const material = new THREE.MeshPhongMaterial({
                    color: 0x4fc3f7,
                    opacity: 0.8,
                    transparent: true
                });
                this.habitatMesh = new THREE.Mesh(geometry, material);
                this.habitatMesh.castShadow = true;
                this.exteriorGroup.add(this.habitatMesh);
            }
        );

        return this.habitatMesh;
    }

    createInternalLevels(radius, height, levels) {
        const levelHeight = height / levels;
        for (let i = 1; i < levels; i++) {
            const levelY = -height / 2 + i * levelHeight;
            const floorGeo = new THREE.CircleGeometry(radius - 0.1, 32);
            const floorMat = new THREE.MeshPhongMaterial({ color: 0x8b7355, side: THREE.DoubleSide });
            const floor = new THREE.Mesh(floorGeo, floorMat);
            floor.rotation.x = Math.PI / 2;
            floor.position.y = levelY;
            this.interiorGroup.add(floor);
        }
    }

    addHabitatDetails(structure, radius, height) {
        this.addWindows(radius, height);
        this.addDockingPorts(structure, radius, height);
        this.addExternalEquipment(radius, height);
    }

    addWindows(radius, height) {
        const geo = new THREE.PlaneGeometry(0.8, 0.4);
        const mat = new THREE.MeshBasicMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.7 });
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const w = new THREE.Mesh(geo, mat);
            w.position.set(Math.cos(angle) * (radius + 0.1), height / 4, Math.sin(angle) * (radius + 0.1));
            w.rotation.y = angle + Math.PI / 2;
            this.exteriorGroup.add(w);
        }
    }

    addDockingPorts(structure, radius, height) {
        const geo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
        const mat = new THREE.MeshPhongMaterial({ color: 0x666666 });
        if (structure === 'cylinder' || structure === 'horizontal') {
            const p1 = new THREE.Mesh(geo, mat);
            p1.position.set(0, 0, height / 2 + 0.1);
            const p2 = new THREE.Mesh(geo, mat);
            p2.position.set(0, 0, -height / 2 - 0.1);
            this.exteriorGroup.add(p1, p2);
        }
    }

    addExternalEquipment(radius, height) {
        const panelGeo = new THREE.BoxGeometry(3, 0.1, 1);
        const panelMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
        const s1 = new THREE.Mesh(panelGeo, panelMat);
        s1.position.set(radius + 2, 0, 0);
        const s2 = new THREE.Mesh(panelGeo, panelMat);
        s2.position.set(-radius - 2, 0, 0);
        this.exteriorGroup.add(s1, s2);

        const radGeo = new THREE.BoxGeometry(2, 0.05, 1);
        const radMat = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const r = new THREE.Mesh(radGeo, radMat);
        r.position.set(0, height / 2 + 0.5, radius + 0.5);
        this.exteriorGroup.add(r);
    }

    switchToInteriorView() {
        this.currentView = 'interior';
        this.exteriorGroup.visible = false;
        this.interiorGroup.visible = true;
        this.setupLighting();
        this.camera.position.set(0, 2, 0);
        this.controls.target.set(0, 2, 5);
        this.controls.update();
    }

    switchToExteriorView() {
        this.currentView = 'exterior';
        this.exteriorGroup.visible = true;
        this.interiorGroup.visible = false;
        this.setupLighting();
        this.camera.position.set(15, 8, 15);
        this.controls.target.set(0, 0, 0);
        this.controls.update();
    }

    clearHabitat() {
        while (this.exteriorGroup.children.length > 0) this.exteriorGroup.remove(this.exteriorGroup.children[0]);
        while (this.interiorGroup.children.length > 0) this.interiorGroup.remove(this.interiorGroup.children[0]);
        this.habitatMesh = null;
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        if (this.currentView === 'exterior' && this.habitatMesh && window.habitatBuilder) {
            const rotationSpeed = window.habitatBuilder.getRotationSpeed();
            this.habitatMesh.rotation.y += rotationSpeed * 0.01;
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export { ThreeJSScene };
