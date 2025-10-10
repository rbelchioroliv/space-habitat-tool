// /**
//  * Three.js Visualization Module
//  * Advanced 3D rendering for interior and exterior habitat views
//  */
// const GLTFLoader = THREE.GLTFLoader;

// class ThreeJSScene {
//     constructor(containerId) {
//         this.container = document.getElementById(containerId);
//         this.scene = null;
//         this.camera = null;
//         this.renderer = null;
//         this.controls = null;
//         this.habitatMesh = null;
//         this.interiorGroup = null;
//         this.exteriorGroup = null;

//         this.currentView = 'exterior';
//         this.currentLevel = 0;
//         this.placedObjects = new Map();
//         this.functionalAreas = new Map();
//         this.equipmentItems = new Map();

//         this.gridHelper = null;
//         this.axesHelper = null;

//         this.init();
//     }



//     init() {
//         this.scene = new THREE.Scene();

//         const loader = new THREE.TextureLoader();
//         loader.load(
//             'assets/img/background.jpeg',
//             (texture) => {
//                 this.scene.background = texture;
//             },
//             undefined,
//             (err) => {
//                 console.error('Um erro ocorreu ao carregar a textura de fundo.', err);
//             }
//         );

//         this.camera = new THREE.PerspectiveCamera(
//             75,
//             this.container.clientWidth / this.container.clientHeight,
//             0.1,
//             5000
//         );

//         this.camera.position.set(60, 30, 60);


//         this.scene.add(this.camera);



//         const cameraLight = new THREE.SpotLight(
//             0xffffff, // Cor
//             1.5,      // Intensidade (aumentada de 0.7 para 1.5)
//             5000,     // Distância
//             1,        // Ângulo
//             0.5       // Penumbra
//         );

//         cameraLight.position.set(0, 0, 0); // Posição relativa à câmera 

//         this.camera.add(cameraLight);


//         this.renderer = new THREE.WebGLRenderer({
//             antialias: true,
//             alpha: true
//         });
//         this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
//         this.renderer.shadowMap.enabled = true;
//         this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//         this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//         this.container.appendChild(this.renderer.domElement);

//         this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
//         this.controls.enableDamping = true;


//         this.controls.minDistance = 500;
//         this.controls.maxDistance = 5000;

//         this.exteriorGroup = new THREE.Group();
//         this.interiorGroup = new THREE.Group();
//         this.scene.add(this.exteriorGroup);
//         this.scene.add(this.interiorGroup);

//         this.interiorGroup.visible = false; // Garante que o grupo interior começa escondido
//         this.loadInteriorHabitatModel();    // Pré-carrega o modelo do interior


//         this.setupLighting();

//         // this.gridHelper = new THREE.GridHelper(2000, 2000, 0x444444, 0x223222);
//         // this.scene.add(this.gridHelper);

//         const groundGeometry = new THREE.PlaneGeometry(3000, 3000); // Mesmo tamanho do grid

//         //floor


//         const textureLoader = new THREE.TextureLoader();
//         const groundTexture = textureLoader.load(
//             'assets/img/floor_texture_marte.jpg',
//             // (texture) => {
//             //     // Configura a textura para se repetir
//             //     texture.wrapS = THREE.RepeatWrapping;
//             //     texture.wrapT = THREE.RepeatWrapping;
//             //     texture.repeat.set(100, 100); // Repete a textura 100x100 vezes
//             // }
//         );


//         const groundMaterial = new THREE.MeshStandardMaterial({
//             map: groundTexture,
//             roughness: 0.9,
//             metalness: 0.1
//         });

//         const groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);


//         groundPlane.rotation.x = -Math.PI / 2;

//         groundPlane.receiveShadow = true;

//         this.scene.add(groundPlane);

//         this.axesHelper = new THREE.AxesHelper(5);
//         this.scene.add(this.axesHelper);

//         window.addEventListener('resize', () => this.onWindowResize());

