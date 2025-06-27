import React, { useEffect, forwardRef } from "react";
import { useGLTF } from "@react-three/drei";
import StatusIndicator from "./StatusIndicator"; // Impor komponen baru

// Gunakan forwardRef agar kita bisa mendapatkan referensi dari parent (App.jsx)
const MaidCharacter = forwardRef(({ onClick, isLoading, isReplying }, ref) => {
  const { scene } = useGLTF("/maid_character.glb");

  // Pastikan semua mesh dalam model bisa menghasilkan dan menerima bayangan
  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

  return (
    // 'ref' dari forwardRef di-pass ke group ini
    <group ref={ref} dispose={null} onClick={onClick}>
      {/* Tambahkan komponen StatusIndicator di sini */}
      <StatusIndicator isLoading={isLoading} isReplying={isReplying} />
      <primitive object={scene} />
    </group>
  );
});

// Preload model agar tidak ada jeda saat pertama kali ditampilkan
useGLTF.preload("/maid_character.glb");

export default MaidCharacter;
