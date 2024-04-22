import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Navbar from './components/nabar';
import TWEEN from '@tweenjs/tween.js';

function App() {
  const mountRef = useRef(null);
  const [aspectRatio, setAspectRatio] = useState(window.innerWidth / window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setAspectRatio(window.innerWidth / window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    // Scene, camera, and renderer setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: mountRef.current });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Set camera position
    camera.position.set(0, 0, 50); // Adjusted camera position

    // Add ambient light to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Color, Intensity
    scene.add(ambientLight);

    // Add a point light to the scene
    const pointLight = new THREE.PointLight(0xffffff, 1); // Color, Intensity
    pointLight.position.set(30, 30, 30);
    scene.add(pointLight);

    const pointHelper = new THREE.PointLightHelper(pointLight);
    scene.add(pointHelper);

    // const gridHelper = new THREE.GridHelper(400, 50);
    // scene.add(gridHelper);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update(); // Initial update

    // Add a planet to the scene
    const planetGeometry = new THREE.SphereGeometry(20, 32, 32); // Adjusted planet size
    const planetTexture = new THREE.TextureLoader().load('earth.jpg');
    const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
    const planet = new THREE.Mesh(planetGeometry, planetMaterial);
    scene.add(planet);

    // Add a moon (clouds) to the scene
    const moonGeometry = new THREE.SphereGeometry(2, 10, 10); // Smaller moon size
    const moonTexture = new THREE.TextureLoader().load('cloud.jpg');
    const moonMaterial = new THREE.MeshStandardMaterial({
      map: moonTexture,
      transparent: true,
      opacity: 0.7
    });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    planet.add(moon); // Set moon as a child of the planet

    const saturnGeometry = new THREE.SphereGeometry(8, 28, 28); // Adjusted size for Saturn
    const saturnTexture = new THREE.TextureLoader().load('moon.jpg'); // Load Saturn texture
    const saturnMaterial = new THREE.MeshStandardMaterial({ map: saturnTexture }); // Apply texture to material
    const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial); // Create Saturn mesh
    saturn.position.set(0, 0, 0); // Adjusted position for Saturn (very close to the planet)
    scene.add(saturn); // Add Saturn to the scene
    
  // Render loop


    // Add stars to the scene
    function addStars() {
      const geometry = new THREE.SphereGeometry(0.5, 26, 26);
      const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const star = new THREE.Mesh(geometry, material);

      const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(300));
      star.position.set(x, y, z);
      scene.add(star);
    }
    
    Array(300).fill().forEach(addStars);

    // Set space background
    const spaceTexture = new THREE.TextureLoader().load('space5.jpg');
    scene.background = spaceTexture;

    function asteroids() {
      const asteroidTextures = [
        'saturn.jpg', 'earth.jpg', 'moon.jpg', 'rockface.jpg', 'c.jpg'
      ];
    
      // Randomly select a texture
      const asteroidTexture = new THREE.TextureLoader().load(asteroidTextures[Math.floor(Math.random() * asteroidTextures.length)]);
    
      // Randomly select a geometry
      const geometries = [
        new THREE.DodecahedronGeometry(THREE.MathUtils.randFloat(30, 50), 0), // Adjusted size range
        new THREE.IcosahedronGeometry(THREE.MathUtils.randFloat(30, 50), 0), // Adjusted size range
      ];
    
      const asteroidGeometry = geometries[Math.floor(Math.random() * geometries.length)];
    
      const asteroidMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: asteroidTexture,
        roughness: 0.8, // Adjust roughness to make the surface less smooth
        metalness: 0.2 // Adjust metalness to make the surface less metallic
      });
      const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    
      // Generate random positions within the entire scene range (not close to the planet)
      const x = THREE.MathUtils.randFloatSpread(1000) - 500; // Adjusted range to scatter across the entire screen width
      const y = THREE.MathUtils.randFloatSpread(1000) - 500; // Adjusted range to scatter across the entire screen height
      const z = THREE.MathUtils.randFloatSpread(1000) - 500; // Adjusted range for depth
    
      // Check if the asteroid is too close to the planet
      const distanceToPlanet = Math.sqrt(x ** 2 + y ** 2 + z ** 2);
      const minDistanceToPlanet = 100; // Minimum distance from the planet
      if (distanceToPlanet < minDistanceToPlanet) {
        asteroid.position.set(x + 2 * minDistanceToPlanet, y + 2 * minDistanceToPlanet, z + 2 * minDistanceToPlanet);
      } else {
        asteroid.position.set(x, y, z);
      }
    
      scene.add(asteroid);
    
      // Add rotation to asteroids
      asteroid.rotation.x = Math.random() * Math.PI * 2;
      asteroid.rotation.y = Math.random() * Math.PI * 2;
      asteroid.rotation.z = Math.random() * Math.PI * 2;
    }
    
    // Adjust the number of asteroids as needed
    Array(25).fill().forEach(asteroids);