//         this.animate();

//         console.log('Three.js scene initialized');
//     }


//     setupLighting() {
//         this.scene.children.forEach(child => {
//             if (child.isLight) this.scene.remove(child);
//         });

//         if (this.currentView === 'exterior') this.setupExteriorLighting();
//         else this.setupInteriorLighting();
//     }

//     setupExteriorLighting() {
//         const ambient = new THREE.AmbientLight(0x404040, 0.6);
//         this.scene.add(ambient);

//         const directional = new THREE.DirectionalLight(0xffffff, 0.9);
//         directional.position.set(10, 10, 5);
//         directional.castShadow = true;
//         directional.shadow.mapSize.width = 2048;
//         directional.shadow.mapSize.height = 2048;

//         this.scene.add(directional);

//         const hemisphere = new THREE.HemisphereLight(0x443333, 0x111122, 0.4);
//         this.scene.add(hemisphere);
//     }

//     setupInteriorLighting() {
//         // 1. Reduz a luz ambiente para criar mais contraste
//         const ambient = new THREE.AmbientLight(0xffffff, 0.25); // Reduzido de 0.6 para 0.25
//         this.scene.add(ambient);

//         // 2. Reduz a intensidade da luz de ponto
//         const p1 = new THREE.PointLight(0xffffff, 0.4, 20); // Reduzido de 0.5 para 0.4
//         p1.position.set(0, 5, 0);
//         this.scene.add(p1);

//         // 3. Reduz a intensidade da SpotLight, que é a principal fonte de sombras
//         const spot = new THREE.SpotLight(
//             0xCCCCCC,       // Cor
//             0.7,            // Intensidade (Reduzida de 0.8 para 0.6)
//             15,             // Distância
//             Math.PI / 4,    // Ângulo
//             0.7,            // Penumbra
//             1
//         );
//         spot.position.set(0, 8, 0);
//         spot.target.position.set(0, 0, 0);

//         // Configurações das sombras (mantêm-se iguais)
//         spot.castShadow = true;
//         spot.shadow.mapSize.width = 2048;
//         spot.shadow.mapSize.height = 2048;
//         spot.shadow.bias = -0.001;
//         spot.shadow.focus = 1;

//         this.scene.add(spot);
//         this.scene.add(spot.target);
//     }

//     loadInteriorHabitatModel() {
//         const loader = new GLTFLoader();
//         const modelPath = 'assets/nave1.glb';

//         loader.load(modelPath, (gltf) => {
//             const model = gltf.scene;

//             // Centraliza e posiciona o modelo
//             const box = new THREE.Box3().setFromObject(model);
//             const center = box.getCenter(new THREE.Vector3());
//             model.position.sub(center);
//             model.position.y = 1;

//             // Ajusta a escala
//             model.scale.set(1, 1, 1);

//             // --- LÓGICA DE CONVERSÃO INTELIGENTE DE MATERIAIS ---
//             model.traverse((child) => {
//                 if (child.isMesh) {
//                     const oldMaterial = child.material;

//                     // Cria um novo material Standard que reage à luz
//                     const newMaterial = new THREE.MeshStandardMaterial({
//                         // Copia as propriedades importantes do material antigo
//                         color: oldMaterial.color,       // Mantém a cor original
//                         map: oldMaterial.map,           // Mantém a textura original
//                         transparent: oldMaterial.transparent, // Mantém a transparência
//                         opacity: oldMaterial.opacity,   // Mantém a opacidade
//                         side: THREE.DoubleSide,         // Garante que ambos os lados são visíveis

//                         // Define propriedades PBR para uma boa reação à luz
//                         roughness: 0.8,
//                         metalness: 0.2
//                     });

//                     // Substitui o material antigo pelo novo material melhorado
//                     child.material = newMaterial;

//                     child.castShadow = true;
//                     child.receiveShadow = true;
//                 }
//             });

