import React, { Suspense, useState, useRef, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, useProgress, OrbitControls } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

import { useSounds } from "./useSounds";
import MaidCharacter from "./MaidCharacter";
import StatusIndicator from "./StatusIndicator";

// Komponen Loader, SceneContent, ChatUI, dan StatusPanel tidak berubah
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>{Math.round(progress)}%</p>
      </div>
    </Html>
  );
}
function SceneContent({ isChatMode, onCharacterClick, isLoading, isReplying }) {
  const characterRef = useRef();
  const controlsRef = useRef();
  useFrame((state, delta) => {
    if (!characterRef.current || !controlsRef.current) return;
    const targetPos = new THREE.Vector3(
      ...(isChatMode ? [-2.2, -0.7, 2] : [0, -0.7, 0])
    );
    const targetScale = new THREE.Vector3(
      ...(isChatMode ? [1.2, 1.2, 1.2] : [1, 1, 1])
    );
    characterRef.current.position.lerp(targetPos, delta * 3);
    characterRef.current.scale.lerp(targetScale, delta * 3);
    const baseTargetRotY = isChatMode ? Math.PI / 8 : 0;
    const lookAtRotY = baseTargetRotY + state.mouse.x * 0.3;
    const lookAtRotX = -state.mouse.y * 0.15;
    const finalTargetEuler = new THREE.Euler(lookAtRotX, lookAtRotY, 0, "YXZ");
    const finalTargetQuaternion = new THREE.Quaternion().setFromEuler(
      finalTargetEuler
    );
    characterRef.current.quaternion.slerp(finalTargetQuaternion, delta * 5);
    const cameraTargetPos = new THREE.Vector3(
      ...(isChatMode ? [-1.2, 1.2, 4.2] : [0, 1.4, 4.5])
    );
    state.camera.position.lerp(cameraTargetPos, delta * 3);
    const lookAtPos = isChatMode
      ? new THREE.Vector3(targetPos.x, 0.8, targetPos.z)
      : new THREE.Vector3(0, 0.5, 0);
    controlsRef.current.target.lerp(lookAtPos, delta * 3);
    controlsRef.current.update();
  });
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
      {!isChatMode && (
        <mesh
          key="floor"
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.7, 0]}
          receiveShadow
        >
          <planeGeometry args={[10, 10]} />
          <shadowMaterial transparent opacity={0.3} />
        </mesh>
      )}
      <MaidCharacter
        ref={characterRef}
        onClick={onCharacterClick}
        isLoading={isLoading}
        isReplying={isReplying}
      />
      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
      />
      <EffectComposer>
        <Bloom
          intensity={0.8}
          mipmapBlur
          luminanceThreshold={0.9}
          luminanceSmoothing={0.025}
        />
      </EffectComposer>
    </>
  );
}
function ChatUI({ messages, inputValue, onInputChange, onSendMessage }) {
  const chatHistoryRef = useRef(null);
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [messages]);
  return (
    <motion.div
      className="chat-ui-container"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.5, ease: "circOut" }}
    >
      <div className="chat-history" ref={chatHistoryRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="chat-input-area">
        <textarea
          placeholder="Ketik pesanmu di sini..."
          value={inputValue}
          onChange={onInputChange}
          onKeyPress={(e) =>
            e.key === "Enter" &&
            !e.shiftKey &&
            (e.preventDefault(), onSendMessage())
          }
        />
        <button onClick={onSendMessage}>Kirim</button>
      </div>
    </motion.div>
  );
}
function StatusPanel({ isLoading }) {
  return (
    <motion.div
      className="status-panel-container"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5, ease: "circOut" }}
    >
      <div className="status-header">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
        <h3>Vryxia AI</h3>
      </div>
      <div className="status-divider"></div>
      <div className="status-item">
        <span>Status</span>
        <span className={`status-light ${isLoading ? "thinking" : "online"}`}>
          {isLoading ? "Thinking..." : "Online"}
        </span>
      </div>
      <div className="status-item">
        <span>Model</span>
        <span>G-Maid v1.2</span>
      </div>
      <div className="status-item">
        <span>Directive</span>
        <span>Assist User</span>
      </div>
      <div className="status-divider"></div>
      <div className="activity-bar-container">
        <div className="activity-bar"></div>
      </div>
    </motion.div>
  );
}

