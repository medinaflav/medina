// Simple Audio Context wrapper to generate UI sounds without external assets

let audioCtx = null;

const getAudioContext = () => {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
};

export const playSuccessSound = () => {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // Classic "Success" Chime - Two-tone Rising (C5 -> G5)
        osc.type = 'sine';

        // Note 1: C5 (523.25 Hz)
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        // Note 2: G5 (783.99 Hz) after 80ms
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.08);

        // Volume Envelope
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.08); // Sustain first note
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3); // Decay second note

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
        console.error("Audio error", e);
    }
};

export const playErrorSound = () => {
    try {
        const ctx = getAudioContext();
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        // "Buzz" / "Thud" - Low sawtooth or triangle
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.2); // Pitch down

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
        console.error("Audio error", e);
    }
};