//             if (this.interiorModel) {
//                 this.interiorGroup.remove(this.interiorModel);
//             }

//             this.interiorGroup.add(model);
//             this.interiorModel = model;

//             console.log('✅ Interior model loaded, materials upgraded to Standard.');

//         },
//             (xhr) => {
//                 console.log(`Loading interior model: ${(xhr.loaded / xhr.total * 100).toFixed(1)}%`);
//             },
//             (error) => {
//                 console.error('❌ CRITICAL: FAILED TO LOAD INTERIOR MODEL.', error);
//             });
//     }

//     createFunctionalArea(config) {
//         console.warn("Método createFunctionalArea ainda não implementado.");

//     }

//     createHabitat(structure, radius, height, levels = 1) {
//         this.clearHabitat(); // Agora só limpa o exterior, sem apagar o interior.

//         // CORREÇÃO: Esta função cria APENAS a geometria exterior (a "casca").
//         const geometry = new THREE.CylinderGeometry(radius, radius, height, 64);
//         const material = new THREE.MeshPhongMaterial({
//             color: 0x88aaff, // Cor para a casca exterior
//             opacity: 0.7,
//             transparent: true,
//             side: THREE.DoubleSide
//         });

//         this.habitatMesh = new THREE.Mesh(geometry, material);
//         this.habitatMesh.position.y = height / 2;
//         this.habitatMesh.castShadow = true;
//         this.habitatMesh.receiveShadow = true;

//         // Adiciona a casca geométrica ao grupo do EXTERIOR.
//         this.exteriorGroup.add(this.habitatMesh);

//         if (levels > 1) this.createInternalLevels(radius, height, levels);
//         this.addHabitatDetails(structure, radius, height);

//         return this.habitatMesh;
//     }

//     createInternalLevels(radius, height, levels) {
//         const levelHeight = height / levels;
//         for (let i = 1; i < levels; i++) {
//             const levelY = -height / 2 + i * levelHeight;
//             const floorGeo = new THREE.CircleGeometry(radius - 0.1, 32);
//             const floorMat = new THREE.MeshPhongMaterial({ color: 0x8b7355, side: THREE.DoubleSide });
//             const floor = new THREE.Mesh(floorGeo, floorMat);
//             floor.rotation.x = Math.PI / 2;
//             floor.position.y = levelY;
//             this.interiorGroup.add(floor);
//         }
//     }

//     addHabitatDetails(structure, radius, height) {
//         this.addWindows(radius, height);
//         this.addDockingPorts(structure, radius, height);
//         this.addExternalEquipment(radius, height);
//     }

//     addWindows(radius, height) {
//         const geo = new THREE.PlaneGeometry(0.8, 0.4);
//         const mat = new THREE.MeshBasicMaterial({ color: 0x87ceeb, transparent: true, opacity: 0.7 });
//         for (let i = 0; i < 8; i++) {
//             const angle = (i / 8) * Math.PI * 2;
//             const w = new THREE.Mesh(geo, mat);
//             w.position.set(Math.cos(angle) * (radius + 0.1), height / 4, Math.sin(angle) * (radius + 0.1));
//             w.rotation.y = angle + Math.PI / 2;
//             this.exteriorGroup.add(w);
//         }
//     }

//     addDockingPorts(structure, radius, height) {
//         const geo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
//         const mat = new THREE.MeshPhongMaterial({ color: 0x666666 });
//         if (structure === 'cylinder' || structure === 'horizontal') {
//             const p1 = new THREE.Mesh(geo, mat);
//             p1.position.set(0, 0, height / 2 + 0.1);
//             const p2 = new THREE.Mesh(geo, mat);
//             p2.position.set(0, 0, -height / 2 - 0.1);
//             this.exteriorGroup.add(p1, p2);
//         }
//     }

