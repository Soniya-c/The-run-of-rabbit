// THREEJS RELATED VARIABLES 
var scene, // The 3D scene where all objects are rendered
    camera, // The camera that views the scene
    fieldOfView, // Field of view for the camera
    aspectRatio, // Aspect ratio of the viewport
    nearPlane, // Near clipping plane for the camera
    farPlane, // Far clipping plane for the camera
    globalLight, // Ambient light in the scene
    shadowLight, // Directional light that casts shadows
    backLight, // Additional light for depth
    renderer, // The WebGL renderer that draws the scene
    container, // The HTML element that contains the canvas
    controls, // Controls for camera movement (if used)
    clock; // Clock to track time for animations

var delta = 0; // Time difference for frame updates
var floorRadius = 200; // Radius of the floor
var speed = 6; // Initial speed of the game
var distance = 0; // Distance traveled by the hero
var level = 1; // Current game level
var levelInterval; // Interval for level updates
var levelUpdateFreq = 3000; // Frequency of level updates in milliseconds
var initSpeed = 5; // Initial speed of the hero
var maxSpeed = 48; // Maximum speed the hero can reach
var monsterPos = .65; // Initial position of the monster
var monsterPosTarget = .65; // Target position for the monster
var floorRotation = 0; // Current rotation of the floor
var collisionObstacle = 10; // Collision distance for obstacles
var collisionBonus = 20; // Collision distance for bonuses
var gameStatus = "play"; // Current status of the game (play, gameOver, etc.)
var cameraPosGame = 160; // Camera position during gameplay
var cameraPosGameOver = 260; // Camera position during game over
var monsterAcceleration = 0.004; // Acceleration of the monster
var malusClearColor = 0xb44b39; // Color for the background when a malus occurs
var malusClearAlpha = 0; // Alpha transparency for the background
var audio = new Audio('https://s3-us-west-2.amazonaws.com/s.cdpn.io/264161/Antonio-Vivaldi-Summer_01.mp3'); // Background audio for the game
var fieldGameOver, fieldDistance; // DOM elements for game over and distance display

// SCREEN & MOUSE VARIABLES
var HEIGHT, WIDTH, windowHalfX, windowHalfY, // Dimensions of the viewport
    mousePos = { // Object to store mouse position
        x: 0,
        y: 0
    };

// 3D OBJECTS VARIABLES
var hero; // Variable to hold the hero object

// Materials for different parts of the characters
var blackMat = new THREE.MeshPhongMaterial({
    color: 0x100707, // Color for the black material
    shading: THREE.FlatShading, // Flat shading for the material
});

var brownMat = new THREE.MeshPhongMaterial({
    color: 0xb44b39, // Color for the brown material
    shininess: 0, // No shininess
    shading: THREE.FlatShading, // Flat shading for the material
});

var greenMat = new THREE.MeshPhongMaterial({
    color: 0x7abf8e, // Color for the green material
    shininess: 0, // No shininess
    shading: THREE.FlatShading, // Flat shading for the material
});

var pinkMat = new THREE.MeshPhongMaterial({
    color: 0xdc5f45, // Color for the pink material
    shininess: 0, // No shininess
    shading: THREE.FlatShading, // Flat shading for the material
});

var lightBrownMat = new THREE.MeshPhongMaterial({
    color: 0xe07a57, // Color for the light brown material
    shading: THREE.FlatShading, // Flat shading for the material
});

var whiteMat = new THREE.MeshPhongMaterial({
    color: 0xa49789, // Color for the white material
    shading: THREE.FlatShading, // Flat shading for the material
});

var skinMat = new THREE.MeshPhongMaterial({
    color: 0xff9ea5, // Color for the skin material
    shading: THREE.FlatShading // Flat shading for the material
});

// OTHER VARIABLES
var PI = Math.PI; // Constant for PI

// INIT THREE JS, SCREEN AND MOUSE EVENTS
var score = 0; // Declare the score variable here
var highScore = 0; // Variable to hold the high score

// Function to initialize the screen and 3D environment
function initScreenAnd3D() {
    HEIGHT = window.innerHeight; // Get the height of the window
    WIDTH = window.innerWidth; // Get the width of the window
    windowHalfX = WIDTH / 2; // Calculate half the width for centering
    windowHalfY = HEIGHT / 2; // Calculate half the height for centering

    scene = new THREE.Scene(); // Create a new 3D scene

    scene.fog = new THREE.Fog(0xd6eae6, 160, 350); // Add fog to the scene for depth effect

    aspectRatio = WIDTH / HEIGHT; // Calculate the aspect ratio
    fieldOfView = 50; // Set the field of view for the camera
    nearPlane = 1; // Set the near clipping plane
    farPlane = 2000; // Set the far clipping plane
    camera = new THREE.PerspectiveCamera(
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane
    ); // Create a perspective camera
    camera.position.x = 0; // Set the camera's x position
    camera.position.z = cameraPosGame; // Set the camera's z position for gameplay
    camera.position.y = 30; // Set the camera's y position
    camera.lookAt(new THREE.Vector3(0, 30, 0)); // Make the camera look at the center of the scene

    renderer = new THREE.WebGLRenderer({
        alpha: true, // Enable transparency
        antialias: true // Enable anti-aliasing for smoother edges
    });
    renderer.setPixelRatio(window.devicePixelRatio); // Set the pixel ratio for high DPI displays
    renderer.setClearColor(malusClearColor, malusClearAlpha); // Set the background color

    renderer.setSize(WIDTH, HEIGHT); // Set the size of the renderer
    renderer.shadowMap.enabled = true; // Enable shadow mapping

    container = document.getElementById('world'); // Get the container element
    container.appendChild(renderer.domElement); // Append the renderer's canvas to the container

    // Event listeners for window resizing and mouse clicks
    window.addEventListener('resize', handleWindowResize, false); // Handle window resize
    document.addEventListener('mousedown', handleMouseDown, false); // Handle mouse down events
    document.addEventListener("touchend", handleMouseDown, false); // Handle touch end events

    clock = new THREE.Clock(); // Create a clock to track time
}

// Function to handle game over logic
function gameOver() {
    if (score > highScore) { // Check if the current score is higher than the high score
        highScore = score; // Update the high score
    }
    score = 0; // Reset the score to 0
    updateScoreboard(); // Update the displayed score to 0

    // Alert the player with their score and high score
    alert("Game Over! Your score was " + score + " and the highest score was " + highScore);

    // Optionally, restart the game logic here
    startGame(); // Call a function to restart the game if you have one
}

// Function to update the scoreboard display
function updateScoreboard() {
    document.getElementById('scoreboard').innerText = 'Score: ' + score; // Update the scoreboard with the current score
}

// Function to handle window resizing
function handleWindowResize() {
    HEIGHT = window.innerHeight; // Update height on resize
    WIDTH = window.innerWidth; // Update width on resize
    windowHalfX = WIDTH / 2; // Recalculate half width
    windowHalfY = HEIGHT / 2; // Recalculate half height
    renderer.setSize(WIDTH, HEIGHT); // Update renderer size
    camera.aspect = WIDTH / HEIGHT; // Update camera aspect ratio
    camera.updateProjectionMatrix(); // Update the camera projection matrix
}

// Function to handle mouse down events
function handleMouseDown(event) {
    if (gameStatus == "play") hero.jump(); // If the game is in play, make the hero jump
    else if (gameStatus == "readyToReplay") {
        replay(); // If ready to replay, call the replay function
    }
}

// Function to create lights in the scene
function createLights() {
    globalLight = new THREE.AmbientLight(0xffffff, .9); // Create ambient light

    shadowLight = new THREE.DirectionalLight(0xffffff, 1); // Create directional light
    shadowLight.position.set(-30, 40, 20); // Set the position of the shadow light
    shadowLight.castShadow = true; // Enable shadow casting for the light
    shadowLight.shadow.camera.left = -400; // Set the left boundary of the shadow camera
    shadowLight.shadow.camera.right = 400; // Set the right boundary of the shadow camera
    shadowLight.shadow.camera.top = 400; // Set the top boundary of the shadow camera
    shadowLight.shadow.camera.bottom = -400; // Set the bottom boundary of the shadow camera
    shadowLight.shadow.camera.near = 1; // Set the near clipping plane for the shadow camera
    shadowLight.shadow.camera.far = 2000; // Set the far clipping plane for the shadow camera
    shadowLight.shadow.mapSize.width = shadowLight.shadow.mapSize.height = 2048; // Set the size of the shadow map

    scene.add(globalLight); // Add ambient light to the scene
    scene.add(shadowLight); // Add directional light to the scene
}

// Function to create the floor of the game
function createFloor() {
    // Create a shadow for the floor
    floorShadow = new THREE.Mesh(new THREE.SphereGeometry(floorRadius, 50, 50), new THREE.MeshPhongMaterial({
        color: 0x7abf8e, // Color for the shadow
        specular: 0x000000, // No specular highlights
        shininess: 1, // Shininess level
        transparent: true, // Enable transparency
        opacity: .5 // Set opacity
    }));
    floorShadow.receiveShadow = true; // Enable shadow receiving for the shadow

    // Create the grass surface of the floor
    floorGrass = new THREE.Mesh(new THREE.SphereGeometry(floorRadius - .5, 50, 50), new THREE.MeshBasicMaterial({
        color: 0x7abf8e // Color for the grass
    }));
    floorGrass.receiveShadow = false; // Grass does not receive shadows

    // Group to hold the floor components
    floor = new THREE.Group();
    floor.position.y = -floorRadius; // Position the floor

    floor.add(floorShadow); // Add shadow to the floor group
    floor.add(floorGrass); // Add grass to the floor group
    scene.add(floor); // Add the floor group to the scene
}

