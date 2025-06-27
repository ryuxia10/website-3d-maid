import { Howl } from "howler";
import { useMemo } from "react";

// Ini adalah "custom hook" React untuk mengelola semua suara kita
export const useSounds = () => {
  // useMemo digunakan agar suara hanya di-load sekali saja saat aplikasi pertama kali berjalan
  const sounds = useMemo(() => {
    return {
      playEnterSound: () => {
        const sound = new Howl({
          src: ["/ui-open.mp3"], // Ambil dari folder public
          volume: 0.5,
        });
        sound.play();
      },
      playSendSound: () => {
        const sound = new Howl({
          src: ["/send-message.mp3"],
          volume: 0.6,
        });
        sound.play();
      },
      playReceiveSound: () => {
        const sound = new Howl({
          src: ["/receive-message.mp3"],
          volume: 0.4,
        });
        sound.play();
      },
      // PERUBAHAN: Menambahkan fungsi untuk suara keluar
      playExitSound: () => {
        const sound = new Howl({
          src: ["/ui-close.mp3"],
          volume: 0.5,
        });
        sound.play();
      },
    };
  }, []); // Dependency array kosong berarti ini hanya dijalankan sekali

  return sounds;
};
