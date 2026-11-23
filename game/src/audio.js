// Ember Duel: tiny bleeps from WebAudio. One job: sound, no assets.
let ctx = null;

export function ensureAudio() {
  try {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

function tone(freq, dur, type, gain) {
  if (!ctx) return;
  try {
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(gain, ctx.currentTime);
    amp.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch {
    // Sound never blocks play.
  }
}

export function sfxPlay() { tone(520, 0.09, 'triangle', 0.12); tone(780, 0.12, 'sine', 0.08); }
export function sfxDeal() { tone(340, 0.06, 'square', 0.05); }
export function sfxHit() { tone(160, 0.14, 'sawtooth', 0.1); }
export function sfxHeal() { tone(660, 0.16, 'sine', 0.09); tone(880, 0.2, 'sine', 0.07); }
export function sfxWin() { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'triangle', 0.12), i * 110)); }
export function sfxLoss() { [392, 330, 262].forEach((f, i) => setTimeout(() => tone(f, 0.25, 'sawtooth', 0.08), i * 140)); }
