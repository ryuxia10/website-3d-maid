import React, { useRef, useState, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useSpring, a } from "@react-spring/three";

// --- Komponen Tanda Tanya dengan Model 3D (tidak berubah) ---
function QuestionMark() {
  const groupRef = useRef();
  const { scene } = useGLTF("/tanda_tanya.glb");

  const pinkMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#ff80ab", roughness: 0.4 }),
    []
  );

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material = pinkMaterial;
          child.castShadow = true;
        }
      });
    }
  }, [scene, pinkMaterial]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.getElapsedTime() * 2;
    }
  });

  return (
    <a.group ref={groupRef} scale={[0.45, 0.45, 0.45]} position={[0, -0.1, 0]}>
      <primitive object={scene} />
    </a.group>
  );
}

useGLTF.preload("/tanda_tanya.glb");

// --- Komponen Lampu Ide dengan warna dan material baru ---
function LightBulb() {
  const groupRef = useRef();
  const lightRef = useRef();
  const { scene } = useGLTF("/lampu_ide.glb");

  const [isFlashing, setIsFlashing] = useState(true);

  // PERBAIKAN: Menambahkan warna dasar pink pada kaca bohlam
  const lightMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#ffc0cb", // Warna dasar kaca diberi warna pink soft
        emissive: "#ff1493", // Warna glow pink terang
        toneMapped: false,
        transparent: true,
        opacity: 0.5, // Opasitas diatur ke 50%
        roughness: 0.2,
      }),
    []
  );

  // Intensitas glow dan cahaya (tidak berubah)
  const { intensity, emissiveIntensity } = useSpring({
    intensity: isFlashing ? 2.5 : 0,
    emissiveIntensity: isFlashing ? 2.0 : 0,
    config: { duration: 300 },
    onRest: () => {
      if (isFlashing) setIsFlashing(false);
    },
  });

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.material = lightMaterial;
        }
      });
    }
  }, [scene, lightMaterial]);

  useFrame(() => {
    lightMaterial.emissiveIntensity = emissiveIntensity.get();
  });

  return (
    // Skala bohlam (tidak berubah)
    <a.group ref={groupRef} scale={[0.35, 0.35, 0.35]}>
      <primitive object={scene} />
      {/* Warna cahaya tetap pink terang */}
      <a.pointLight
        ref={lightRef}
        color="#ff1493"
        distance={0.5}
        intensity={intensity}
      />
    </a.group>
  );
}

useGLTF.preload("/lampu_ide.glb");

// Komponen utama yang menggabungkan keduanya
export default function StatusIndicator({ isLoading, isReplying }) {
  const questionMarkSpring = useSpring({
    scale: isLoading ? 1 : 0,
    opacity: isLoading ? 1 : 0,
    config: { tension: 300, friction: 20 },
  });

  const lightBulbSpring = useSpring({
    scale: isReplying ? 1 : 0,
    opacity: isReplying ? 1 : 0,
    config: { tension: 300, friction: 20 },
    delay: isReplying ? 0 : 500,
  });

  return (
    <group position={[0, 1.8, 0]}>
      <a.group scale={questionMarkSpring.scale}>
        <QuestionMark />
      </a.group>
      <a.group scale={lightBulbSpring.scale}>
        <LightBulb />
      </a.group>
    </group>
  );
}