// Create a raycaster
const raycaster = new THREE.Raycaster();

// Assuming you have defined camera, scene, planet, moon, and saturn somewhere in your code

// Function to handle asteroid click event
function onAsteroidClick(event) {
  event.preventDefault();

  // Calculate mouse position
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Set raycaster position based on mouse position and camera
  raycaster.setFromCamera(mouse, camera);

  // Find intersected object
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;

    // Check if the clicked object is an asteroid
    if (clickedObject instanceof THREE.Mesh && clickedObject !== planet && clickedObject !== moon && clickedObject !== saturn) {
      // Move the clicked asteroid back a little
      const moveBackDistance = 50;
      
      // Use Tween.js for smooth transition
      new TWEEN.Tween(clickedObject.position)
        .to({ z: clickedObject.position.z - moveBackDistance }, 500) // duration: 500ms
        .start();

      // Adjust rotation speed of the clicked asteroid
      clickedObject.rotationSpeed = {
        x: Math.random() * 0.05 - 0.025, // Adjust rotation speed in x-axis
        y: Math.random() * 0.05 - 0.025, // Adjust rotation speed in y-axis
        z: Math.random() * 0.05 - 0.025  // Adjust rotation speed in z-axis
      };
    }
  }
}

// Add click event listener to the document
document.addEventListener('click', onAsteroidClick, false);


// Inside the render loop, adjust the rotation of clicked asteroids
scene.children.forEach(object => {
  if (object instanceof THREE.Mesh && object !== planet && object !== moon && object !== saturn) {
    // Check if the asteroid has a custom rotation speed
    if (object.rotationSpeed) {
      object.rotation.x += object.rotationSpeed.x;
      object.rotation.y += object.rotationSpeed.y;
      object.rotation.z += object.rotationSpeed.z;
    } else {
      // Apply default rotation speed
      object.rotation.x += 0.01; // Adjust rotation speed as needed
      object.rotation.y += 0.01; // Adjust rotation speed as needed
    }
  }
});
    
// Render loop
const animate = () => {
  requestAnimationFrame(animate);

  // Rotate the planet
  planet.rotation.y += 0.02;

  // Move Saturn around the planet
  const orbitRadius = 50; // Adjusted orbit radius
  const orbitSpeed = 0.001; // Adjusted orbit speed
  const angle = Date.now() * orbitSpeed;
  const x = Math.cos(angle) * orbitRadius;
  const z = Math.sin(angle) * orbitRadius;
  saturn.position.set(x, 0, z); // Set new position for Saturn
  
  // Rotate Saturn around its axis
  saturn.rotation.y += 0.02;
  
  // Move the moon around the planet
  const moonOrbitRadius = 30;
  const moonAngle = Date.now() * orbitSpeed;
  const moonX = Math.cos(moonAngle) * moonOrbitRadius;
  moon.position.set(moonX, 0);
  
  // Rotate the asteroids
  scene.children.forEach(object => {
    if (object instanceof THREE.Mesh && object !== planet && object !== moon && object !== saturn) {
      object.rotation.x += 0.01; // Adjust rotation speed as needed
      object.rotation.y += 0.01; // Adjust rotation speed as needed
    }
  });

  controls.update(); // Update controls
  renderer.render(scene, camera);
};

animate();

    
   

    // Cleanup
    return () => {
      renderer.dispose(); // Dispose renderer to release resources
      controls.dispose(); // Dispose controls to release resources
    };
  }, [aspectRatio]);

  return <
    canvas ref={mountRef} />;
}

export default App;
