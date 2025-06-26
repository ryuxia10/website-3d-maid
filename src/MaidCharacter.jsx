import React, { useRef, useState, useEffect } from "react";
import { useGLTF, Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

// Daftar dialog yang akan ditampilkan
const dialogues = [
  'Maaf, untuk sementara, saya masih dalam tahap pengembangan, mungkin "Master" saya akan segera mengembangkan saya.',
  "Untuk sekarang, saya hanya bisa diam dan memunculkan dialog teks di atas, namun, kedepannya, semoga kita dapat berinteraksi, ya!",
];

export default function MaidCharacter(props) {
  const group = useRef();
  const { scene } = useGLTF("/maid_character.glb");

  const [isHovered, setIsHovered] = useState(false);
  const [showDialogue, setShowDialogue] = useState(false);
  const [dialogueIndex, setDialogueIndex] = useState(0);

  // Efek hover untuk cursor
  useEffect(() => {
    document.body.style.cursor = isHovered ? "pointer" : "auto";
  }, [isHovered]);

  // === PERUBAHAN KRUSIAL: MENGAKTIFKAN BAYANGAN PADA MODEL ===
  useEffect(() => {
    // Perintah ini akan menelusuri semua bagian dari model 3D
    scene.traverse((child) => {
      // Jika bagian tersebut adalah sebuah mesh (objek 3D yang bisa dilihat)
      if (child.isMesh) {
        // Kita perintahkan objek tersebut untuk menghasilkan bayangan
        child.castShadow = true;
      }
    });
  }, [scene]); // Efek ini hanya berjalan sekali saat model selesai dimuat

  // Efek untuk menyembunyikan dialog secara otomatis
  useEffect(() => {
    let timer;
    if (showDialogue) {
      timer = setTimeout(() => {
        setShowDialogue(false);
      }, 8000);
    }
    return () => clearTimeout(timer);
  }, [showDialogue, dialogueIndex]);

  // Loop animasi setiap frame
  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t / 2) * 0.1;
    group.current.position.y = props.position[1] + Math.sin(t * 1.5) * 0.05;

    const targetScale = isHovered ? 1.05 : 1;
    group.current.scale.lerp(
      { x: targetScale, y: targetScale, z: targetScale },
      delta * 5
    );
  });

  // Fungsi yang dijalankan ketika karakter di-klik
  const handleCharacterClick = (event) => {
    event.stopPropagation();
    setShowDialogue(true);
    setDialogueIndex((currentIndex) => (currentIndex + 1) % dialogues.length);
  };

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive
        object={scene}
        onPointerOver={(e) => {
          e.stopPropagation();
          setIsHovered(true);
        }}
        onPointerOut={() => setIsHovered(false)}
        onClick={handleCharacterClick}
      />

      {/* Popup dialog */}
      {showDialogue && (
        <Html position={[0, 1.9, 0]} center>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.8)",
              color: "#333",
              padding: "10px 15px",
              borderRadius: "10px",
              backdropFilter: "blur(5px)",
              width: "250px",
              textAlign: "center",
              fontSize: "14px",
              fontFamily: "Poppins, sans-serif",
              border: "1px solid rgba(0,0,0,0.1)",
            }}
          >
            {dialogues[dialogueIndex]}
          </div>
        </Html>
      )}
    </group>
  );
}

useGLTF.preload("/maid_character.glb");
