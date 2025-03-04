import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { db, doc, setDoc, getDoc } from "./firebase"; // Firebase integration

const SolarSystem = () => {
    const [planets, setPlanets] = useState([]);
    let scene, camera, renderer, controls, sun;

    useEffect(() => {
        // 1️⃣ Scene & Renderer
        scene = new THREE.Scene();
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // 2️⃣ Camera Setup (Tilted View)
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(20, 30, 60);
        camera.lookAt(0, 0, 0);

        // 3️⃣ Orbit Controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;

        // 4️⃣ Lighting (More Visibility)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft light
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 2, 100);
        pointLight.position.set(0, 0, 0); // Light from the Sun
        scene.add(pointLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(20, 50, 50);
        scene.add(directionalLight);

        // 5️⃣ Sun (Brighter & More Visible)
        const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
        const sunMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00, emissive: 0xffaa00 });
        sun = new THREE.Mesh(sunGeometry, sunMaterial);
        scene.add(sun);

        // 6️⃣ Planets & Orbits
        const planetData = [
            { name: "Mercury", size: 1, color: 0xaaaaaa, distance: 10, speed: 0.01 },
            { name: "Venus", size: 1.5, color: 0xff8844, distance: 15, speed: 0.008 },
            { name: "Earth", size: 2, color: 0x0088ff, distance: 20, speed: 0.006 },
            { name: "Mars", size: 1.8, color: 0xff4422, distance: 25, speed: 0.004 }
        ];

        const newPlanets = planetData.map((data) => {
            const geometry = new THREE.SphereGeometry(data.size, 32, 32);
            const material = new THREE.MeshStandardMaterial({ color: data.color, emissive: data.color * 0.3 });
            const planet = new THREE.Mesh(geometry, material);
            planet.userData = { distance: data.distance, speed: data.speed, angle: Math.random() * Math.PI * 2 };
            scene.add(planet);

            // 7️⃣ Draw Orbit Path
            const orbitGeometry = new THREE.RingGeometry(data.distance - 0.1, data.distance + 0.1, 64);
            const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
            const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
            orbit.rotation.x = Math.PI / 2; // Align with XY plane
            scene.add(orbit);

            return planet;
        });

        setPlanets(newPlanets);

        // 8️⃣ Animation Loop
        function animate() {
            requestAnimationFrame(animate);

            // Move planets in orbit
            newPlanets.forEach((planet) => {
                planet.userData.angle += planet.userData.speed;
                planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
                planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;
            });

            controls.update();
            renderer.render(scene, camera);
        }
        animate();

        // Cleanup
        return () => {
            document.body.removeChild(renderer.domElement);
        };
    }, []);

    // 9️⃣ Save to Firebase
    const saveConfig = async () => {
        const planetData = planets.map((planet) => ({
            distance: planet.userData.distance,
            speed: planet.userData.speed
        }));

        await setDoc(doc(db, "solarConfigs", "latestConfig"), { planets: planetData });
        alert("Configuration Saved!");
    };

    // 🔟 Load from Firebase
    const loadConfig = async () => {
        const docSnap = await getDoc(doc(db, "solarConfigs", "latestConfig"));
        if (docSnap.exists()) {
            const loadedPlanets = docSnap.data().planets;
            planets.forEach((planet, index) => {
                if (loadedPlanets[index]) {
                    planet.userData.distance = loadedPlanets[index].distance;
                    planet.userData.speed = loadedPlanets[index].speed;
                }
            });
            alert("Configuration Loaded!");
        } else {
            alert("No saved configuration found!");
        }
    };

    return (
        <div style={{ position: "absolute", top: 10, left: 10 }}>
            <button onClick={saveConfig} style={{ marginRight: 10 }}>Save</button>
            <button onClick={loadConfig}>Load</button>
        </div>
    );
};

export default SolarSystem;