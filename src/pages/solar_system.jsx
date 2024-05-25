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

 // Load a high-resolution sun texture
    // Create the sun geometry and material with a dark yellow color
const sunGeometry = new THREE.SphereGeometry(50, 64, 64); // Increase segment count for smoother sphere
const sunMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffa500, // Dark yellow color
    emissive: 0xffff00, // Bright yellow emissive color
    emissiveIntensity: 1.5 // Increase emissive intensity
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// Add a point light inside the sun mesh to make it shine brighter
const sunLight = new THREE.PointLight(0xffffff, 2, 1000); // Adjust intensity and distance
sun.add(sunLight);
sunLight.position.set(0, 0, 0); // Position light at the center of the sun

// Add a glow effect
const spriteMaterial = new THREE.SpriteMaterial({ 
    map: new THREE.TextureLoader().load('path/to/glow.png'), // A texture of a radial gradient
    color: 0xffff00, 
    transparent: true, 
    blending: THREE.AdditiveBlending 
});
const sprite = new THREE.Sprite(spriteMaterial);
sprite.scale.set(200, 200, 1.0); // Adjust size for the glow effect
sun.add(sprite);



    // Add planets
    const planets = [];
    const planetData = [
      { distance: 200, size: 20, texture: 'c.jpg' },
      { distance: 300, size: 30, texture: 'rockface.jpg' },
      { distance: 400, size: 40, texture: 'spacee.jpg' },
      { distance: 500, size: 40, texture: 'saturn.jpg' },
      { distance: 600, size: 40, texture: 'earth.jpg' },
      { distance: 700, size: 60, texture: 'space2.jpg' },
      { distance: 800, size: 70, texture: 'c.jpg' },
      { distance: 900, size: 50, texture: 'space3.jpg' },
      { distance: 1000, size: 60, texture: 'rockface.jpg' }
    ];

    planetData.forEach((data, index) => {
      const planetGeometry = new THREE.SphereGeometry(data.size, 32, 32);
      const planetTexture = new THREE.TextureLoader().load(data.texture);
      const planetMaterial = new THREE.MeshStandardMaterial({ map: planetTexture });
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);

      // Create a pivot point for each planet to rotate around the sun
      const pivot = new THREE.Object3D();
      pivot.position.set(0, 0, 0);
      scene.add(pivot);
      pivot.add(planet);

      // Position the planet at the correct distance
      planet.position.set(data.distance, 0, 0);

      // Add a moon for each planet
      const moonGeometry = new THREE.SphereGeometry(data.size / 4, 32, 32);
      const moonMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
      const moon = new THREE.Mesh(moonGeometry, moonMaterial);

      // Create a pivot point for the moon to rotate around the planet
      const moonPivot = new THREE.Object3D();
      moonPivot.position.set(0, 0, 0);
      planet.add(moonPivot);
      moonPivot.add(moon);

      // Position the moon relative to the planet
      moon.position.set(data.size * 1.5, 0, 0);

      planets.push({ planet, pivot, moonPivot });
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

      // Rotate planets around the sun
      planets.forEach(({ planet, pivot, moonPivot }, index) => {
        pivot.rotation.y += 0.001 * (index + 1);
        planet.rotation.y += 0.01;
        moonPivot.rotation.y += 0.05;
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