// Komponen utama App
export default function App() {
  const [isChatMode, setIsChatMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isReplying, setIsReplying] = useState(false);

  const { playEnterSound, playSendSound, playReceiveSound, playExitSound } =
    useSounds();

  const handleCharacterClick = () => {
    if (isChatMode) {
      playExitSound();
    } else {
      playEnterSound();
    }
    setIsChatMode((currentMode) => !currentMode);
  };

  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Halo! Apa yang bisa saya bantu?" },
  ]);
  const replyTimeoutRef = useRef();

  // PERUBAHAN 1: Ganti fungsi handleSendMessage menjadi async untuk menangani API call
  const handleSendMessage = async () => {
    if (inputValue.trim() === "" || isLoading) return;

    playSendSound();

    const userMessage = { sender: "user", text: inputValue };
    // Tambahkan pesan pengguna ke state, dan tambahkan konteks percakapan untuk AI
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = inputValue; // Simpan input saat ini
    setInputValue("");
    setIsLoading(true);
    setIsReplying(false);

    if (replyTimeoutRef.current) {
      clearTimeout(replyTimeoutRef.current);
    }

    // PERUBAHAN 2: Logika Panggilan ke API Google AI
    // ===============================================
    const API_KEY = "AIzaSyCEzpygHXDk8YOsjs4ysrjs5oI4MXy5WzM"; // <-- TEMPEL KUNCI API ANDA DI SINI
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    // Siapkan data yang akan dikirim ke API
    const payload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Kamu adalah asisten AI bernama Vryxia, seorang maid yang ramah dan sedikit ceria. Jawablah pertanyaan berikut dengan singkat dan bersahabat: "${currentInput}"`,
            },
          ],
        },
      ],
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      // Ambil teks dari respons API
      const aiText = data.candidates[0].content.parts[0].text;
      const aiResponse = { sender: "ai", text: aiText };

      playReceiveSound();
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error calling Google AI API:", error);
      const errorResponse = {
        sender: "ai",
        text: "Maaf, sepertinya ada sedikit masalah dengan koneksiku saat ini.",
      };
      playReceiveSound(); // Tetap mainkan suara agar pengguna tahu ada respons
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      // Apapun hasilnya (sukses atau gagal), hentikan loading
      setIsLoading(false);
      setIsReplying(true);

      replyTimeoutRef.current = setTimeout(() => {
        setIsReplying(false);
      }, 1500);
    }
    // ===============================================
  };

  return (
    <div className="main-container">
      <div className="canvas-container">
        <Canvas
          shadows
          gl={{ alpha: true }}
          camera={{ position: [0, 1.4, 4.5], fov: 50 }}
          dpr={[1, 2]}
        >
          <Suspense fallback={<Loader />}>
            <SceneContent
              isChatMode={isChatMode}
              onCharacterClick={handleCharacterClick}
              isLoading={isLoading}
              isReplying={isReplying}
            />
          </Suspense>
        </Canvas>
      </div>
      <div className="ui-container">
        <AnimatePresence>
          {!isChatMode ? (
            <motion.header
              key="welcome-header"
              className="header"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h1>Vryxia AI</h1>
              <p>Klik karakter untuk memulai percakapan</p>
            </motion.header>
          ) : (
            <>
              <StatusPanel key="status-panel" isLoading={isLoading} />
              <ChatUI
                key="chat-ui"
                messages={messages}
                inputValue={inputValue}
                onInputChange={(e) => setInputValue(e.target.value)}
                onSendMessage={handleSendMessage}
              />
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
