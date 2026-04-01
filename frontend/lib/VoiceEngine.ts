"use client";

class VoiceEngine {
  private static instance: VoiceEngine;
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private enabled: boolean = true;
  private initialized: boolean = false;

  private constructor() {}

  static getInstance(): VoiceEngine {
    if (!VoiceEngine.instance) {
      VoiceEngine.instance = new VoiceEngine();
    }
    return VoiceEngine.instance;
  }

  init() {
    if (this.initialized || typeof window === "undefined") return;
    this.synth = window.speechSynthesis;
    this.initialized = true;
    this.loadVoice();
    // Voices may load async
    if (this.synth) {
      this.synth.onvoiceschanged = () => this.loadVoice();
    }
  }

  private loadVoice() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer a female English voice
    const preferred = [
      "Microsoft Zira",
      "Google UK English Female",
      "Samantha",
      "Karen",
      "Moira",
      "Fiona",
      "Victoria",
    ];
    for (const name of preferred) {
      const match = voices.find((v) => v.name.includes(name));
      if (match) {
        this.voice = match;
        return;
      }
    }
    // Fallback: any English female voice
    const englishFemale = voices.find(
      (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes("female")
    );
    if (englishFemale) {
      this.voice = englishFemale;
      return;
    }
    // Fallback: any English voice
    const english = voices.find((v) => v.lang.startsWith("en"));
    if (english) this.voice = english;
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on) this.stop();
  }

  isEnabled() {
    return this.enabled;
  }

  stop() {
    this.synth?.cancel();
  }

  speak(text: string, priority: boolean = false) {
    if (!this.enabled || !this.synth) return;
    if (priority) this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) utterance.voice = this.voice;
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;
    this.synth.speak(utterance);
  }

  speakDirection(instruction: string, distanceM: number) {
    const distText =
      distanceM >= 1000
        ? `${(distanceM / 1000).toFixed(1)} kilometers`
        : `${Math.round(distanceM)} meters`;
    this.speak(`In ${distText}, ${instruction}`, true);
  }

  speakDangerAlert(riskScore: number, advice: string) {
    this.speak(
      `Warning! You are entering a high risk area. Risk score ${Math.round(riskScore)}. ${advice}. Please be aware and stay safe.`,
      true
    );
  }

  speakZoneExit() {
    this.speak("You have exited the danger zone. Stay alert.", true);
  }

  announceTime() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    const mStr = m < 10 ? `oh ${m}` : `${m}`;
    this.speak(`The current time is ${h12} ${mStr} ${period}`, true);
  }

  announceArrival() {
    this.speak(
      "You have arrived at your destination. Stay safe!",
      true
    );
  }

  announceNavStart() {
    this.speak("HerWay voice navigation activated. Starting route guidance.", true);
  }

  speakSafetyTip(tip: string) {
    this.speak(`Safety tip: ${tip}`, false);
  }
}

export default VoiceEngine;
