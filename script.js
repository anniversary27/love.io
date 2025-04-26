let scene, camera, renderer, controls, model;
let rainDrops;
let rainGeometry;
let rainMaterial;
let autoRotate = true; // Flag to enable/disable auto-rotation
let backgroundMusic; // Background music audio element
let isMusicPlaying = false; // Track if music is playing
let loadingScreen;

function init() {
    // Setup background music
    setupBackgroundMusic();

    // Inisialisasi loadingScreen
    loadingScreen = document.createElement('div');
    loadingScreen.id = 'loading-screen';
    loadingScreen.style.position = 'fixed';
    loadingScreen.style.top = '0';
    loadingScreen.style.left = '0';
    loadingScreen.style.width = '100%';
    loadingScreen.style.height = '100%';
    loadingScreen.style.backgroundColor = 'rgb(0, 0, 0)';
    loadingScreen.style.display = 'flex';
    loadingScreen.style.justifyContent = 'center';
    loadingScreen.style.alignItems = 'center';
    loadingScreen.style.zIndex = '1000';
    loadingScreen.innerHTML = '<div style="color: white; font-size: 24px;">Hai Sayang! Semoga kamu suka yaa >_< </div>';
    document.body.appendChild(loadingScreen);

    // Menggunakan canvas yang sudah ada di HTML
    const canvas = document.getElementById('three-canvas');

    
    
    scene = new THREE.Scene();
    // Darker blue background for rain atmosphere
    scene.background = new THREE.Color(0x101025);

    // Sesuaikan camera berdasarkan ukuran canvas
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 8);

    // Gunakan canvas yang sudah ada
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas,
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // Inisialisasi OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.autoRotate = false; // We'll handle rotation manually

    // Add a soft blue light to simulate rainy day lighting
    const ambientLight = new THREE.AmbientLight(0xaaccff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Add some fog for atmospheric effect
    scene.fog = new THREE.FogExp2(0x101025, 0.015);

    // Load model
    const loader = new THREE.GLTFLoader();
    loader.load(
        'aset/modelu/bunga.glb',
        function (gltf) {
            model = gltf.scene;
            model.scale.set(9, 9, 9);
            model.position.set(0, 1.2, 0); // Posisi di tengah
            scene.add(model);
            loadingScreen.style.display = 'none';
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('An error happened', error);
            loadingScreen.innerHTML = '<div style="color: red; font-size: 24px;">Error loading model!</div>';
        }
    );

    // Use rain instead of stars
    addRain();
    setupMonthsGallery();
    // Removed setupImageScrolling() call
    createControlPanel();
    
    // Add a rain sound option to the control panel
    addRainSoundToggle();
    
    window.addEventListener('resize', onWindowResize);
    
    // Listener untuk interaksi dengan model
    // renderer.domElement.addEventListener('mousedown', onMouseDown);
    // renderer.domElement.addEventListener('mousemove', onMouseMove);
    // renderer.domElement.addEventListener('mouseup', onMouseUp);
    // document.addEventListener('keydown', onKeyDown);

    animate();
}

function setupBackgroundMusic() {
    // Create audio element
    backgroundMusic = document.createElement('audio');
    backgroundMusic.id = 'background-music';
    backgroundMusic.loop = true; // Loop the audio
    
    // Set source - replace with your actual music file path
    const source = document.createElement('source');
    source.src = 'aset/musik/astrobacksound.mp3'; // Replace with your actual music path
    source.type = 'audio/mpeg';
    
    backgroundMusic.appendChild(source);
    document.body.appendChild(backgroundMusic);
    
    // Set volume
    backgroundMusic.volume = 1; // 50% volume
    
    // Add event listener for autoplay issues
    document.addEventListener('click', function() {
        if (!isMusicPlaying) {
            playBackgroundMusic();
        }
    }, { once: true });
}

function playBackgroundMusic() {
    backgroundMusic.play()
        .then(() => {
            isMusicPlaying = true;
            updateMusicButton();
        })
        .catch(error => {
            console.error('Audio playback failed:', error);
        });
}

