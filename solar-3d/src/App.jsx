import React, { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";

// Firebase Config (Replace with your own)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const SolarSystem = () => {
  const [planetConfigs, setPlanetConfigs] = useState({});
  const planetsRef = useRef({});
  let scene, camera, renderer, controls, sun;

  useEffect(() => {
    // Initialize Scene
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(20, 30, 60);
    camera.lookAt(0, 0, 0);

    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pointLight = new THREE.PointLight(0xffffff, 2, 100);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Sun
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffaa00 });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Default Planets
    const defaultPlanets = {
      Mercury: { size: 1, color: 0xaaaaaa, distance: 10, speed: 0.01 },
      Venus: { size: 1.5, color: 0xff8844, distance: 15, speed: 0.008 },
      Earth: { size: 2, color: 0x0088ff, distance: 20, speed: 0.006 },
      Mars: { size: 1.8, color: 0xff4422, distance: 25, speed: 0.004 },
      Jupiter: { size: 4, color: 0xd4a373, distance: 35, speed: 0.002 },
      Saturn: { size: 3.5, color: 0xf4a261, distance: 45, speed: 0.0015 },
      Uranus: { size: 3, color: 0x2a9d8f, distance: 55, speed: 0.001 },
      Neptune: { size: 3, color: 0x264653, distance: 65, speed: 0.0008 }
    };

    setPlanetConfigs(defaultPlanets);

    for (const [name, data] of Object.entries(defaultPlanets)) {
      const geometry = new THREE.SphereGeometry(data.size, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color: data.color });
      const planet = new THREE.Mesh(geometry, material);
      planet.userData = { name, distance: data.distance, speed: data.speed, angle: Math.random() * Math.PI * 2 };
      scene.add(planet);
      planetsRef.current[name] = planet;

      // Orbit Visualization
      const orbitGeometry = new THREE.RingGeometry(data.distance - 0.1, data.distance + 0.1, 64);
      const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      scene.add(orbit);
    }

    function animate() {
      requestAnimationFrame(animate);
      Object.values(planetsRef.current).forEach((planet) => {
        const config = planetConfigs[planet.userData.name];
        if (config) {
          planet.scale.set(config.size, config.size, config.size);
          planet.userData.distance = config.distance;
          planet.userData.speed = config.speed;
        }
        planet.userData.angle += planet.userData.speed;
        planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
        planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
      });
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      document.body.removeChild(renderer.domElement);
    };
  }, []);

  // Update Configurations
  const updateConfig = (name, key, value) => {
    setPlanetConfigs((prev) => ({
      ...prev,
      [name]: {
        ...prev[name],
        [key]: value
      }
    }));
  };

  // Save Configurations to Firebase
  const saveConfig = async () => {
    await addDoc(collection(db, "solar_configs"), { planets: planetConfigs });
  };

  // Load Configurations from Firebase
  const loadConfig = async () => {
    const querySnapshot = await getDocs(collection(db, "solar_configs"));
    if (!querySnapshot.empty) {
      const latestConfig = querySnapshot.docs[querySnapshot.docs.length - 1].data();
      setPlanetConfigs(latestConfig.planets);
    }
  };

  return (
    <div style={{ position: "absolute", top: 10, left: 10, background: "rgba(0,0,0,0.7)", padding: 10, borderRadius: 5, color: "white" }}>
      <h2>Planet Controls</h2>
      {Object.keys(planetConfigs).map((name) => (
        <div key={name}>
          <h3>{name}</h3>
          <label>Size: </label>
          <input type="range" min="0.5" max="5" step="0.1" value={planetConfigs[name].size} onChange={(e) => updateConfig(name, "size", parseFloat(e.target.value))} /><br />
          <label>Speed: </label>
          <input type="range" min="0.001" max="0.02" step="0.001" value={planetConfigs[name].speed} onChange={(e) => updateConfig(name, "speed", parseFloat(e.target.value))} /><br />
          <label>Orbit Distance: </label>
          <input type="range" min="5" max="70" step="1" value={planetConfigs[name].distance} onChange={(e) => updateConfig(name, "distance", parseFloat(e.target.value))} /><br />
        </div>
      ))}
      <button onClick={saveConfig}>Save Configuration</button>
      <button onClick={loadConfig}>Load Configuration</button>
    </div>
  );
};

export default SolarSystem;