// Hero constructor function
Hero = function () {
    this.status = "running"; // Initial status of the hero
    this.runningCycle = 0; // Cycle variable for running animation
    this.mesh = new THREE.Group(); // Create a group for the hero's mesh
    this.body = new THREE.Group(); // Create a group for the hero's body
    this.mesh.add(this.body); // Add the body to the hero's mesh

    // Create the torso of the hero
    var torsoGeom = new THREE.CubeGeometry(7, 7, 10, 1);
    this.torso = new THREE.Mesh(torsoGeom, brownMat); // Create torso mesh with brown material
    this.torso.position.z = 0; // Position the torso
    this.torso.position.y = 7; // Position the torso
    this.torso.castShadow = true; // Enable shadow casting for the torso
    this.body.add(this.torso); // Add torso to the body

    // Create the pants of the hero
    var pantsGeom = new THREE.CubeGeometry(9, 9, 5, 1);
    this.pants = new THREE.Mesh(pantsGeom, whiteMat); // Create pants mesh with white material
    this.pants.position.z = -3; // Position the pants
    this.pants.position.y = 0; // Position the pants
    this.pants.castShadow = true; // Enable shadow casting for the pants
    this.torso.add(this.pants); // Add pants to the torso

    // Create the tail of the hero
    var tailGeom = new THREE.CubeGeometry(3, 3, 3, 1);
    tailGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, -2)); // Adjust tail geometry
    this.tail = new THREE.Mesh(tailGeom, lightBrownMat); // Create tail mesh with light brown material
    this.tail.position.z = -4; // Position the tail
    this.tail.position.y = 5; // Position the tail
    this.tail.castShadow = true; // Enable shadow casting for the tail
    this.torso.add(this.tail); // Add tail to the torso

    this.torso.rotation.x = -Math.PI / 8; // Rotate the torso

    // Create the head of the hero
    var headGeom = new THREE.CubeGeometry(10, 10, 13, 1);
    headGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 7.5)); // Adjust head geometry position
    this.head = new THREE.Mesh(headGeom, brownMat); // Create head mesh with brown material
    this.head.position.z = 2; // Position the head
    this.head.position.y = 11; // Position the head
    this.head.castShadow = true; // Enable shadow casting for the head
    this.body.add(this.head); // Add head to the body

    // Create right cheek of the hero
    var cheekGeom = new THREE.CubeGeometry(1, 4, 4, 1);
    this.cheekR = new THREE.Mesh(cheekGeom, pinkMat); // Create right cheek mesh with pink material
    this.cheekR.position.x = -5; // Position the right cheek
    this.cheekR.position.z = 7; // Position the right cheek
    this.cheekR.position.y = -2.5; // Position the right cheek
    this.cheekR.castShadow = true; // Enable shadow casting for the right cheek
    this.head.add(this.cheekR); // Add right cheek to the head

    // Create left cheek by cloning the right cheek
    this.cheekL = this.cheekR.clone(); // Clone the right cheek
    this.cheekL.position.x = -this.cheekR.position.x; // Position the left cheek
    this.head.add(this.cheekL); // Add left cheek to the head

    // Create the nose of the hero
    var noseGeom = new THREE.CubeGeometry(6, 6, 3, 1);
    this.nose = new THREE.Mesh(noseGeom, lightBrownMat); // Create nose mesh with light brown material
    this.nose.position.z = 13.5; // Position the nose
    this.nose.position.y = 2.6; // Position the nose
    this.nose.castShadow = true; // Enable shadow casting for the nose
    this.head.add(this.nose); // Add nose to the head

    // Create the mouth of the hero
    var mouthGeom = new THREE.CubeGeometry(4, 2, 4, 1);
    mouthGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 3)); // Adjust mouth geometry position
    mouthGeom.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI / 12)); // Rotate mouth geometry
    this.mouth = new THREE.Mesh(mouthGeom, brownMat); // Create mouth mesh with brown material
    this.mouth.position.z = 8; // Position the mouth
    this.mouth.position.y = -4; // Position the mouth
    this.mouth.castShadow = true; // Enable shadow casting for the mouth
    this.head.add(this.mouth); // Add mouth to the head

    // Create front right paw of the hero
    var pawFGeom = new THREE.CubeGeometry(3, 3, 3, 1);
    this.pawFR = new THREE.Mesh(pawFGeom, lightBrownMat); // Create front right paw mesh with light brown material
    this.pawFR.position.x = -2; // Position the front right paw
    this.pawFR.position.z = 6; // Position the front right paw
    this.pawFR.position.y = 1.5; // Position the front right paw
    this.pawFR.castShadow = true; // Enable shadow casting for the front right paw
    this.body.add(this.pawFR); // Add front right paw to the body

    // Create front left paw by cloning the front right paw
    this.pawFL = this.pawFR.clone(); // Clone the front right paw
    this.pawFL.position.x = -this.pawFR.position.x; // Position the front left paw
    this.pawFL.castShadow = true; // Enable shadow casting for the front left paw
    this.body.add(this.pawFL); // Add front left paw to the body

    // Create back left paw of the hero
    var pawBGeom = new THREE.CubeGeometry(3, 3, 6, 1);
    this.pawBL = new THREE.Mesh(pawBGeom, lightBrownMat); // Create back left paw mesh with light brown material
    this.pawBL.position.y = 1.5; // Position the back left paw
    this.pawBL.position.z = 0; // Position the back left paw
    this.pawBL.position.x = 5; // Position the back left paw
    this.pawBL.castShadow = true; // Enable shadow casting for the back left paw
    this.body.add(this.pawBL); // Add back left paw to the body

    // Create back right paw by cloning the back left paw
    this.pawBR = this.pawBL.clone(); // Clone the back left paw
    this.pawBR.position.x = -this.pawBL.position.x; // Position the back right paw
    this.pawBR.castShadow = true; // Enable shadow casting for the back right paw
    this.body.add(this.pawBR); // Add back right paw to the body

    // Create ears for the hero
    var earGeom = new THREE.CubeGeometry(7, 18, 2, 1);
    // Adjust ear geometry vertices for shape
    earGeom.vertices[6].x += 2;
    earGeom.vertices[6].z += .5;
    earGeom.vertices[7].x += 2;
    earGeom.vertices[7].z -= .5;
    earGeom.vertices[2].x -= 2;
    earGeom.vertices[2].z -= .5;
    earGeom.vertices[3].x -= 2;
    earGeom.vertices[3].z += .5;
    earGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 9, 0)); // Position the ears

    this.earL = new THREE.Mesh(earGeom, brownMat); // Create left ear mesh with brown material
    this.earL.position.x = 2; // Position the left ear
    this.earL.position.z = 2.5; // Position the left ear
    this.earL.position.y = 5; // Position the left ear
    this.earL.rotation.z = -Math.PI / 12; // Rotate the left ear
    this.earL.castShadow = true; // Enable shadow casting for the left ear
    this.head.add(this.earL); // Add left ear to the head

    // Create right ear by cloning the left ear
    this.earR = this.earL.clone(); // Clone the left ear
    this.earR.position.x = -this.earL.position.x; // Position the right ear
    this.earR.rotation.z = -this.earL.rotation.z; // Rotate the right ear
    this.earR.castShadow = true; // Enable shadow casting for the right ear
    this.head.add(this.earR); // Add right ear to the head

    // Create eyes for the hero
    var eyeGeom = new THREE.CubeGeometry(2, 4, 4); // Geometry for the eyes
    this.eyeL = new THREE.Mesh(eyeGeom, whiteMat); // Create left eye mesh with white material
    this.eyeL.position.x = 5; // Position the left eye
    this.eyeL.position.z = 5.5; // Position the left eye
    this.eyeL.position.y = 2.9; // Position the left eye
    this.eyeL.castShadow = true; // Enable shadow casting for the left eye
    this.head.add(this.eyeL); // Add left eye to the head

    // Create iris for the left eye
    var irisGeom = new THREE.CubeGeometry(.6, 2, 2); // Geometry for the iris
    this.iris = new THREE.Mesh(irisGeom, blackMat); // Create iris mesh with black material
    this.iris.position.x = 1.2; // Position the iris
    this.iris.position.y = 1; // Position the iris
    this.iris.position.z = 1; // Position the iris
    this.eyeL.add(this.iris); // Add iris to the left eye

    // Create right eye by cloning the left eye
    this.eyeR = this.eyeL.clone(); // Clone the left eye
    this.eyeR.children[0].position.x = -this.iris.position.x; // Position the iris in the right eye
    this.eyeR.position.x = -this.eyeL.position.x; // Position the right eye
    this.head.add(this.eyeR); // Add right eye to the head

    // Traverse through the body to enable shadow casting and receiving
    this.body.traverse(function (object) {
        if (object instanceof THREE.Mesh) { // Check if the object is a mesh
            object.castShadow = true; // Enable shadow casting
            object.receiveShadow = true; // Enable shadow receiving
        }
    });
}

