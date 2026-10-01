import { readSetting, writeSetting } from './storage.js';

const KEY = 'mg-voice';
const supported = 'speechSynthesis' in window;
let voiceOn = readSetting(KEY, 'on') !== 'off';
let ruVoice = null;
let userInteracted = false;
let initialized = false;

// TTS читает вслух всё подряд: тире, «ёлочки», эмодзи. Оставляем кириллицу, латиницу, цифры и знаки.
export function cleanForTTS(text) {
  if (!text) return '';
  return String(text)
    .replace(/[—–]/g, ', ')
    .replace(/[^\u0400-\u04FFA-Za-z0-9\s.,!?;:]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,!?;:])/g, '$1')
    .trim();
}

function pickRuVoice() {
  if (!supported) return;
  try {
    const list = speechSynthesis.getVoices() || [];
    ruVoice = list.find((v) => /^ru[-_]RU$/i.test(v.lang))
      || list.find((v) => v.lang && v.lang.toLowerCase().startsWith('ru'))
      || null;
  } catch (e) {
    // голос необязателен
  }
}

export function initVoice() {
  if (initialized) return;
  initialized = true;
  voiceOn = readSetting(KEY, 'on') !== 'off';

  // Говорить можно только после первого действия пользователя.
  ['pointerdown', 'touchstart', 'keydown'].forEach((evt) => {
    document.addEventListener(evt, () => { userInteracted = true; },
      { once: true, capture: true, passive: true });
  });

  if (!supported) return;
  try {
    speechSynthesis.addEventListener('voiceschanged', pickRuVoice);
  } catch (e) {
    // старые браузеры
  }
  // getVoices() может блокировать поток до 500 мс — вызываем после первой отрисовки.
  requestAnimationFrame(() => requestAnimationFrame(pickRuVoice));
  window.addEventListener('pagehide', () => {
    try { speechSynthesis.cancel(); } catch (e) { /* ничего */ }
  });
}

export function speak(text) {
  if (!text || !voiceOn || !supported || !userInteracted) return;
  const clean = cleanForTTS(text);
  if (!clean) return;
  try {
    speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = 'ru-RU';
    if (ruVoice) utter.voice = ruVoice;
    utter.rate = 0.95;
    utter.pitch = 1.1;
    utter.volume = 1;
    speechSynthesis.speak(utter);
  } catch (e) {
    // голос необязателен
  }
}

export function isVoiceOn() {
  return voiceOn;
}

export function toggleVoice() {
  voiceOn = !voiceOn;
  writeSetting(KEY, voiceOn ? 'on' : 'off');
  if (!voiceOn && supported) {
    try { speechSynthesis.cancel(); } catch (e) { /* ничего */ }
  }
  return voiceOn;
}