//     addExternalEquipment(radius, height) {
//         const panelGeo = new THREE.BoxGeometry(3, 0.1, 1);
//         const panelMat = new THREE.MeshPhongMaterial({ color: 0x222222 });
//         const s1 = new THREE.Mesh(panelGeo, panelMat);
//         s1.position.set(radius + 2, 0, 0);
//         const s2 = new THREE.Mesh(panelGeo, panelMat);
//         s2.position.set(-radius - 2, 0, 0);
//         this.exteriorGroup.add(s1, s2);

//         const radGeo = new THREE.BoxGeometry(2, 0.05, 1);
//         const radMat = new THREE.MeshPhongMaterial({ color: 0x444444 });
//         const r = new THREE.Mesh(radGeo, radMat);
//         r.position.set(0, height / 2 + 0.5, radius + 0.5);
//         this.exteriorGroup.add(r);
//     }

//     // switchToInteriorView() {
//     //     this.currentView = 'interior';

//     //     // Esconde o grupo do exterior
//     //     this.exteriorGroup.visible = false;
//     //     // Mostra o grupo do interior (que já tem o nave1.glb)
//     //     this.interiorGroup.visible = true;

//     //     this.setupLighting();
//     //     // Ajusta a câmara para dentro do habitat
//     //     this.camera.position.set(0, 2, 5);
//     //     this.controls.target.set(0, 2, 0);
//     //     this.controls.update();
//     //     console.log('Switched to INTERIOR view');
//     // }

//     // switchToExteriorView() {
//     //     this.currentView = 'exterior';

//     //     // Mostra o grupo do exterior
//     //     this.exteriorGroup.visible = true;
//     //     // Esconde o grupo do interior
//     //     this.interiorGroup.visible = false;

//     //     this.setupLighting();
//     //     // Ajusta a câmara para a posição exterior
//     //     this.camera.position.set(15, 8, 15);
//     //     this.controls.target.set(0, 0, 0);
//     //     this.controls.update();
//     //     console.log('Switched to EXTERIOR view');
//     // }

//     switchToInteriorView() {
//         this.currentView = 'interior';

//         this.exteriorGroup.visible = false;
//         this.interiorGroup.visible = true;

//         this.setupLighting();

//         // --- CONFIGURAÇÃO DA CÂMARA INTERIOR ---
//         // Posição inicial da câmara, dentro do habitat
//         this.camera.position.set(15, 8, 15);
//         this.controls.target.set(0, 0, 0);

//         // Limites de zoom para a vista interior (permite aproximar bastante)
//         this.controls.minDistance = 50;
//         this.controls.maxDistance = 5000;

//         this.controls.update();
//         console.log('Switched to INTERIOR view');
//     }

//     switchToExteriorView() {
//         this.currentView = 'exterior';

//         this.exteriorGroup.visible = true;
//         this.interiorGroup.visible = false;

//         this.setupLighting();

//         // --- CONFIGURAÇÃO DA CÂMARA EXTERIOR ---
//         // Posição inicial da câmara, mais afastada para ver o objeto todo
//         this.camera.position.set(20, 10, 20);
//         // Ponto para onde a câmara olha (o centro da cena)
//         this.controls.target.set(0, 0, 0);

//         // Limites de zoom para a vista exterior
//         this.controls.minDistance = 10;
//         this.controls.maxDistance = 100;

//         this.controls.update();
//         console.log('Switched to EXTERIOR view');
//     }

//     clearHabitat() {
//         // CORREÇÃO: Esta função deve limpar APENAS o grupo do exterior.
//         while (this.exteriorGroup.children.length > 0) {
//             this.exteriorGroup.remove(this.exteriorGroup.children[0]);
//         }
//         this.habitatMesh = null;
//     }

//     onWindowResize() {
//         this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
//         this.camera.updateProjectionMatrix();
//         this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
//     }

//     animate() {
//         requestAnimationFrame(() => this.animate());

//         // LÓGICA DE COLISÃO COM O CHÃO
//         const minCameraHeight = 4;


//         if (this.camera.position.y < minCameraHeight) {