// BonusParticles constructor function
BonusParticles = function () {
    this.mesh = new THREE.Group(); // Create a group for bonus particles
    var bigParticleGeom = new THREE.CubeGeometry(10, 10, 10, 1); // Geometry for big particles
    var smallParticleGeom = new THREE.CubeGeometry(5, 5, 5, 1); // Geometry for small particles
    this.parts = []; // Array to hold particle meshes
    for (var i = 0; i < 10; i++) { // Loop to create multiple particles
        var partPink = new THREE.Mesh(bigParticleGeom, pinkMat); // Create a big pink particle
        var partGreen = new THREE.Mesh(smallParticleGeom, greenMat); // Create a small green particle
        partGreen.scale.set(.5, .5, .5); // Scale down the green particle
        this.parts.push(partPink); // Add the pink particle to the parts array
        this.parts.push(partGreen); // Add the green particle to the parts array
        this.mesh.add(partPink); // Add the pink particle to the mesh
        this.mesh.add(partGreen); // Add the green particle to the mesh
    }
}

// Function to explode the bonus particles
BonusParticles.prototype.explose = function () {
    var _this = this; // Reference to the current instance
    var explosionSpeed = .5; // Speed of the explosion
    for (var i = 0; i < this.parts.length; i++) { // Loop through each particle
        var tx = -50 + Math.random() * 100; // Random x position for explosion
        var ty = -50 + Math.random() * 100; // Random y position for explosion
        var tz = -50 + Math.random() * 100; // Random z position for explosion
        var p = this.parts[i]; // Get the current particle
        p.position.set(0, 0, 0); // Reset particle position
        p.scale.set(1, 1, 1); // Reset particle scale
        p.visible = true; // Make the particle visible
        var s = explosionSpeed + Math.random() * .5; // Randomize explosion speed
        // Animate the particle's position and scale
        TweenMax.to(p.position, s, { x: tx, y: ty, z: tz, ease: Power4.easeOut });
        TweenMax.to(p.scale, s, { x: .01, y: .01, z: .01, ease: Power4.easeOut, onComplete: removeParticle, onCompleteParams: [p] });
    }
}

// Function to remove a particle after explosion
function removeParticle(p) {
    p.visible = false; // Hide the particle
}

