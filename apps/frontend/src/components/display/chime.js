// Two-note "ding" generated with the Web Audio API, so no audio file is needed.
let audioContext = null;

function getAudioContext() {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = AudioContextClass ? new AudioContextClass() : null;
  }
  return audioContext;
}

// Browsers keep audio blocked until someone interacts with the page.
export function isSoundEnabled() {
  const context = getAudioContext();
  return context !== null && context.state === "running";
}

// Must be called from a click: that is what unblocks the audio.
export async function enableSound() {
  const context = getAudioContext();
  if (!context) {
    return false;
  }
  await context.resume();
  return context.state === "running";
}

function playNote(context, frequency, startAt, duration) {
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(0.4, startAt + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration);
}

export function playChime() {
  if (!isSoundEnabled()) {
    return;
  }
  const context = getAudioContext();
  const now = context.currentTime;
  playNote(context, 880, now, 0.6);
  playNote(context, 660, now + 0.35, 0.9);
}