function pauseBackgroundMusic() {
    backgroundMusic.pause();
    isMusicPlaying = false;
    updateMusicButton();
}

function toggleBackgroundMusic() {
    if (isMusicPlaying) {
        pauseBackgroundMusic();
    } else {
        playBackgroundMusic();
    }
}

function updateMusicButton() {
    const musicButton = document.getElementById('music-toggle');
    if (musicButton) {
        musicButton.textContent = isMusicPlaying ? '🔊 Music Off' : '🔈 Music On';
    }
}

function createControlPanel() {
    // Create control panel container
    const controlPanel = document.createElement('div');
    controlPanel.id = 'control-panel';
    controlPanel.style.position = 'fixed';
    controlPanel.style.bottom = '20px';
    controlPanel.style.right = '20px';
    controlPanel.style.zIndex = '100';
    controlPanel.style.display = 'flex';
    controlPanel.style.flexDirection = 'column';
    controlPanel.style.gap = '10px';
    
    // Create rotation toggle button
    const rotationButton = document.createElement('button');
    rotationButton.id = 'rotation-toggle';
    rotationButton.textContent = 'Toggle Auto-Rotation';
    rotationButton.className = 'control-button';
    rotationButton.addEventListener('click', () => {
        autoRotate = !autoRotate;
        rotationButton.textContent = autoRotate ? 'Stop Rotation' : 'Start Rotation';
    });
    
    // Create music toggle button
    const musicButton = document.createElement('button');
    musicButton.id = 'music-toggle';
    musicButton.textContent = '🔈 Music On';
    musicButton.className = 'control-button';
    musicButton.addEventListener('click', toggleBackgroundMusic);
    
    // Add buttons to panel
    controlPanel.appendChild(rotationButton);
    controlPanel.appendChild(musicButton);
    
    // Add panel to document
    document.body.appendChild(controlPanel);
    
    // Add styles for buttons
    const style = document.createElement('style');
    style.textContent += `
        .control-button {
            padding: 10px 15px;
            background-color: transparent;
            color: white;
            border: 1px solid #555;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.3s;
        }
        
        .control-button:hover {
            background-color: transparent;
        }
    `;
    document.head.appendChild(style);
}

// Add rain sound functionality
function addRainSoundToggle() {
    // Create rain audio element
    const rainSound = document.createElement('audio');
    rainSound.id = 'rain-sound';
    rainSound.loop = true;
    
    const rainSource = document.createElement('source');
    rainSource.src = 'aset/musik/rain.mp3'; // Make sure to add a rain sound file to your project
    rainSource.type = 'audio/mpeg';
    
    rainSound.appendChild(rainSource);
    rainSound.volume = 0.3; // Lower volume for ambient sound
    document.body.appendChild(rainSound);
    
    // Add rain toggle button to control panel
    const controlPanel = document.getElementById('control-panel');
    if (controlPanel) {
        const rainButton = document.createElement('button');
        rainButton.id = 'rain-toggle';
        rainButton.textContent = '🌧️ Rain Sound';
        rainButton.className = 'control-button';
        
        let isRainPlaying = false;
        
        rainButton.addEventListener('click', () => {
            if (isRainPlaying) {
                rainSound.pause();
                rainButton.textContent = '🌧️ Rain Sound';
            } else {
                rainSound.play().catch(error => {
                    console.error('Rain sound playback failed:', error);
                });
                rainButton.textContent = '🌧️ Rain Sound Off';
            }
            isRainPlaying = !isRainPlaying;
        });
        
        controlPanel.appendChild(rainButton);
    }
}

// Removed setupImageScrolling() function