//             this.camera.position.y = minCameraHeight;
//         }

//         if (this.currentView === 'exterior' && this.habitatMesh && window.habitatBuilder) {
//             const rotationSpeed = window.habitatBuilder.getRotationSpeed();
//             this.habitatMesh.rotation.y += rotationSpeed * 0.01;
//         }
//         this.controls.update();
//         this.renderer.render(this.scene, this.camera);
//     }
// }

// window.ThreeJSScene = ThreeJSScene;



/**
 * Three.js Visualization Module
 * Advanced 3D rendering for interior and exterior habitat views
 */
const GLTFLoader = THREE.GLTFLoader;

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
        this.groundPlane = null; // Referência para o chão

        this.currentView = 'exterior';
        this.currentLevel = 0;
        this.placedObjects = new Map();
        this.functionalAreas = new Map();
        this.equipmentItems = new Map();

        this.axesHelper = null;

        this.init();
    }

    init() {
        this.scene = new THREE.Scene();

        const loader = new THREE.TextureLoader();
        loader.load(
            'assets/img/background.jpeg',
            (texture) => {
                this.scene.background = texture;
            },
            undefined,
            (err) => {
                console.error('Um erro ocorreu ao carregar a textura de fundo.', err);
            }
        );

        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            5000
        );

        this.scene.add(this.camera);

        const cameraLight = new THREE.SpotLight(0xffffff, 1.5, 5000, 1, 0.5);
        cameraLight.position.set(0, 0, 0);
        this.camera.add(cameraLight);

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

        this.exteriorGroup = new THREE.Group();
        this.interiorGroup = new THREE.Group();
        this.scene.add(this.exteriorGroup);
        this.scene.add(this.interiorGroup);

        this.interiorGroup.visible = false;
        this.loadInteriorHabitatModel();

        this.setupLighting();

        // --- CRIAÇÃO DO CHÃO ---
        const groundGeometry = new THREE.PlaneGeometry(3000, 3000);
        const textureLoader = new THREE.TextureLoader();
        const groundTexture = textureLoader.load('assets/img/floor_texture_marte.jpg');
        const groundMaterial = new THREE.MeshStandardMaterial({
            map: groundTexture,
            roughness: 0.9,
            metalness: 0.1
        });

        this.groundPlane = new THREE.Mesh(groundGeometry, groundMaterial);
        this.groundPlane.rotation.x = -Math.PI / 2;
        this.groundPlane.receiveShadow = true;
        this.scene.add(this.groundPlane);

        this.axesHelper = new THREE.AxesHelper(5);
        this.scene.add(this.axesHelper);

        // Configuração inicial da câmara para a vista exterior
        this.switchToExteriorView();

        window.addEventListener('resize', () => this.onWindowResize());

        this.animate();

        console.log('Three.js scene initialized');
    }

    setupLighting() {
        // Limpa apenas as luzes que estão diretamente na cena (não a da câmara)
        const lightsToRemove = this.scene.children.filter(child => child.isLight && child.parent === this.scene);
        lightsToRemove.forEach(light => this.scene.remove(light));


        if (this.currentView === 'exterior') this.setupExteriorLighting();
        else this.setupInteriorLighting();
    }

    setupExteriorLighting() {
        const ambient = new THREE.AmbientLight(0x404040, 0.8);
        this.scene.add(ambient);

        const directional = new THREE.DirectionalLight(0xffffff, 0.9);
        directional.position.set(10, 10, 5);
        directional.castShadow = true;
        directional.shadow.mapSize.width = 2048;
        directional.shadow.mapSize.height = 2048;
        directional.shadow.bias = -0.0001;

        const shadowCameraSize = 25;
        directional.shadow.camera.near = 0.5;
        directional.shadow.camera.far = 50;
        directional.shadow.camera.left = -shadowCameraSize;
        directional.shadow.camera.right = shadowCameraSize;
        directional.shadow.camera.top = shadowCameraSize;
        directional.shadow.camera.bottom = -shadowCameraSize;
        this.scene.add(directional);

        const hemisphere = new THREE.HemisphereLight(0x443333, 0x111122, 0.4);
        this.scene.add(hemisphere);
    }

    setupInteriorLighting() {
        const ambient = new THREE.AmbientLight(0xffffff, 0.25);
        this.scene.add(ambient);

        const p1 = new THREE.PointLight(0xffffff, 0.4, 20);
        p1.position.set(0, 5, 0);
        this.scene.add(p1);

        const spot = new THREE.SpotLight(0xffffff, 0.6, 20, Math.PI / 4, 0.8, 1);
        spot.position.set(0, 8, 0);
        spot.target.position.set(0, 0, 0);
        spot.castShadow = true;
        spot.shadow.mapSize.width = 2048;
        spot.shadow.mapSize.height = 2048;
        spot.shadow.bias = -0.001;
        spot.shadow.focus = 1;
        this.scene.add(spot);
        this.scene.add(spot.target);
    }

    loadInteriorHabitatModel() {
        const loader = new GLTFLoader();
        const modelPath = 'assets/nave1.glb';

        loader.load(modelPath, (gltf) => {
            const model = gltf.scene;

            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            model.position.y = 1;
            model.scale.set(1, 1, 1);

            model.traverse((child) => {
                if (child.isMesh) {
                    const oldMaterial = child.material;
                    const newMaterial = new THREE.MeshStandardMaterial({
                        color: oldMaterial.color,
                        map: oldMaterial.map,
                        transparent: oldMaterial.transparent,
                        opacity: oldMaterial.opacity,
                        side: THREE.DoubleSide,
                        roughness: 0.8,
                        metalness: 0.2
                    });
                    child.material = newMaterial;
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            if (this.interiorModel) {
                this.interiorGroup.remove(this.interiorModel);
            }
            this.interiorGroup.add(model);
            this.interiorModel = model;
            console.log('✅ Interior model loaded, materials upgraded.');
        },
            (xhr) => { console.log(`Loading interior model: ${(xhr.loaded / xhr.total * 100).toFixed(1)}%`); },
            (error) => { console.error('❌ CRITICAL: FAILED TO LOAD INTERIOR MODEL.', error); });
    }

    createHabitat(structure, radius, height, levels = 1) {
        this.clearHabitat();
        let geometry;
        let meshRotation = new THREE.Euler(0, 0, 0);

        // Escolhe a geometria com base no tipo de estrutura
        switch (structure) {
            case 'sphere':
                geometry = new THREE.SphereGeometry(radius, 32, 32);
                break;
            case 'torus':
                geometry = new THREE.TorusGeometry(radius, radius / 3, 16, 100);
                break;
            case 'modular':
                // Placeholder para modular: um caixote
                geometry = new THREE.BoxGeometry(radius * 2, height, radius * 2);
                break;
            case 'horizontal':
                geometry = new THREE.CylinderGeometry(radius, radius, height, 64);
                // Gira o cilindro para ficar deitado
                meshRotation.x = Math.PI / 2;
                break;
            case 'vertical':
                // Um cilindro mais alto e fino
                geometry = new THREE.CylinderGeometry(radius * 0.7, radius * 0.7, height * 1.2, 64);
                break;
            case 'cylinder':
            default:
                geometry = new THREE.CylinderGeometry(radius, radius, height, 64);
                break;
        }

        const material = new THREE.MeshPhongMaterial({
            color: 0x88aaff,
            opacity: 0.75,
            transparent: true,
            side: THREE.DoubleSide
        });

        this.habitatMesh = new THREE.Mesh(geometry, material);
        this.habitatMesh.rotation.copy(meshRotation); // Aplica a rotação

        // Levanta o habitat para a base ficar no chão
        this.habitatMesh.position.y = (structure === 'torus' || structure === 'sphere') ? radius : height / 2;
        if (structure === 'horizontal') this.habitatMesh.position.y = radius;


        this.habitatMesh.castShadow = true;
        this.habitatMesh.receiveShadow = true;
        this.exteriorGroup.add(this.habitatMesh);

        // As funções de detalhes precisam ser ajustadas para cada forma, mas manteremos como está por agora
        // if (levels > 1) this.createInternalLevels(radius, height, levels);
        // this.addHabitatDetails(structure, radius, height);

        return this.habitatMesh;
    }

    updateGroundTexture(destination) {
        let texturePath = '';
        switch (destination) {
            case 'lunar-surface':
                texturePath = 'assets/img/floor_texture.jpg';
                break;
            case 'mars-surface':
                texturePath = 'assets/img/floor_texture_marte.jpg';
                break;
            case 'mars-transit':
            case 'gateway':
                texturePath = 'assets/img/floor_texture_grid.jpg';
                break;
            default:
                texturePath = 'assets/img/floor_texture_marte.jpg';
        }
        if (!this.groundPlane) {
            console.error("O chão (groundPlane) não foi encontrado na cena.");
            return;
        }
        const loader = new THREE.TextureLoader();
        loader.load(texturePath, (newTexture) => {
            this.groundPlane.material.map = newTexture;
            this.groundPlane.material.needsUpdate = true;
            console.log(`Textura do chão atualizada para: ${destination}`);
        }, undefined, () => {
            console.error(`Falha ao carregar a textura: ${texturePath}`);
        });
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
            this.exteriorGroup.add(floor); // Adiciona ao exterior para ser visto com a casca
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
            w.position.set(Math.cos(angle) * (radius), height / 4, Math.sin(angle) * (radius));
            w.lookAt(0, height / 4, 0);
            this.exteriorGroup.add(w);
        }
    }

    addDockingPorts(structure, radius, height) {
        const geo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
        const mat = new THREE.MeshPhongMaterial({ color: 0x666666 });
        if (structure === 'cylinder' || structure === 'horizontal') {
            const p1 = new THREE.Mesh(geo, mat);
            p1.position.set(0, 0, radius + 0.1);
            p1.rotation.x = Math.PI / 2;
            const p2 = new THREE.Mesh(geo, mat);
            p2.position.set(0, 0, -radius - 0.1);
            p2.rotation.x = Math.PI / 2;
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
    }

    switchToInteriorView() {
        this.currentView = 'interior';

        this.exteriorGroup.visible = false;
        this.interiorGroup.visible = true;

        this.setupLighting();

      
        this.camera.position.set(15, 8, 15);
        this.controls.target.set(0, 0, 0);

     
        this.controls.minDistance = 50;
        this.controls.maxDistance = 5000;

        this.controls.update();
        console.log('Switched to INTERIOR view');
    }

    switchToExteriorView() {
        this.currentView = 'exterior';

        this.exteriorGroup.visible = true;
        this.interiorGroup.visible = false;

        this.setupLighting();

       
        this.camera.position.set(20, 10, 20);
       
        this.controls.target.set(0, 0, 0);

   
        this.controls.minDistance = 20;
        this.controls.maxDistance = 50;

        this.controls.update();
        console.log('Switched to EXTERIOR view');
    }

    clearHabitat() {
        while (this.exteriorGroup.children.length > 0) {
            this.exteriorGroup.remove(this.exteriorGroup.children[0]);
        }
        this.habitatMesh = null;
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        const minCameraHeight = 1;
        if (this.camera.position.y < minCameraHeight) {
            this.camera.position.y = minCameraHeight;
        }
        if (this.currentView === 'exterior' && this.habitatMesh && window.habitatBuilder) {
            const rotationSpeed = window.habitatBuilder.getRotationSpeed();
            this.habitatMesh.rotation.y += rotationSpeed * 0.01;
        }
        this.renderer.render(this.scene, this.camera);
    }
}