// Hero's run animation function
Hero.prototype.run = function () {
    this.status = "running"; // Set the hero's status to running

    var s = Math.min(speed, maxSpeed); // Get the current speed, capped at maxSpeed

    this.runningCycle += delta * s * .7; // Update the running cycle based on delta time and speed
    this.runningCycle = this.runningCycle % (Math.PI * 2); // Loop the running cycle
    var t = this.runningCycle; // Store the current cycle value

    var amp = 4; // Amplitude for the running animation
    var disp = .2; // Displacement for the running animation

    // BODY ANIMATION
    this.body.position.y = 6 + Math.sin(t - Math.PI / 2) * amp; // Animate the body up and down
    this.body.rotation.x = .2 + Math.sin(t - Math.PI / 2) * amp * .1; // Rotate the body slightly

    // TORSO ANIMATION
    this.torso.rotation.x = Math.sin(t - Math.PI / 2) * amp * .1; // Animate torso rotation
    this.torso.position.y = 7 + Math.sin(t - Math.PI / 2) * amp * .5; // Animate torso position

    // MOUTH ANIMATION
    this.mouth.rotation.x = Math.PI / 16 + Math.cos(t) * amp * .05; // Animate mouth rotation

    // HEAD ANIMATION
    this.head.position.z = 2 + Math.sin(t - Math.PI / 2) * amp * .5; // Animate head position
    this.head.position.y = 8 + Math.cos(t - Math.PI / 2) * amp * .7; // Animate head position
    this.head.rotation.x = -.2 + Math.sin(t + Math.PI) * amp * .1; // Animate head rotation

    // EARS ANIMATION
    this.earL.rotation.x = Math.cos(-Math.PI / 2 + t) * (amp * .2); // Animate left ear rotation
    this.earR.rotation.x = Math.cos(-Math.PI / 2 + .2 + t) * (amp * .3); // Animate right ear rotation

        // EYES ANIMATION
        this.eyeR.scale.y = this.eyeL.scale.y = .7 + Math.abs(Math.cos(-Math.PI / 4 + t * .5)) * .6; // Animate eye scaling

        // TAIL ANIMATION
        this.tail.rotation.x = Math.cos(Math.PI / 2 + t) * amp * .3; // Animate tail rotation
    
        // FRONT RIGHT PAW ANIMATION
        this.pawFR.position.y = 1.5 + Math.sin(t) * amp; // Animate front right paw position
        this.pawFR.rotation.x = Math.cos(t) * Math.PI / 4; // Animate front right paw rotation
    
        this.pawFR.position.z = 6 - Math.cos(t) * amp * 2; // Animate front right paw position
    
        // FRONT LEFT PAW ANIMATION
        this.pawFL.position.y = 1.5 + Math.sin(disp + t) * amp; // Animate front left paw position
        this.pawFL.rotation.x = Math.cos(t) * Math.PI / 4; // Animate front left paw rotation
    
        this.pawFL.position.z = 6 - Math.cos(disp + t) * amp * 2; // Animate front left paw position
    
        // BACK RIGHT PAW ANIMATION
        this.pawBR.position.y = 1.5 + Math.sin(Math.PI + t) * amp; // Animate back right paw position
        this.pawBR.rotation.x = Math.cos(t + Math.PI * 1.5) * Math.PI / 3; // Animate back right paw rotation
    
        this.pawBR.position.z = -Math.cos(Math.PI + t) * amp; // Animate back right paw position
    
        // BACK LEFT PAW ANIMATION
        this.pawBL.position.y = 1.5 + Math.sin(Math.PI + t) * amp; // Animate back left paw position
        this.pawBL.rotation.x = Math.cos(t + Math.PI * 1.5) * Math.PI / 3; // Animate back left paw rotation
    
        this.pawBL.position.z = -Math.cos(Math.PI + t) * amp; // Animate back left paw position
    }
    
    // Hero's jump function
    Hero.prototype.jump = function () {
        if (this.status == "jumping") return; // Prevent jumping if already jumping
        this.status = "jumping"; // Set status to jumping
        var _this = this; // Reference to the current instance
        var totalSpeed = 10 / speed; // Calculate total speed for the jump
        var jumpHeight = 45; // Set the jump height
    
        // Animate ear rotations during the jump
        TweenMax.to(this.earL.rotation, totalSpeed, { x: "+=.3", ease: Back.easeOut });
        TweenMax.to(this.earR.rotation, totalSpeed, { x: "-=.3", ease: Back.easeOut });
    
        // Animate paw rotations during the jump
        TweenMax.to(this.pawFL.rotation, totalSpeed, { x: "+=.7", ease: Back.easeOut });
        TweenMax.to(this.pawFR.rotation, totalSpeed, { x: "-=.7", ease: Back.easeOut });
        TweenMax.to(this.pawBL.rotation, totalSpeed, { x: "+=.7", ease: Back.easeOut });
        TweenMax.to(this.pawBR.rotation, totalSpeed, { x: "-=.7", ease: Back.easeOut });
    
        // Animate tail and mouth during the jump
        TweenMax.to(this.tail.rotation, totalSpeed, { x: "+=1", ease: Back.easeOut });
        TweenMax.to(this.mouth.rotation, totalSpeed, { x: .5, ease: Back.easeOut });
    
        // Animate the hero's position during the jump
        TweenMax.to(this.mesh.position, totalSpeed / 2, { y: jumpHeight, ease: Power2.easeOut });
        TweenMax.to(this.mesh.position, totalSpeed / 2, {
            y: 0, ease: Power4.easeIn, delay: totalSpeed / 2, onComplete: function () {
                _this.status = "running"; // Set status back to running after the jump
            }
        });
    }
    
    // Monster constructor function
    Monster = function () {
        this.runningCycle = 0; // Cycle variable for monster running animation
        this.mesh = new THREE.Group(); // Create a group for the monster's mesh
        this.body = new THREE.Group(); // Create a group for the monster's body
    
        // Create the torso of the monster
        var torsoGeom = new THREE.CubeGeometry(15, 15, 20, 1);
        this.torso = new THREE.Mesh(torsoGeom, blackMat); // Create torso mesh with black material
    // Create the head of the monster
    var headGeom = new THREE.CubeGeometry(20, 20, 40, 1);
    headGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 20)); // Adjust head geometry position
    this.head = new THREE.Mesh(headGeom, blackMat); // Create head mesh with black material
    this.head.position.z = 12; // Position the head
    this.head.position.y = 2; // Position the head

    // Create the mouth of the monster
    var mouthGeom = new THREE.CubeGeometry(10, 4, 20, 1);
    mouthGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, -2, 10)); // Adjust mouth geometry position
    this.mouth = new THREE.Mesh(mouthGeom, blackMat); // Create mouth mesh with black material
    this.mouth.position.y = -8; // Position the mouth
    this.mouth.rotation.x = .4; // Rotate the mouth
    this.mouth.position.z = 4; // Position the mouth

    // Create a holder for the hero inside the monster's mouth
    this.heroHolder = new THREE.Group(); // Create a group for holding the hero
    this.heroHolder.position.z = 20; // Position the holder
    this.mouth.add(this.heroHolder); // Add the holder to the mouth

    // Create teeth for the monster's mouth
    var toothGeom = new THREE.CubeGeometry(2, 2, 1, 1); // Geometry for teeth
    toothGeom.vertices[1].x -= 1; // Adjust tooth geometry vertices
    toothGeom.vertices[4].x += 1; // Adjust tooth geometry vertices
    toothGeom.vertices[5].x += 1; // Adjust tooth geometry vertices
    toothGeom.vertices[0].x -= 1; // Adjust tooth geometry vertices

    // Create multiple teeth and add them to the mouth
    for (var i = 0; i < 3; i++) {
        var toothf = new THREE.Mesh(toothGeom, whiteMat); // Create front tooth mesh with white material
        toothf.position.x = -2.8 + i * 2.5; // Position the front tooth
        toothf.position.y = 1; // Position the front tooth
        toothf.position.z = 19; // Position the front tooth

        var toothl = new THREE.Mesh(toothGeom, whiteMat); // Create left tooth mesh with white material
        toothl.rotation.y = Math.PI / 2; // Rotate the left tooth
        toothl.position.z = 12 + i * 2.5; // Position the left tooth
        toothl.position.y = 1; // Position the left tooth
        toothl.position.x = 4; // Position the left tooth

        var toothr = toothl.clone(); // Clone the left tooth for the right side
        toothl.position.x = -4; // Position the right tooth

        this.mouth.add(toothf); // Add front tooth to the mouth
        this.mouth.add(toothl); // Add left tooth to the mouth
        this.mouth.add(toothr); // Add right tooth to the mouth
    }

    // Create the tongue of the monster
    var tongueGeometry = new THREE.CubeGeometry(6, 1, 14); // Geometry for the tongue
    tongueGeometry.applyMatrix(new THREE.Matrix4().makeTranslation(0, 0, 7)); // Adjust tongue geometry position
    this.tongue = new THREE.Mesh(tongueGeometry, pinkMat); // Create tongue mesh with pink material
    this.tongue.position.z = 2; // Position the tongue
    this.tongue.rotation.x = -.2; // Rotate the tongue
    this.mouth.add(this.tongue); // Add tongue to the mouth

    // Create the nose of the monster
    var noseGeom = new THREE.CubeGeometry(4, 4, 4, 1); // Geometry for the nose
    this.nose = new THREE.Mesh(noseGeom, pinkMat); // Create nose mesh with pink material
    this.nose.position.z = 39.5; // Position the nose
    this.nose.position.y = 9; // Position the nose
    this.head.add(this.nose); // Add nose to the head

    this.head.add(this.mouth); // Add mouth to the head

    // Create eyes for the monster
    var eyeGeom = new THREE.CubeGeometry(2, 3, 3); // Geometry for the eyes
    this.eyeL = new THREE.Mesh(eyeGeom, whiteMat); // Create left eye mesh with white material
    this.eyeL.position.x = 10; // Position the left eye
    this.eyeL.position.z = 5; // Position the left eye
    this.eyeL.position.y = 5; // Position the left eye
    this.eyeL.castShadow = true; // Enable shadow casting for the left eye
    this.head.add(this.eyeL); // Add left eye to the head

    // Create iris for the left eye
    var irisGeom = new THREE.CubeGeometry(.6, 1, 1); // Geometry for the iris
    this.iris = new THREE.Mesh(irisGeom, blackMat); // Create iris mesh with black material
    this.iris.position.x = 1.2; // Position the iris
    this.iris.position.y = -1; // Position the iris
    this.iris.position.z = 1; // Position the iris
    this.eyeL.add(this.iris); // Add iris to the left eye

    // Create right eye by cloning the left eye
    this.eyeR = this.eyeL.clone(); // Clone the left eye
    this.eyeR.children[0].position.x = -this.iris.position.x; // Position the iris in the right eye
    this.eyeR.position.x = -this.eyeL.position.x; // Position the right eye
    this.head.add(this.eyeR); // Add right eye to the head

    // Create ears for the monster
    var earGeom = new THREE.CubeGeometry(8, 6, 2, 1); // Geometry for the ears
    earGeom.vertices[1].x -= 4; // Adjust ear geometry vertices
    earGeom.vertices[4].x += 4; // Adjust ear geometry vertices
    earGeom.vertices[5].x += 4; // Adjust ear geometry vertices
    earGeom.vertices[5].z -= 2; // Adjust ear geometry vertices
    earGeom.vertices[0].x -= 4; // Adjust ear geometry vertices
    earGeom.vertices[0].z -= 2; // Adjust ear geometry vertices

    earGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 3, 0)); // Position the ears

    this.earL = new THREE.Mesh(earGeom, blackMat); // Create left ear mesh with black material
    this.earL.position.x = 6; // Position the left ear
    this.earL.position.z = 1; // Position the left ear
    this.earL.position.y = 10; // Position the left ear
    this.earL.castShadow = true; // Enable shadow casting for the left ear
    this.head.add(this.earL); // Add left ear to the head

    // Create right ear by cloning the left ear
    this.earR = this.earL.clone(); // Clone the left ear
    this.earR.position.x = -this.earL.position.x; // Position the right ear
    this.head.add(this.earR); // Add right ear to the head

    // Create tail for the monster
    var tailGeom = new THREE.CylinderGeometry(5, 2, 20, 4, 1); // Geometry for the tail
    tailGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 10, 0)); // Position the tail
    tailGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2)); // Rotate the tail
    tailGeom.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI / 4)); // Rotate the tail

    this.tail = new THREE.Mesh(tailGeom, blackMat); // Create tail mesh with black material
    this.tail.position.z = -10; // Position the tail
    this.tail.position.y = 4; // Position the tail
    this.torso.add(this.tail); // Add tail to the torso

    // Create paws for the monster
    var pawGeom = new THREE.CylinderGeometry(1.5, 0, 10); // Geometry for the paws
    pawGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, -5, 0)); // Position the paws

    // Create front left paw
    this.pawFL = new THREE.Mesh(pawGeom, blackMat); // Create front left paw mesh with black material
    this.pawFL.position.y = -7.5; // Position the front left paw
    this.pawFL.position.z = 8.5; // Position the front left paw
    this.pawFL.position.x = 5.5; // Position the front left paw
    this.torso.add(this.pawFL); // Add front left paw to the torso

    // Create front right paw by cloning the front left paw
    this.pawFR = this.pawFL.clone(); // Clone the front left paw for the front right paw
    this.pawFR.position.x = -this.pawFL.position.x; // Position the front right paw
    this.torso.add(this.pawFR); // Add front right paw to the torso

    // Create back right paw by cloning the front right paw
    this.pawBR = this.pawFR.clone(); // Clone the front right paw for the back right paw
    this.pawBR.position.z = -this.pawFL.position.z; // Position the back right paw
    this.torso.add(this.pawBR); // Add back right paw to the torso

    // Create back left paw by cloning the back right paw
    this.pawBL = this.pawBR.clone(); // Clone the back right paw for the back left paw
    this.pawBL.position.x = this.pawFL.position.x; // Position the back left paw
    this.torso.add(this.pawBL); // Add back left paw to the torso

    // Add the body and head to the monster's mesh
    this.mesh.add(this.body); // Add body to the monster's mesh
    this.torso.add(this.head); // Add head to the torso
    this.body.add(this.torso); // Add torso to the body

    // Enable shadow casting and receiving for the monster's parts
    this.torso.castShadow = true; // Enable shadow casting for the torso
    this.head.castShadow = true; // Enable shadow casting for the head
    this.pawFL.castShadow = true; // Enable shadow casting for the front left paw
    this.pawFR.castShadow = true; // Enable shadow casting for the front right paw
    this.pawBL.castShadow = true; // Enable shadow casting for the back left paw
    this.pawBR.castShadow = true; // Enable shadow casting for the back right paw

    this.body.rotation.y = Math.PI / 2; // Rotate the body to face forward
}

// Monster's run animation function
Monster.prototype.run = function () {
    var s = Math.min(speed, maxSpeed); // Get the current speed, capped at maxSpeed
    this.runningCycle += delta * s * .7; // Update the running cycle based on delta time and speed
    this.runningCycle = this.runningCycle % (Math.PI * 2); // Loop the running cycle
    var t = this.runningCycle; // Store the current cycle value

    // Animate the monster's paws
    this.pawFR.rotation.x = Math.sin(t) * Math.PI / 4; // Animate front right paw rotation
    this.pawFR.position.y = -5.5 - Math.sin(t); // Animate front right paw position
    this.pawFR.position.z = 7.5 + Math.cos(t); // Animate front right paw position

    this.pawFL.rotation.x = Math.sin(t + .4) * Math.PI / 4; // Animate front left paw rotation
    this.pawFL.position.y = -5.5 - Math.sin(t + .4); // Animate front left paw position
    this.pawFL.position.z = 7.5 + Math.cos(t + .4); // Animate front left paw position

    this.pawBL.rotation.x = Math.sin(t + 2) * Math.PI / 4; // Animate back left paw rotation
    this.pawBL.position.y = -5.5 - Math.sin(t + 3.8); // Animate back left paw position
    this.pawBL.position.z = -7.5 + Math.cos(t + 3.8); // Animate back left paw position

    this.pawBR.rotation.x = Math.sin(t + 2.4) * Math.PI / 4; // Animate back right paw rotation
    this.pawBR.position.y = -5.5 - Math.sin(t + 3.4); // Animate back right paw position
    this.pawBR.position.z = -7.5 + Math.cos(t + 3.4); // Animate back right paw position

    // Animate the torso and head of the monster
    this.torso.rotation.x = Math.sin(t) * Math.PI / 8; // Animate torso rotation
    this.torso.position.y = 3 - Math.sin(t + Math.PI / 2) * 3; // Animate torso position

    this.head.rotation.x = -.1 + Math.sin(-t - 1) * .4; // Animate head rotation
    this.mouth.rotation.x = .2 + Math.sin(t + Math.PI + .3) * .4; // Animate mouth rotation

    this.tail.rotation.x = .2 + Math.sin(t - Math.PI / 2); // Animate tail rotation
    // Animate the monster's eyes
    this.eyeR.scale.y = .5 + Math.sin(t + Math.PI) * .5; // Animate right eye scaling
}