function setupMonthsGallery() {
    // Daftar bulan dan gambar
    const months = [
        "April", "May", "June", "July", "August", "September", 
        "October", "November", "December", "January", "February", "March", "Aprill", "_"
    ];

    const monthImages = {
        "April": ["img/apr1.jpg", "img/apr2.jpg", "img/apr3.jpg", "img/apr4.jpg", "img/apr5.jpg", "img/apr6.jpg"],
        "May": ["img/may1.jpg", "img/may2.jpg", "img/may3.jpg", "img/may4.jpg", "img/may5.jpg", "img/may6.jpg"],
        "June": ["img/jun1.jpg", "img/jun2.jpg", "img/jun3.jpg", "img/jun4.jpg", "img/jun5.jpg", "img/jun6.jpg"],
        "July": ["img/jul1.jpg", "img/jul2.jpg", "img/jul3.jpg", "img/jul4.jpg", "img/jul5.jpg", "img/jul6.jpg", "img/jul7.jpg"],
        "August": ["img/aug1.jpg", "img/aug2.jpg", "img/aug3.jpg", "img/aug4.jpg", "img/aug5.jpg", "img/aug6.jpg"],
        "September": ["img/sep1.jpg", "img/sep2.jpg", "img/sep3.jpg", "img/sep4.jpg", "img/sep7.jpg","img/sep5.jpg", "img/sep6.jpg"],
        "October": ["img/oct1.jpg", "img/oct2.jpg", "img/oct3.jpg", "img/oct4.jpg", "img/oct5.jpg"],
        "November": ["img/nov1.jpg", "img/nov2.jpg", "img/nov3.jpg", "img/nov4.jpg", "img/nov5.jpg", "img/nov6.jpg"],
        "December": ["img/dec1.jpg", "img/dec2.jpg", "img/dec3.jpg", "img/dec4.jpg", "img/dec5.jpg", "img/dec6.jpg", "img/dec7.jpg", "img/dec8.png"],
        "January": ["img/jan1.jpg", "img/jan2.jpg", "img/jan3.jpg", "img/jan4.jpg", "img/jan5.jpg", "img/jan6.jpg"],
        "February": ["img/feb1.jpg", "img/feb2.jpg", "img/feb3.jpg", "img/feb4.jpg", "img/feb5.jpg", "img/feb6.jpg"],
        "March": ["img/mar1.jpg", "img/mar2.jpg", "img/mar3.jpg", "img/mar4.jpg", "img/mar5.jpg", "img/mar6.jpg"],
        "Aprill": ["img/apr11.jpg", "img/apr12.jpg", "img/apr15.jpg", "img/apr16.jpg", "img/apr13.jpg", "img/apr14.jpg"],
        "_": ["img/apr17.jpg", "img/apr18.jpg", "img/apr19.jpg", "img/apr20.jpg", "img/apr21.jpg", "img/apr22.jpg",]
    };

    const container = document.getElementById("months-container");
    if (container) {
        months.forEach(month => {
            const monthContainer = document.createElement('div');
            monthContainer.className = 'month-item';
            
            const monthHeader = document.createElement('h3');
            monthHeader.textContent = month;
            monthContainer.appendChild(monthHeader);
            
            const imagesContainer = document.createElement('div');
            imagesContainer.className = 'month-images';
            
            monthImages[month].forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.alt = `${month} memory`;
                img.className = 'month-image';
                img.addEventListener('click', () => {
                    // Mungkin tambahkan kode untuk menampilkan gambar dalam modal
                    console.log(`Clicked image: ${imgSrc}`);
                });
                imagesContainer.appendChild(img);
            });
            
            monthContainer.appendChild(imagesContainer);
            container.appendChild(monthContainer);
        });
    }
}

function setModelRotation(view) {
    if (!model) return;

    let targetRotationY;
    switch (view) {
        case 'front':
            targetRotationY = 0;
            break;
        case 'side':
            targetRotationY = Math.PI / 2;
            break;
        case 'back':
            targetRotationY = Math.PI;
            break;
    }

    model.rotation.y = targetRotationY;
}

let isDragging = false, previousMousePosition = { x: 0, y: 0 };

function onMouseDown(event) {
    isDragging = true;
    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
    
    // Disable auto-rotation while user is interacting
    autoRotate = false;
    const rotationButton = document.getElementById('rotation-toggle');
    if (rotationButton) {
        rotationButton.textContent = 'Start Rotation';
    }
}

