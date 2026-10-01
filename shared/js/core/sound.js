import { readSetting, writeSetting } from './storage.js';

const KEY = 'mg-sound';
let soundOn = readSetting(KEY, 'on') !== 'off';
let audioCtx = null;

export function beep(freq, dur, type) {
  if (!soundOn) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = audioCtx || new Ctx();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'sine';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const t = audioCtx.currentTime;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.15, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  } catch (e) {
    // звук необязателен
  }
}

export const sndSuccess = () => { beep(660, 0.12); setTimeout(() => beep(880, 0.18), 110); };
export const sndError = () => beep(220, 0.2, 'triangle');
export const sndMove = () => beep(440, 0.08);
export const sndHint = () => { beep(520, 0.08); setTimeout(() => beep(660, 0.10), 90); };
export const sndWinGood = () => {
  beep(660, 0.12);
  setTimeout(() => beep(880, 0.18), 110);
  setTimeout(() => beep(1100, 0.22), 260);
};
export const sndWinSoft = () => {
  beep(440, 0.12);
  setTimeout(() => beep(520, 0.14), 110);
  setTimeout(() => beep(440, 0.18), 240);
};
export const sndDraw = () => { beep(440, 0.12); setTimeout(() => beep(330, 0.18), 130); };

export function initSound() {
  soundOn = readSetting(KEY, 'on') !== 'off';
}

export function isSoundOn() {
  return soundOn;
}

export function toggleSound() {
  soundOn = !soundOn;
  writeSetting(KEY, soundOn ? 'on' : 'off');
  return soundOn;
}
