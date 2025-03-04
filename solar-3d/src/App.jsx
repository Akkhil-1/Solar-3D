import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { db, doc, setDoc, getDoc } from "./firebase";

const SolarSystem = () => {
  const [scene, setScene] = useState(null);
  const [planets, setPlanets] = useState([]);

  useEffect(() => {
    const newScene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Sun
    const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    newScene.add(sun);

    setScene(newScene);

    function animate() {
      requestAnimationFrame(animate);
      renderer.render(newScene, camera);
    }
    animate();
  }, []);

  const saveConfig = async () => {
    await setDoc(doc(db, "solarConfigs", "latestConfig"), { planets });
    alert("Configuration Saved!");
  };

  const loadConfig = async () => {
    const docSnap = await getDoc(doc(db, "solarConfigs", "latestConfig"));
    if (docSnap.exists()) {
      setPlanets(docSnap.data().planets);
      alert("Configuration Loaded!");
    } else {
      alert("No saved configuration found!");
    }
  };

  return (
    <div>
      <button onClick={saveConfig}>Save</button>
      <button onClick={loadConfig}>Load</button>
    </div>
  );
};

export default SolarSystem;