// Hero's nod function
Hero.prototype.nod = function () {
    var _this = this; // Reference to the current instance
    var sp = .5 + Math.random(); // Random speed for the nod

    // Animate head rotation
    var tHeadRotY = -Math.PI / 6 + Math.random() * Math.PI / 3; // Randomize head rotation
    TweenMax.to(this.head.rotation, sp, { y: tHeadRotY, ease: Power4.easeInOut, onComplete: function () { _this.nod(); } }); // Animate head nod

    // Animate ears
    var tEarLRotX = Math.PI / 4 + Math.random() * Math.PI / 6; // Randomize left ear rotation
    var tEarRRotX = Math.PI / 4 + Math.random() * Math.PI / 6; // Randomize right ear rotation

    TweenMax.to(this.earL.rotation, sp, { x: tEarLRotX, ease: Power4.easeInOut }); // Animate left ear
    TweenMax.to(this.earR.rotation, sp, { x: tEarRRotX, ease: Power4.easeInOut }); // Animate right ear

    // Animate back left paw
    var tPawBLRot = Math.random() * Math.PI / 2; // Randomize back left paw rotation
    var tPawBLY = -4 + Math.random() * 8; // Randomize back left paw position

    TweenMax.to(this.pawBL.rotation, sp / 2, { x: tPawBLRot, ease: Power1.easeInOut, yoyo: true, repeat: 2 }); // Animate back left paw
    TweenMax.to(this.pawBL.position, sp / 2, { y: tPawBLY, ease: Power1.easeInOut, yoyo: true, repeat: 2 }); // Animate back left paw position

    // Animate back right paw
    var tPawBRRot = Math.random() * Math.PI / 2; // Randomize back right paw rotation
    var tPawBRY = -4 + Math.random() * 8; // Randomize back right paw position
    TweenMax.to(this.pawBR.rotation, sp / 2, { x: tPawBRRot, ease: Power1.easeInOut, yoyo: true, repeat: 2 }); // Animate back right paw
    TweenMax.to(this.pawBR.position, sp / 2, { y: tPawBRY, ease: Power1.easeInOut, yoyo: true, repeat: 2 }); // Animate back right paw position

    // Animate front left paw
    var tPawFLRot = Math.random() * Math.PI / 2; // Randomize front left paw rotation
    var tPawFLY = -4 + Math.random() * 8; // Randomize front left paw position

    TweenMax.to(this.pawFL.rotation, sp / 2, { x: tPawFLRot, ease: Power1.easeInOut, yoyo: true, repeat: 2 }); // Animate front left paw
    TweenMax.to(this.pawFL.position, sp / 2, { y: tPawFLY, ease: Power1.easeInOut, yoyo: true, repeat: 2 }); // Animate front left paw position

    // Animate front right paw
    var tPawFRRot = Math.random() * Math.PI / 2; // Randomize front right paw rotation
    var tPawFRY = -4 + Math.random() * 8; // Randomize front right paw position

    TweenMax.to(this.pawFR.rotation, sp / 2, { x: tPawFRRot, ease: Power1.easeInOut, yoyo: true, repeat: 2 }); // Animate front right paw
    TweenMax.to(this.pawFR.position, sp / 2, { y: tPawFRY, ease: Power1.easeInOut, yoyo: true, repeat: 2 }); // Animate front right paw position

    // Animate mouth
    var tMouthRot = Math.random() * Math.PI / 8; // Randomize mouth rotation
    TweenMax.to(this.mouth.rotation, sp, { x: tMouthRot, ease: Power1.easeInOut }); // Animate mouth rotation

    // Animate iris
    var tIrisY = -1 + Math.random() * 2; // Randomize iris Y position
    var tIrisZ = -1 + Math.random() * 2; // Randomize iris Z position
    var iris1 = this.iris; // Reference to the left iris
    var iris2 = this.eyeR.children[0]; // Reference to the right iris
    TweenMax.to([iris1.position, iris2.position], sp, { y: tIrisY, z: tIrisZ, ease: Power1.easeInOut }); // Animate both irises

    // Animate eyes
    if (Math.random() > .2) TweenMax.to([this.eyeR.scale, this.eyeL.scale], sp / 8, { y: 0, ease: Power1.easeInOut, yoyo: true, repeat: 1 }); // Animate eye scaling
}

// Hero's hang function
Hero.prototype.hang = function () {
    var _this = this; // Reference to the current instance
    var sp = 1; // Speed for the hang animation
    var ease = Power4.easeOut; // Easing function for the animation

    // Kill any ongoing tweens for the eyes
    TweenMax.killTweensOf(this.eyeL.scale);
    TweenMax.killTweensOf(this.eyeR.scale);

    // Reset body and torso rotations and positions
    this.body.rotation.x = 0; // Reset body rotation
    this.torso.rotation.x = 0; // Reset torso rotation
    this.body.position.y = 0; // Reset body position
    this.torso.position.y = 7; // Reset torso position

    // Animate the hero's mesh rotation and position
    TweenMax.to(this.mesh.rotation, sp, { y: 0, ease: ease }); // Rotate the hero's mesh
    TweenMax.to(this.mesh.position, sp, { y: -7, z: 6, ease: ease }); // Move the hero's mesh down
    TweenMax.to(this.head.rotation, sp, { x: Math.PI / 6, ease: ease, onComplete: function () { _this.nod(); } }); // Nod the head

    // Animate the ears
    TweenMax.to(this.earL.rotation, sp, { x: Math.PI / 3, ease: ease }); // Rotate left ear
    TweenMax.to(this.earR.rotation, sp, { x: Math.PI / 3, ease: ease }); // Rotate right ear

    // Animate the paws
    TweenMax.to(this.pawFL.position, sp, { y: -1, z: 3, ease: ease }); // Move front left paw
    TweenMax.to(this.pawFR.position, sp, { y: -1, z: 3, ease: ease }); // Move front right paw
    TweenMax.to(this.pawBL.position, sp, { y: -2, z: -3, ease: ease }); // Move back left paw
    TweenMax.to(this.pawBR.position, sp, { y: -2, z: -3, ease: ease }); // Move back right paw

    // Animate the eyes
    TweenMax.to(this.eyeL.scale, sp, { y: 1, ease: ease }); // Scale left eye
    TweenMax.to(this.eyeR.scale, sp, { y: 1, ease: ease }); // Scale right eye
}

// Monster's nod function
Monster.prototype.nod = function () {
    var _this = this; // Reference to the current instance
    var sp = 1 + Math.random() * 2; // Random speed for the nod

    // Animate head rotation
    var tHeadRotY = -Math.PI / 3 + Math.random() * .5; // Randomize head rotation
    var tHeadRotX = Math.PI / 3 - .2 + Math.random() * .4; // Randomize head tilt
    TweenMax.to(this.head.rotation, sp, { x: tHeadRotX, y: tHeadRotY, ease: Power4.easeInOut, onComplete: function () { _this.nod(); } }); // Animate head nod

    // Animate tail
    var tTailRotY = -Math.PI / 4; // Set tail rotation
    TweenMax.to(this.tail.rotation, sp / 8, { y: tTailRotY, ease: Power1.easeInOut, yoyo: true, repeat: 8 }); // Animate tail

    // Animate eyes
    TweenMax.to([this.eyeR.scale, this.eyeL.scale], sp / 20, { y: 0, ease: Power1.easeInOut, yoyo: true, repeat: 1 }); // Animate eye scaling
}

// Monster's sit function
Monster.prototype.sit = function () {
    var sp = 1.2;
    var ease = Power4.easeOut; // Easing function for the sit animation
    var _this = this; // Reference to the current instance

    // Animate torso rotation and position
    TweenMax.to(this.torso.rotation, sp, { x: -1.3, ease: ease }); // Rotate torso down
    TweenMax.to(this.torso.position, sp, {
        y: -5, ease: ease, onComplete: function () {
            _this.nod(); // Call nod function after sitting
            gameStatus = "readyToReplay"; // Set game status to ready to replay
        }
    });

    // Animate head rotation
    TweenMax.to(this.head.rotation, sp, { x: Math.PI / 3, y: -Math.PI / 3, ease: ease }); // Rotate head down

    // Animate tail rotation
    TweenMax.to(this.tail.rotation, sp, { x: 2, y: Math.PI / 4, ease: ease }); // Rotate tail

    // Animate paws
    TweenMax.to(this.pawBL.rotation, sp, { x: -.1, ease: ease }); // Rotate back left paw
    TweenMax.to(this.pawBR.rotation, sp, { x: -.1, ease: ease }); // Rotate back right paw
    TweenMax.to(this.pawFL.rotation, sp, { x: 1, ease: ease }); // Rotate front left paw
    TweenMax.to(this.pawFR.rotation, sp, { x: 1, ease: ease }); // Rotate front right paw

    // Animate mouth rotation
    TweenMax.to(this.mouth.rotation, sp, { x: .3, ease: ease }); // Rotate mouth

    // Animate eye scaling
    TweenMax.to(this.eyeL.scale, sp, { y: 1, ease: ease }); // Scale left eye
    TweenMax.to(this.eyeR.scale, sp, { y: 1, ease: ease }); // Scale right eye
}

