import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

function SolarSystem() {
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
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1500);
    const renderer = new THREE.WebGLRenderer({ canvas: mountRef.current });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Set camera position
    camera.position.set(0, 0, 200);

    // Add ambient light to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    // Add a point light to the scene
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Set space background
    const spaceTexture = new THREE.TextureLoader().load('space5.jpg');
    scene.background = spaceTexture;

  // Add the sun mesh
const sunGeometry = new THREE.SphereGeometry(50, 30, 30);
const sunTexture = new THREE.TextureLoader().load('earth.jpg')
const sunMaterial = new THREE.MeshStandardMaterial({ emissive: 0xffff00 , map:sunTexture, roughness: 0.8,
  metalness: 0.7  });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Add a point light inside the sun mesh to make it shine brighter
const sunLight = new THREE.PointLight(0xffffff, 50); // Increase intensity for a brighter sun
sun.add(sunLight);
sunLight.position.set(0, 0, 0); // Set the position of the light at the center of the sun


    // Add moon
    const moonGeometry = new THREE.SphereGeometry(10, 32, 32);
    const moonMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(100, 0, 0); // Position moon relative to the sun
    scene.add(moon);

    // Add planets
    const planets = [];
    const planetDistances = [200, 300, 400,500,600,700, 800, 900, 1000]; // Distances of planets from the sun
    const planetSizes = [20, 30, 40, 40, 40, 60 , 70 , 50 , 60]; // Sizes of planets

    planetDistances.forEach((distance, index) => {
      const planetGeometry = new THREE.SphereGeometry(planetSizes[index], 32, 32);
      const planetMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);

      const angle = (Math.PI * 2 / planetDistances.length) * index;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;

      planet.position.set(x, 0, z);
      planets.push(planet);
      scene.add(planet);
    });

    // Add stars to the scene
    function addStars() {
      const geometry = new THREE.SphereGeometry(0.5, 26, 26);
      const material = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const star = new THREE.Mesh(geometry, material);

      const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(400));
      star.position.set(x, y, z);
      scene.add(star);
    }

    Array(300).fill().forEach(addStars);

    // Add asteroids
    function addAsteroids() {
      const asteroidTextures = [
        'saturn.jpg', 'earth.jpg', 'moon.jpg', 'rockface.jpg', 'c.jpg'
      ];

      const asteroidTexture = new THREE.TextureLoader().load(asteroidTextures[Math.floor(Math.random() * asteroidTextures.length)]);

      const asteroidGeometries = [
        new THREE.DodecahedronGeometry(THREE.MathUtils.randFloat(5, 10), 0),
        new THREE.IcosahedronGeometry(THREE.MathUtils.randFloat(5, 10), 0),
      ];

      const asteroidGeometry = asteroidGeometries[Math.floor(Math.random() * asteroidGeometries.length)];

      const asteroidMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: asteroidTexture,
        roughness: 0.8,
        metalness: 0.2
      });

      const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);

      const x = THREE.MathUtils.randFloatSpread(1000) - 500;
      const y = THREE.MathUtils.randFloatSpread(1000) - 500;
      const z = THREE.MathUtils.randFloatSpread(1000) - 500;

      asteroid.position.set(x, y, z);
      scene.add(asteroid);
    }

    Array(50).fill().forEach(addAsteroids);

    // Set up controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update(); 

    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate planets
      planets.forEach((planet, index) => {
        planet.rotation.y += 0.01 * (index + 1);
      });

      // Rotate moon
      moon.rotation.y += 0.01;

      // Rotate asteroids
      scene.children.forEach(object => {
        if (object instanceof THREE.Mesh && object !== sun && object !== moon && !planets.includes(object)) {
          object.rotation.x += 0.01;
          object.rotation.y += 0.01;
        }
      });

      controls.update(); 
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      controls.dispose();
    };
  }, [aspectRatio]);

  return <canvas ref={mountRef} />;
}

export default SolarSystem;
