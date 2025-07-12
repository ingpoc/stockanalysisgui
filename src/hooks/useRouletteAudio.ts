'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface RouletteAudioHook {
  playChipSound: () => void;
  playSpinSound: () => void;
  playBallBouncingSound: () => void;
  playWinSound: () => void;
  playLoseSound: () => void;
  playDealerVoice: (announcement: string) => void;
  toggleBackgroundMusic: () => void;
  setMasterVolume: (volume: number) => void;
  isMusicPlaying: boolean;
}

export function useRouletteAudio(): RouletteAudioHook {
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [masterVolume, setMasterVolumeState] = useState(0.7);

  // Audio refs
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const chipSoundRef = useRef<HTMLAudioElement | null>(null);
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const ballBouncingRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const loseSoundRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    // Create audio elements with data URLs for synthetic sounds
    const createChipSound = () => {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        400,
        audioContext.currentTime + 0.1
      );

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.15
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    };

    // Background casino music - synthetic ambient sound
    const createBackgroundMusic = () => {
      const audio = new Audio();
      // Create a data URL for a simple background tone
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const duration = 30; // 30 seconds
      const sampleRate = 44100;
      const length = duration * sampleRate;
      const buffer = audioContext.createBuffer(2, length, sampleRate);

      for (let channel = 0; channel < 2; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          // Create ambient casino-like background noise
          channelData[i] =
            (Math.random() - 0.5) * 0.1 +
            Math.sin((i / sampleRate) * 440 * Math.PI * 2) * 0.05 +
            Math.sin((i / sampleRate) * 220 * Math.PI * 2) * 0.03;
        }
      }

      backgroundMusicRef.current = audio;
      backgroundMusicRef.current.loop = true;
      backgroundMusicRef.current.volume = masterVolume * 0.3;
    };

    createBackgroundMusic();

    return () => {
      // Cleanup
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.pause();
      }
    };
  }, []);

  const playChipSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Chip placement sound
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        800,
        audioContext.currentTime + 0.05
      );
      filter.frequency.setValueAtTime(2000, audioContext.currentTime);

      gainNode.gain.setValueAtTime(
        masterVolume * 0.4,
        audioContext.currentTime
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [masterVolume]);

  const playSpinSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();

      oscillator.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Spinning wheel sound
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        100,
        audioContext.currentTime + 3
      );

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, audioContext.currentTime);
      filter.frequency.exponentialRampToValueAtTime(
        300,
        audioContext.currentTime + 3
      );

      gainNode.gain.setValueAtTime(
        masterVolume * 0.3,
        audioContext.currentTime
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 3);
    } catch (error) {
      console.warn('Spin sound failed:', error);
    }
  }, [masterVolume]);

  const playBallBouncingSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create multiple quick bounces
      for (let i = 0; i < 5; i++) {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(
            1500 - i * 100,
            audioContext.currentTime
          );
          oscillator.frequency.exponentialRampToValueAtTime(
            800 - i * 50,
            audioContext.currentTime + 0.05
          );

          gainNode.gain.setValueAtTime(
            masterVolume * (0.3 - i * 0.05),
            audioContext.currentTime
          );
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.05
          );

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.05);
        }, i * 100);
      }
    } catch (error) {
      console.warn('Ball bouncing sound failed:', error);
    }
  }, [masterVolume]);

  const playWinSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Victory fanfare
      const frequencies = [523, 659, 784, 1047]; // C, E, G, C octave
      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          gainNode.gain.setValueAtTime(
            masterVolume * 0.4,
            audioContext.currentTime
          );
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.5
          );

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
        }, index * 150);
      });
    } catch (error) {
      console.warn('Win sound failed:', error);
    }
  }, [masterVolume]);

  const playLoseSound = useCallback(() => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Descending sad sound
      oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        200,
        audioContext.currentTime + 1
      );

      gainNode.gain.setValueAtTime(
        masterVolume * 0.3,
        audioContext.currentTime
      );
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    } catch (error) {
      console.warn('Lose sound failed:', error);
    }
  }, [masterVolume]);

  const playDealerVoice = useCallback(
    (announcement: string) => {
      // Use Speech Synthesis API for dealer voice
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(announcement);
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        utterance.volume = masterVolume * 0.6;

        // Try to use a female voice
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(
          voice =>
            voice.name.toLowerCase().includes('female') ||
            voice.name.toLowerCase().includes('woman') ||
            voice.name.toLowerCase().includes('zira') ||
            voice.name.toLowerCase().includes('hazel')
        );

        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }

        speechSynthesis.speak(utterance);
      }
    },
    [masterVolume]
  );

  const toggleBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      if (isMusicPlaying) {
        backgroundMusicRef.current.pause();
        setIsMusicPlaying(false);
      } else {
        backgroundMusicRef.current.play().catch(console.warn);
        setIsMusicPlaying(true);
      }
    }
  }, [isMusicPlaying]);

  const setMasterVolume = useCallback((volume: number) => {
    setMasterVolumeState(volume);
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.volume = volume * 0.3;
    }
  }, []);

  return {
    playChipSound,
    playSpinSound,
    playBallBouncingSound,
    playWinSound,
    playLoseSound,
    playDealerVoice,
    toggleBackgroundMusic,
    setMasterVolume,
    isMusicPlaying,
  };
}