// Carrot constructor
Carrot = function () {
    this.angle = 0; // Initialize angle for rotation
    this.mesh = new THREE.Group(); // Create a group for the carrot

    // Create the body of the carrot
    var bodyGeom = new THREE.CylinderGeometry(5, 3, 10, 4, 1); // Geometry for the carrot body
    bodyGeom.vertices[8].y += 2; // Adjust vertices for shape
    bodyGeom.vertices[9].y -= 3; // Adjust vertices for shape

    this.body = new THREE.Mesh(bodyGeom, pinkMat); // Create body mesh with pink material

    // Create leaves for the carrot
    var leafGeom = new THREE.CubeGeometry(5, 10, 1, 1); // Geometry for the leaves
    leafGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 5, 0)); // Position the leaves
    leafGeom.vertices[2].x -= 1; // Adjust vertices for shape
    leafGeom.vertices[3].x -= 1; // Adjust vertices for shape
    leafGeom.vertices[6].x += 1; // Adjust vertices for shape
    leafGeom.vertices[7].x += 1; // Adjust vertices for shape

    this.leaf1 = new THREE.Mesh(leafGeom, greenMat); // Create first leaf mesh with green material
    this.leaf1.position.y = 7; // Position the first leaf
    this.leaf1.rotation.z = .3; // Rotate the first leaf
    this.leaf1.rotation.x = .2; // Rotate the first leaf

    this.leaf2 = this.leaf1.clone(); // Clone the first leaf for the second leaf
    this.leaf2.scale.set(1, 1.3, 1); // Scale the second leaf
    this.leaf2.position.y = 7; // Position the second leaf
    this.leaf2.rotation.z = -.3; // Rotate the second leaf
    this.leaf2.rotation.x = -.2; // Rotate the second leaf

    // Add body and leaves to the carrot mesh
    this.mesh.add(this.body); // Add body to the carrot mesh
    this.mesh.add(this.leaf1); // Add first leaf to the carrot mesh
    this.mesh.add(this.leaf2); // Add second leaf to the carrot mesh

    // Enable shadow casting and receiving for the carrot body
    this.body.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
            object.castShadow = true; // Enable shadow casting
            object.receiveShadow = true; // Enable shadow receiving
        }
    });
}

// Hedgehog constructor
Hedgehog = function () {
    this.angle = 0; // Initialize angle for rotation
    this.status = "ready"; // Set initial status to ready
    this.mesh = new THREE.Group(); // Create a group for the hedgehog

    // Create the body of the hedgehog
    var bodyGeom = new THREE.CubeGeometry(6, 6, 6, 1); // Geometry for the body
    this.body = new THREE.Mesh(bodyGeom, blackMat); // Create body mesh with black material

    // Create the head of the hedgehog
    var headGeom = new THREE.CubeGeometry(5, 5, 7, 1); // Geometry for the head
    this.head = new THREE.Mesh(headGeom, lightBrownMat); // Create head mesh with light brown material
    this.head.position.z = 6; // Position the head
    this.head.position.y = -.5; // Position the head

    // Create the nose of the hedgehog
    var noseGeom = new THREE.CubeGeometry(1.5, 1.5, 1.5, 1); // Geometry for the nose
    this.nose = new THREE.Mesh(noseGeom, blackMat); // Create nose mesh with black material
    this.nose.position.z = 4; // Position the nose
    this.nose.position.y = 2; // Position the nose

    // Create the left eye of the hedgehog
    var eyeGeom = new THREE.CubeGeometry(1, 3, 3); // Geometry for the eye
    this.eyeL = new THREE.Mesh(eyeGeom, whiteMat); // Create left eye mesh with white material
    this.eyeL.position.x = 2.2; // Position the left eye
    this.eyeL.position.z = -.5; // Position the left eye
    this.eyeL.position.y = .8; // Position the left eye
    this.eyeL.castShadow = true; // Enable shadow casting for the left eye
    this.head.add(this.eyeL); // Add left eye to the head

    // Create iris for the left eye
    var irisGeom = new THREE.CubeGeometry(.5, 1, 1); // Geometry for the iris
    this.iris = new THREE.Mesh(irisGeom, blackMat); // Create iris mesh with black material
    this.iris.position.x = .5; // Position the iris
    this.iris.position.y = .8; // Position the iris
    this.iris.position.z = .8; // Position the iris
    this.eyeL.add(this.iris); // Add iris to the left eye

    // Create the right eye by cloning the left eye
    this.eyeR = this.eyeL.clone(); // Clone the left eye
    this.eyeR.children[0].position.x = -this.iris.position.x; // Position the iris in the right eye
    this.eyeR.position.x = -this.eyeL.position.x; // Position the right eye
    this.head.add(this.eyeR); // Add right eye to the head

    // Create spikes for the hedgehog
    var spikeGeom = new THREE.CubeGeometry(.5, 2, .5, 1); // Geometry for the spikes
    spikeGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, 1, 0)); // Position the spikes

    // Add spikes to the hedgehog's body
    for (var i = 0; i < 9; i++) {
        var row = (i % 3); // Determine row for spikes
        var col = Math.floor(i / 3); // Determine column for spikes
        var sb = new THREE.Mesh(spikeGeom, blackMat); // Create spike mesh with black material
        sb.rotation.x = -Math.PI / 2 + (Math.PI / 12 * row) - .5 + Math.random(); // Rotate spike
        sb.position.z = -3; // Position spike
        sb.position.y = -2 + row * 2; // Position spike
        sb.position.x = -2 + col * 2; // Position spike
        this.body.add(sb); // Add spike to the body

        // Create additional spikes on the hedgehog
        var st = new THREE.Mesh(spikeGeom, blackMat); // Create spike mesh with black material
        st.position.y = 3; // Position spike
        st.position.x = -2 + row * 2; // Position spike
        st.position.z = -2 + col * 2; // Position spike
        st.rotation.z = Math.PI / 6 - (Math.PI / 6 * row) - .5 + Math.random(); // Rotate spike
        this.body.add(st); // Add spike to the body

        var sr = new THREE.Mesh(spikeGeom,        blackMat); // Create spike mesh with black material
        sr.position.x = 3; // Position spike
        sr.position.y = -2 + row * 2; // Position spike
        sr.position.z = -2 + col * 2; // Position spike
        sr.rotation.z = -Math.PI / 2 + (Math.PI / 12 * row) - .5 + Math.random(); // Rotate spike
        this.body.add(sr); // Add spike to the body

        var sl = new THREE.Mesh(spikeGeom, blackMat); // Create spike mesh with black material
        sl.position.x = -3; // Position spike
        sl.position.y = -2 + row * 2; // Position spike
        sl.position.z = -2 + col * 2; // Position spike
        sl.rotation.z = Math.PI / 2 - (Math.PI / 12 * row) - .5 + Math.random(); // Rotate spike
        this.body.add(sl); // Add spike to the body
    }

    // Add the head and nose to the hedgehog's mesh
    this.head.add(this.eyeR); // Add right eye to the head
    var earGeom = new THREE.CubeGeometry(2, 2, .5, 1); // Geometry for the ears
    this.earL = new THREE.Mesh(earGeom, lightBrownMat); // Create left ear mesh with light brown material
    this.earL.position.x = 2.5; // Position left ear
    this.earL.position.z = -2.5; // Position left ear
    this.earL.position.y = 2.5; // Position left ear
    this.earL.rotation.z = -Math.PI / 12; // Rotate left ear
    this.earL.castShadow = true; // Enable shadow casting for left ear
    this.head.add(this.earL); // Add left ear to the head

    this.earR = this.earL.clone(); // Clone left ear for right ear
    this.earR.position.x = -this.earL.position.x; // Position right ear
    this.earR.rotation.z = -this.earL.rotation.z; // Rotate right ear
    this.head.add(this.earR); // Add right ear to the head

    // Create the mouth of the hedgehog
    var mouthGeom = new THREE.CubeGeometry(1, 1, .5, 1); // Geometry for the mouth
    this.mouth = new THREE.Mesh(mouthGeom, blackMat); // Create mouth mesh with black material
    this.mouth.position.z = 3.5; // Position mouth
    this.mouth.position.y = -1.5; // Position mouth
    this.head.add(this.mouth); // Add mouth to the head

    // Add the body and head to the hedgehog's mesh
    this.mesh.add(this.body); // Add body to the hedgehog's mesh
    this.body.add(this.head); // Add head to the body
    this.head.add(this.nose); // Add nose to the head

    // Enable shadow casting and receiving for the hedgehog's parts
    this.mesh.traverse(function (object) {
        if (object instanceof THREE.Mesh) {
            object.castShadow = true; // Enable shadow casting
            object.receiveShadow = true; // Enable shadow receiving
        }
    });
}

