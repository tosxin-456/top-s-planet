import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import Navbar from './components/nabar';

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

    const gridHelper = new THREE.GridHelper(400, 50);
    scene.add(gridHelper);

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
  // const moonZ = Math.sin(moonAngle) * moonOrbitRadius;
  moon.position.set(moonX, 0)

  controls.update(); // Update controls
  renderer.render(scene, camera);
};


    animate();

    // Add stars to the scene
    function addStars() {
      const geometry = new THREE.SphereGeometry(0.5, 24, 24);
      const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const star = new THREE.Mesh(geometry, material);

      const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(100));
      star.position.set(x, y, z);
      scene.add(star);
    }
    
    Array(200).fill().forEach(addStars);

    // Set space background
    const spaceTexture = new THREE.TextureLoader().load('space5.jpg');
    scene.background = spaceTexture;

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
