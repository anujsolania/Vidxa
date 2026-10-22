import { pipeline } from '@xenova/transformers';
import { WaveFile } from 'wavefile';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

export interface TranscriptChunk {
  start: number;
  end: number;
  text: string;
}

let transcriberInstance: any = null;

// Lazy-load pipeline so model stays in memory across multiple jobs
const getTranscriber = async () => {
  if (!transcriberInstance) {
    console.log('[Whisper] Initializing Xenova/whisper-tiny.en model...');
    transcriberInstance = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
    console.log('[Whisper] Model loaded and ready.');
  }
  return transcriberInstance;
};

export const transcribeAudio = async (audioPath: string): Promise<TranscriptChunk[]> => {
  const tempWavPath = path.join(
    path.dirname(audioPath),
    `temp_whisper_${Date.now()}_${Math.round(Math.random() * 1e6)}.wav`
  );

  try {
    // 1. Convert input audio to 16kHz mono WAV expected by Whisper
    await new Promise<void>((resolve, reject) => {
      ffmpeg(audioPath)
        .toFormat('wav')
        .audioFrequency(16000)
        .audioChannels(1)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .save(tempWavPath);
    });

    // 2. Read WAV and convert samples to Float32Array
    const buffer = fs.readFileSync(tempWavPath);
    const wav = new WaveFile(buffer);
    wav.toBitDepth('32f');
    wav.toSampleRate(16000);

    let audioData = wav.getSamples();
    if (Array.isArray(audioData)) {
      audioData = audioData[0];
    }

    if (!audioData || audioData.length === 0) {
      return [];
    }

    // 3. Run Whisper inference
    const transcriber = await getTranscriber();
    const result = await transcriber(audioData, {
      return_timestamps: true,
      chunk_length_s: 30,
      stride_length_s: 5,
    });

    const segments: TranscriptChunk[] = [];

    // Chunks return: [{ text: "...", timestamp: [start, end] }]
    if (result && Array.isArray(result.chunks)) {
      for (const chunk of result.chunks) {
        const text = chunk.text?.trim() || '';
        // Skip empty or non-speech markers like [BLANK_AUDIO]
        if (!text || text.includes('[BLANK_AUDIO]')) {
          continue;
        }

        const start = chunk.timestamp?.[0] != null ? Number(chunk.timestamp[0]) : 0;
        const end = chunk.timestamp?.[1] != null ? Number(chunk.timestamp[1]) : start;

        segments.push({
          start: Math.round(start * 100) / 100,
          end: Math.round(end * 100) / 100,
          text,
        });
      }
    } else if (result && result.text) {
      const text = result.text.trim();
      if (text && !text.includes('[BLANK_AUDIO]')) {
        segments.push({
          start: 0,
          end: 0,
          text,
        });
      }
    }

    return segments;
  } catch (error) {
    console.error('[Whisper] Transcription error:', error);
    throw error;
  } finally {
    // Clean up temporary WAV file
    if (fs.existsSync(tempWavPath)) {
      try {
        fs.unlinkSync(tempWavPath);
      } catch (err) {
        console.error('[Whisper] Failed to clean up temp file:', tempWavPath, err);
      }
    }
  }
};