// Hedgehog's nod function
Hedgehog.prototype.nod = function () {
    var _this = this; // Reference to the current instance
    var speed = .1 + Math.random() * .5; // Random speed for the nod
    var angle = -Math.PI / 4 + Math.random() * Math.PI / 2; // Randomize head nod angle
    TweenMax.to(this.head.rotation, speed, { // Animate head nod
        y: angle, onComplete: function () {
            _this.nod(); // Call nod function recursively
        }
    });
}

// Function to create the hero
function createHero() {
    hero = new Hero(); // Instantiate a new Hero object
    hero.mesh.rotation.y = Math.PI / 2; // Rotate the hero's mesh to face forward
    scene.add(hero.mesh); // Add hero's mesh to the scene
    hero.nod(); // Start the hero's nodding animation
}

// Function to create the monster
function createMonster() {
    monster = new Monster(); // Instantiate a new Monster object
    monster.mesh.position.z = 20; // Position the monster in the scene
    scene.add(monster.mesh); // Add monster's mesh to the scene
    updateMonsterPosition(); // Update the monster's position
}

// Function to update the monster's position
function updateMonsterPosition() {
    monster.run(); // Call the run method on the monster to animate it
    monsterPosTarget -= delta * monsterAcceleration; // Update the target position of the monster
    monsterPos += (monsterPosTarget - monsterPos) * delta; // Smoothly interpolate the monster's position

    // Check if the monster has reached a certain position
    if (monsterPos < .56) {
        gameOver(); // Trigger game over if the monster's position is too low
    }

    // Calculate the monster's position based on its angle
    var angle = Math.PI * monsterPos; // Calculate the angle for the monster's position
    monster.mesh.position.y = -floorRadius + Math.sin(angle) * (floorRadius + 12); // Update the Y position
    monster.mesh.position.x = Math.cos(angle) * (floorRadius + 15); // Update the X position
    monster.mesh.rotation.z = -Math.PI / 2 + angle; // Rotate the monster based on its angle
}

// Function to handle game over logic
function gameOver() {
    fieldGameOver.className = "show"; // Show the game over message
    gameStatus = "gameOver"; // Set the game status to game over
    monster.sit(); // Call the sit method on the monster
    hero.hang(); // Call the hang method on the hero
    monster.heroHolder.add(hero.mesh); // Add the hero to the monster's holder
    TweenMax.to(this, 1, { speed: 0 }); // Stop the game speed
    TweenMax.to(camera.position, 3, { z: cameraPosGameOver, y: 60, x: -30 }); // Move the camera for the game over view
    carrot.mesh.visible = false; // Hide the carrot
    obstacle.mesh.visible = false; // Hide the obstacle
    clearInterval(levelInterval); // Clear the level interval
}

// Function to handle replay logic
function replay() {
    gameStatus = "preparingToReplay"; // Set the game status to preparing to replay

    fieldGameOver.className = ""; // Hide the game over message

    // Kill any ongoing tweens for the monster's paws and tail
    TweenMax.killTweensOf(monster.pawFL.position);
    TweenMax.killTweensOf(monster.pawFR.position);
    TweenMax.killTweensOf(monster.pawBL.position);
    TweenMax.killTweensOf(monster.pawBR.position);
    TweenMax.killTweensOf(monster.pawFL.rotation);
    TweenMax.killTweensOf(monster.pawFR.rotation);
    TweenMax.killTweensOf(monster.pawBL.rotation);
    TweenMax.killTweensOf(monster.pawBR.rotation);
    TweenMax.killTweensOf(monster.tail.rotation);
    TweenMax.killTweensOf(monster.head.rotation);
    TweenMax.killTweensOf(monster.eyeL.scale);
    TweenMax.killTweensOf(monster.eyeR.scale);

    // Reset the monster's tail rotation
    monster.tail.rotation.y = 0;

    // Animate the camera and monster back to the starting position
    TweenMax.to(camera.position, 3, { z: cameraPosGame, x: 0, y: 30, ease: Power4.easeInOut });
    TweenMax.to(monster.torso.rotation, 2, { x: 0, ease: Power4.easeInOut });
    TweenMax.to(monster.torso.position, 2, { y: 0, ease: Power4.easeInOut });
    TweenMax.to(monster.pawFL.rotation, 2, { x: 0, ease: Power4.easeInOut });
    TweenMax.to(monster.pawFR.rotation, 2, { x: 0, ease: Power4.easeInOut });
    TweenMax.to(monster.mouth.rotation, 2, { x: .5, ease: Power4.easeInOut });

    // Animate the monster's head rotation
    TweenMax.to(monster.head.rotation, 2, { y: 0, x: -.3, ease: Power4.easeInOut });

    // Animate the hero's position and head rotation
    TweenMax.to(hero.mesh.position, 2, { x: 20, ease: Power4.easeInOut });
    TweenMax.to(hero.head.rotation, 2, { x: 0, y: 0, ease: Power4.easeInOut });
    TweenMax.to(monster.mouth.rotation, 2, { x: .2, ease: Power4.easeInOut });
    TweenMax.to(monster.mouth.rotation, 1, {
        x: .4, ease: Power4.easeIn, delay: 1, onComplete: function () {
            resetGame(); // Call resetGame function after animations complete
        }
    }
)};

// Fir tree constructor
Fir = function () {
var height = 200; // Set the height of the fir tree
var truncGeom = new THREE.CylinderGeometry(2, 2, height, 6, 1); // Geometry for the trunk
truncGeom.applyMatrix(new THREE.Matrix4().makeTranslation(0, height / 2, 0)); // Position the trunk
this.mesh = new THREE.Mesh(truncGeom, greenMat); // Create trunk mesh with green material
this.mesh.castShadow = true; // Enable shadow casting for the trunk
}

// Group for fir trees
var firs = new THREE.Group(); // Create a group to hold multiple fir trees

// Function to create fir trees
function createFirs() {
var nTrees = 100; // Number of trees to create
for (var i = 0; i < nTrees; i++) {
    var phi = i * (Math.PI * 2) / nTrees; // Calculate angle for tree placement
    var theta = Math.PI / 2; // Set theta for tree placement
    // Randomize theta for tree placement
    theta += (Math.random() > .05) ? .25 + Math.random() * .3 : -.35 - Math.random() * .1;

    var fir = new Fir(); // Create a new Fir object
    fir.mesh.position.x = Math.sin(theta) * Math.cos(phi) * floorRadius; // Set X position
    fir.mesh.position.y = Math.sin(theta) * Math.sin(phi) * (floorRadius - 10); // Set Y position
    fir.mesh.position.z = Math.cos(theta) * floorRadius; // Set Z position

    var vec = fir.mesh.position.clone(); // Clone the position vector
    var axis = new THREE.Vector3(0, 1, 0); // Define the rotation axis
    fir.mesh.quaternion.setFromUnitVectors(axis, vec.clone().normalize()); // Set the rotation of the tree
    floor.add(fir.mesh); // Add the tree to the floor
}
}

// Function to create a carrot
function createCarrot() {
carrot = new Carrot(); // Instantiate a new Carrot object
scene.add(carrot.mesh); // Add carrot's mesh to the scene
}

// Function to update the carrot's position
function updateCarrotPosition() {
carrot.mesh.rotation.y += delta * 6; // Rotate the carrot
carrot.mesh.rotation.z = Math.PI / 2 - (floorRotation + carrot.angle); // Set rotation based on floor rotation
carrot.mesh.position.y = -floorRadius + Math.sin(floorRotation + carrot.angle) * (floorRadius + 50); // Update Y position
carrot.mesh.position.x = Math.cos(floorRotation + carrot.angle) * (floorRadius + 50); // Update X position
}

// Function to update the obstacle's position
function updateObstaclePosition() {
if (obstacle.status == "flying") return; // If the obstacle is flying, do nothing

// Check if the obstacle needs to be repositioned
if (floorRotation + obstacle.angle > 2.5) {
    obstacle.angle = -floorRotation + Math.random() * .3; // Randomize the angle
    obstacle.body.rotation.y = Math.random() * Math.PI * 2; // Randomize the rotation
}

// Update the obstacle's rotation and position
obstacle.mesh.rotation.z = floorRotation + obstacle.angle - Math.PI / 2; // Set rotation
obstacle.mesh.position.y = -floorRadius + Math.sin(floorRotation + obstacle.angle) * (floorRadius + 3); // Update Y position
obstacle.mesh.position.x = Math.cos(floorRotation + obstacle.angle) * (floorRadius + 3); // Update X position
}

// Function to update the floor's rotation
function updateFloorRotation() {
floorRotation += delta * .03 * speed; // Update the floor rotation based on speed
floorRotation = floorRotation % (Math.PI * 2); // Keep the rotation within 0 to 2π
floor.rotation.z = floorRotation; // Apply the rotation to the floor
}

// Function to create an obstacle
function createObstacle() {
obstacle = new Hedgehog(); // Instantiate a new Hedgehog object
obstacle.body.rotation.y = -Math.PI / 2; // Set the initial rotation of the body
obstacle.mesh.scale.set(1.1, 1.1, 1.1); // Scale the obstacle
obstacle.mesh.position.y = floorRadius + 4; // Position the obstacle above the floor
obstacle.nod(); // Start the nodding animation for the obstacle
scene.add(obstacle.mesh); // Add obstacle's mesh to the scene
}

