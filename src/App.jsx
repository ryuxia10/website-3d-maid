import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Html, useProgress } from "@react-three/drei";
import { motion } from "framer-motion";

import MaidCharacter from "./MaidCharacter";

// Komponen untuk menampilkan loading screen (tidak berubah)
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center className="loading-indicator">
      {Math.round(progress)}% loaded
    </Html>
  );
}

export default function App() {
  return (
    <>
      <Canvas
        // PERUBAHAN 1: Mengaktifkan kembali shadows
        shadows
        gl={{ alpha: true }}
        camera={{ position: [0, 1.4, 4.5], fov: 50 }}
      >
        <Suspense fallback={<Loader />}>
          <ambientLight intensity={1.2} />
          {/* PERUBAHAN 2: Memastikan directionalLight bisa menghasilkan bayangan */}
          <directionalLight
            position={[5, 5, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          {/* PERUBAHAN 3: Menambahkan lantai tak terlihat untuk menangkap bayangan */}
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -0.7, 0]}
            receiveShadow
          >
            <planeGeometry args={[10, 10]} />
            <shadowMaterial opacity={0.3} />
          </mesh>

          {/* Karakter 3D */}
          <MaidCharacter position={[0, -0.7, 0]} />

          {/* Kontrol Kamera */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.8}
            target={[0, 0.5, 0]}
          />
        </Suspense>
      </Canvas>

      {/* UI Overlay dengan Animasi (tidak berubah) */}
      <div className="ui-container">
        <header className="header">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Vryxia AI
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            Masih dalam tahap pengembangan. Stay tuned!
          </motion.p>
        </header>
        <footer className="footer">
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          >
            ✨ Sebuah AI yang akan membantu anda! ✨
          </motion.p>
        </footer>
      </div>
    </>
  );
}