function onMouseMove(event) {
    if (!isDragging || !model) return;
    
    const deltaX = event.clientX - previousMousePosition.x;
    const deltaY = event.clientY - previousMousePosition.y;
    
    model.rotation.y += deltaX * 0.01;
    model.rotation.x += deltaY * 0.01;
    
    previousMousePosition.x = event.clientX;
    previousMousePosition.y = event.clientY;
}

function onMouseUp() {
    isDragging = false;
}

function onKeyDown(event) {
    if (!model) return;
    const speed = 0.2;
    
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            model.position.z -= speed;
            break;
        case 'ArrowDown':
        case 's':
            model.position.z += speed;
            break;
        case 'ArrowLeft':
        case 'a':
            model.position.x -= speed;
            break;
        case 'ArrowRight':
        case 'd':
            model.position.x += speed;
            break;
        case 'm': // Add shortcut key for toggling music
            toggleBackgroundMusic();
            break;
        case 'r': // Add shortcut key for toggling rotation
            autoRotate = !autoRotate;
            const rotationButton = document.getElementById('rotation-toggle');
            if (rotationButton) {
                rotationButton.textContent = autoRotate ? 'Stop Rotation' : 'Start Rotation';
            }
            break;
    }
}

function addRain() {
    const rainCount = 1500;
    rainGeometry = new THREE.BufferGeometry();
    const rainPositions = [];
    const rainVelocities = [];
    
    // Create raindrops with random positions
    for (let i = 0; i < rainCount; i++) {
        // Position raindrops in a volume above the camera
        const x = (Math.random() - 0.5) * 60;
        const y = Math.random() * 50 + 20; // Position above camera
        const z = (Math.random() - 0.5) * 60;
        
        rainPositions.push(x, y, z);
        
        // Store velocity for each raindrop (to be used in animation)
        // Different velocities for varied rain effect
        rainVelocities.push(0.5 + Math.random() * 0.8); // Vertical velocity
    }
    
    rainGeometry.setAttribute('position', new THREE.Float32BufferAttribute(rainPositions, 3));
    
    // Create a custom shader material for rain
    rainMaterial = new THREE.PointsMaterial({
        color: 0xaaaaff,       // Slightly blue tint
        size: 0.1,             // Small raindrop size
        transparent: true,
        opacity: 0.6,          // Semi-transparent
        blending: THREE.AdditiveBlending,
    });
    
    // Create the rain particle system
    rainDrops = new THREE.Points(rainGeometry, rainMaterial);
    rainDrops.userData.velocities = rainVelocities;
    scene.add(rainDrops);
}

function animateRain() {
    if (!rainDrops) return;
    
    const positions = rainDrops.geometry.attributes.position.array;
    const velocities = rainDrops.userData.velocities;
    
    // Update each raindrop position
    for (let i = 0; i < positions.length; i += 3) {
        // Move raindrop down based on its velocity
        positions[i + 1] -= velocities[i/3];
        
        // If raindrop is below a certain point, reset its position to top
        if (positions[i + 1] < -20) {
            positions[i] = (Math.random() - 0.5) * 60; // Random X
            positions[i + 1] = 50; // Reset to top
            positions[i + 2] = (Math.random() - 0.5) * 60; // Random Z
        }
    }
    
    // Update the geometry
    rainDrops.geometry.attributes.position.needsUpdate = true;
}

function animateModel() {
    if (model && autoRotate) {
        // Rotate slowly around Y axis
        model.rotation.y += 0.005;
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    animateRain(); // Use rain animation instead of stars
    animateModel(); // Animate the 3D model rotation
    renderer.render(scene, camera);
}

// Inisialisasi ketika halaman dimuat
window.addEventListener('load', init);

// Tambahkan fungsi untuk scrolling smooth
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add styles for the UI elements
const style = document.createElement('style');
style.textContent = `
#volume-control {
    width: 100%;
    margin-top: 5px;
}

.audio-info {
    position: fixed;
    bottom: 80px;
    right: 20px;
    background-color: transparent;
    color: white;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 12px;
    z-index: 100;
    display: none;
}
`;
document.head.appendChild(style);