// Function to create bonus particles
function createBonusParticles() {
    bonusParticles = new BonusParticles(); // Instantiate a new BonusParticles object
    bonusParticles.mesh.visible = false; // Initially hide the bonus particles
    scene.add(bonusParticles.mesh); // Add bonus particles' mesh to the scene
}

// Function to check for collisions
function checkCollision() {
    var db = hero.mesh.position.clone().sub(carrot.mesh.position.clone()); // Calculate distance between hero and carrot
    var dm = hero.mesh.position.clone().sub(obstacle.mesh.position.clone()); // Calculate distance between hero and obstacle

    // Check for collision with the carrot
    if (db.length() < collisionBonus) {
        getBonus(); // Call getBonus function if collision occurs
    }

    // Check for collision with the obstacle
    if (dm.length() < collisionObstacle && obstacle.status != "flying") {
        getMalus(); // Call getMalus function if collision occurs
    }
}

// Function to handle getting a bonus
function getBonus() {
    bonusParticles.mesh.position.copy(carrot.mesh.position); // Position bonus particles at the carrot's location
    bonusParticles.mesh.visible = true; // Show the bonus particles
    bonusParticles.explose(); // Trigger the explosion effect of the bonus particles
    carrot.angle += Math.PI / 2; // Rotate the carrot
    score += 1; // Increment the score
    updateScoreboard(); // Update the scoreboard
    // speed *= .95; // Optionally reduce speed (commented out)
    monsterPosTarget += .025; // Increase the monster's target position
}

// Function to handle getting a malus
function getMalus() {
    obstacle.status = "flying"; // Set the obstacle status to flying
    var tx = (Math.random() > .5) ? -20 - Math.random() * 10 : 20 + Math.random() * 5; // Randomize the X position for flying
    TweenMax.to(obstacle.mesh.position, 4, { x: tx, y: Math.random() * 50, z: 350, ease: Power4.easeOut }); // Animate the obstacle flying away
    TweenMax.to(obstacle.mesh.rotation, 4, {
        x: Math.PI * 3, z: Math.PI * 3, y: Math.PI * 6, ease: Power4.easeOut, onComplete: function () {
            obstacle.status = "ready"; // Set the obstacle status back to ready
            obstacle.body.rotation.y = Math.random() * Math.PI * 2; // Randomize the rotation
            obstacle.angle = -floorRotation - Math.random() * .4; // Randomize the angle
            obstacle.angle = obstacle.angle % (Math.PI * 2); // Keep the angle within 0 to 2π
            obstacle.mesh.rotation.x = 0; // Reset rotation
            obstacle.mesh.rotation.y = 0; // Reset rotation
            obstacle.mesh.rotation.z = 0; // Reset rotation
            obstacle.mesh.position.z = 0; // Reset position
        }
    });
    
    // Reduce the monster's target position
    monsterPosTarget -= .04; 
    TweenMax.from(this, .5, {
        malusClearAlpha: .5, onUpdate: function () {
            renderer.setClearColor(malusClearColor, malusClearAlpha); // Update the clear color of the renderer
        }
    });
}

// Function to update the distance traveled
function updateDistance() {
    distance += delta * speed; // Increment distance based on delta time and speed
    var d = distance / 2; // Calculate distance for display
    fieldDistance.innerHTML = Math.floor(d); // Update the distance display
}

// Function to update the game level
function updateLevel() {
    if (speed >= maxSpeed) return; // If speed is at maximum, do nothing
    level++; // Increment the level
    speed += 2; // Increase speed
}

// Main game loop function
function loop() {
    delta = clock.getDelta(); // Get the time since the last frame
    updateFloorRotation(); // Update the floor rotation

    // Check if the game is currently playing
    if (gameStatus == "play") {
        if (hero.status == "running") {
            hero.run(); // Call the run method on the hero
        }
        updateDistance(); // Update the distance traveled
        updateMonsterPosition(); // Update the monster's position
        updateCarrotPosition(); // Update the carrot's position
        updateObstaclePosition(); // Update the obstacle's position
        checkCollision(); // Check for collisions
    }

    render(); // Render the scene
    requestAnimationFrame(loop); // Request the next frame
}

// Function to render the scene
function render() {
    renderer.render(scene, camera);     // Render the scene using the renderer and camera
    renderer.render(scene, camera); // Render the current scene from the perspective of the camera
}

// Event listener for when the window loads
window.addEventListener('load', init, false); // Initialize the game when the window has finished loading

// Initialization function
function init(event) {
    initScreenAnd3D(); // Initialize the screen and 3D environment
    createLights(); // Create lighting for the scene
    createFloor(); // Create the floor for the game
    createHero(); // Create the hero character
    createMonster(); // Create the monster character
    createFirs(); // Create fir trees in the scene
    createCarrot(); // Create the carrot object
    createBonusParticles(); // Create bonus particles for effects
    createObstacle(); // Create the obstacle (hedgehog)
    initUI(); // Initialize the user interface
    resetGame(); // Reset the game state
    loop(); // Start the main game loop
}

// Function to reset the game state
function resetGame() {
    scene.add(hero.mesh); // Add the hero's mesh back to the scene
    hero.mesh.rotation.y = Math.PI / 2; // Reset the hero's rotation
    hero.mesh.position.y = 0; // Reset the hero's Y position
    hero.mesh.position.z = 0; // Reset the hero's Z position
    hero.mesh.position.x = 0; // Reset the hero's X position

    monsterPos = .56; // Reset the monster's position
    monsterPosTarget = .65; // Reset the monster's target position
    speed = initSpeed; // Reset the speed to the initial value
    level = 0; // Reset the level
    distance = 0; // Reset the distance traveled
    carrot.mesh.visible = true; // Make the carrot visible
    obstacle.mesh.visible = true; // Make the obstacle visible
    gameStatus = "play"; // Set the game status to playing
    hero.status = "running"; // Set the hero's status to running
    hero.nod(); // Start the hero's nodding animation
    audio.play(); // Play the background audio
    updateLevel(); // Update the game level
    levelInterval = setInterval(updateLevel, levelUpdateFreq); // Set an interval to update the level periodically
}

// Function to initialize the user interface
function initUI() {
    fieldDistance = document.getElementById("distValue"); // Get the distance display element
    fieldGameOver = document.getElementById("gameoverInstructions"); // Get the game over instructions element
}

// Example of handling net error
const net = require('net'); // Ensure the net module is imported

// Example of handling play() error
document.getElementById('playButton').addEventListener('click', function () {
    const audio = document.getElementById('gameAudio'); // Get the audio element
    audio.play().catch(error => {
        console.error('Error playing audio:', error); // Log any errors that occur while playing audio
    });
});

// Example of using SQLite for game results
const sqlite3 = require('sqlite3').verbose(); // Import SQLite module

// Open database connection
let db = new sqlite3.Database('./frantic-run-of-rabbit/game_results.db', (err) => {
    if (err) {
        console.error(err.message); // Log any errors while connecting to the database
    }
    console.log('Connected to the game_results database.'); // Log successful connection
});

// Example function to insert player data
function insertGameResult(distance, score) {
    const query = `INSERT INTO game_result (distance, score) VALUES (?, ?)`; // SQL query to insert game results
    db.run(query, [distance, score], function (err) {
        if (err) {
            return console.error(err.message); // Log any errors during insertion
        }
        console.log(`Row inserted with rowid ${this.lastID}`); // Log the ID of the inserted row
    });
}

// Example usage of inserting game results
insertGameResult(100, 5); // Insert a sample game result

// Function to save player score
function saveGameResult(distance, score) {
    fetch('http://localhost:3000/save-result', { // Send a POST request to save the result
        method: 'POST',
        headers: {
            'Content-Type': 'application/json' // Set content type to JSON
        },
        body: JSON.stringify({ distance, score }) // Send the distance and score as JSON
    })
    .then(response => response.json()) // Parse the JSON response
    .then(data => {
        console.log(data.message); // Display success message
    })
    .catch(error => {
        console.error('Error:', error); // Log any errors
    }); // End of fetch error handling
}

// Example usage after game ends
saveGameResult(150, 5); // Save a sample game result after the game ends

// Create table query for storing game results
const createTableQuery = `
    CREATE TABLE IF NOT EXISTS score_board (
        id INTEGER PRIMARY KEY AUTOINCREMENT, // Auto-incrementing ID for each record
        score INTEGER NOT NULL, // Score of the game
        distance INTEGER // Distance traveled in the game
    );
`;

// Execute the query to create the table
db.run(createTableQuery, (err) => {
    if (err) {
        console.error('Error creating table:', err.message); // Log any errors during table creation
    } else {
        console.log('Table created successfully.'); // Log successful table creation
    }
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error(err.message); // Log any errors while closing the database
    } else {
        console.log('Database connection closed.'); // Log successful closure of the database connection
    }
});

// Fetch data from the backend server
fetch('/getGameData') // Send a request to get game data
    .then(response => response.json()) // Parse JSON response
    .then(data => {
        let gameDataDiv = document.getElementById('game-data'); // Get the element to display game data
        // Loop through the data and display it
        data.forEach(item => {
            let gameInfo = document.createElement('p'); // Create a new paragraph for each game result
            gameInfo.textContent = `Distance: ${item.distance}, Score: ${item.score}`; // Set the text content
            gameDataDiv.appendChild(gameInfo); // Append the game info to the display element
        });
    })
    .catch(error => console.error('Error fetching game data:', error)); // Log any errors during data fetching    