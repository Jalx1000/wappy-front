import { Mp3Encoder } from "@breezystack/lamejs";

// WhatsApp Cloud API only accepts audio as aac/amr/mpeg/mp4/ogg(opus). Chrome's
// MediaRecorder produces audio/webm;codecs=opus, which WhatsApp rejects — so we
// re-encode voice notes to MP3 (audio/mpeg) in the browser. There is no ffmpeg
// on the backend, and MP3 is universally playable, so this keeps the pipeline
// dependency-light and lets the existing media upload path work unchanged.

const MP3_SAMPLE_RATE = 44100; // lamejs-supported and universally playable
const MP3_KBPS = 64; // ample for speech, keeps files small

// Audio containers WhatsApp accepts directly (base MIME, ignoring codec suffix).
const WHATSAPP_AUDIO_MIMES = [
  "audio/aac",
  "audio/amr",
  "audio/mpeg",
  "audio/mp4",
  "audio/ogg",
];

/** True when the recorded MIME can be sent to WhatsApp without transcoding. */
export function isWhatsappAudioMime(mime: string): boolean {
  const base = mime.split(";")[0].trim().toLowerCase();
  return WHATSAPP_AUDIO_MIMES.includes(base);
}

/**
 * Preferred MediaRecorder MIME for the current browser. Safari records
 * audio/mp4 (AAC) which WhatsApp accepts directly; Chrome/Firefox fall back to
 * webm/opus which we transcode. Returns undefined if recording is unsupported.
 */
export function pickRecorderMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const preferences = [
    "audio/mp4",
    "audio/webm;codecs=opus",
    "audio/ogg;codecs=opus",
    "audio/webm",
  ];
  return preferences.find((t) => MediaRecorder.isTypeSupported(t));
}

type AudioContextCtor = typeof AudioContext;

function getAudioContextCtor(): AudioContextCtor {
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  const Ctor = w.AudioContext ?? w.webkitAudioContext;
  if (!Ctor) throw new Error("Web Audio API no disponible en este navegador");
  return Ctor;
}

/**
 * Re-encodes a browser-recorded audio blob (typically audio/webm;codecs=opus)
 * into MP3 (audio/mpeg). Downmixes to mono and resamples to 44.1kHz so lamejs
 * always gets a supported sample rate regardless of the recording device.
 */
export async function audioBlobToMp3(blob: Blob): Promise<Blob> {
  const AudioCtx = getAudioContextCtor();
  const decodeCtx = new AudioCtx();
  let decoded: AudioBuffer;
  try {
    decoded = await decodeCtx.decodeAudioData(await blob.arrayBuffer());
  } finally {
    await decodeCtx.close().catch(() => {});
  }

  // Downmix to mono and resample to MP3_SAMPLE_RATE via an offline render.
  const frames = Math.max(1, Math.ceil(decoded.duration * MP3_SAMPLE_RATE));
  const offline = new OfflineAudioContext(1, frames, MP3_SAMPLE_RATE);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  const mono = rendered.getChannelData(0);

  // Float32 [-1, 1] → Int16 PCM.
  const pcm = new Int16Array(mono.length);
  for (let i = 0; i < mono.length; i++) {
    const s = Math.max(-1, Math.min(1, mono[i]));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  const encoder = new Mp3Encoder(1, MP3_SAMPLE_RATE, MP3_KBPS);
  const output: Uint8Array[] = [];
  const BLOCK = 1152; // MP3 frame size
  for (let i = 0; i < pcm.length; i += BLOCK) {
    const encoded = encoder.encodeBuffer(pcm.subarray(i, i + BLOCK));
    if (encoded.length > 0) output.push(encoded);
  }
  const tail = encoder.flush();
  if (tail.length > 0) output.push(tail);

  return new Blob(output as BlobPart[], { type: "audio/mpeg" });
}

/**
 * Turns a finished recording into a ready-to-send File in a WhatsApp-accepted
 * format: passthrough when already compatible, otherwise transcoded to MP3.
 */
export async function recordingToFile(blob: Blob, mime: string): Promise<File> {
  const stamp = Date.now();
  if (isWhatsappAudioMime(mime)) {
    const base = mime.split(";")[0].trim().toLowerCase();
    const ext = base === "audio/mp4" ? "m4a" : base === "audio/ogg" ? "ogg" : "m4a";
    return new File([blob], `nota-de-voz-${stamp}.${ext}`, { type: base });
  }
  const mp3 = await audioBlobToMp3(blob);
  return new File([mp3], `nota-de-voz-${stamp}.mp3`, { type: "audio/mpeg" });
}
