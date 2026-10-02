import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs-backend-webgl';
import { BoundingBox } from '@/types';

let model: cocoSsd.ObjectDetection | null = null;
let isLoading = false;

export async function loadDetector(): Promise<void> {
  if (model || isLoading) return;
  isLoading = true;
  try {
    await import('@tensorflow/tfjs-backend-webgl');
    model = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
    console.log('[PersonDetector] Model loaded successfully');
  } catch (error) {
    console.error('[PersonDetector] Failed to load model:', error);
    throw error;
  } finally {
    isLoading = false;
  }
}

export function isModelLoaded(): boolean {
  return model !== null;
}

let offscreenCanvas: HTMLCanvasElement | null = null;
let offscreenCtx: CanvasRenderingContext2D | null = null;
const MAX_INFERENCE_WIDTH = 416;

export async function detectPersons(
  input: HTMLVideoElement | HTMLCanvasElement | ImageData
): Promise<BoundingBox[]> {
  if (!model) {
    throw new Error('Model not loaded. Call loadDetector() first.');
  }

  let target: HTMLVideoElement | HTMLCanvasElement | ImageData = input;
  let scaleRatio = 1.0;

  // Mobile optimization: downscale high-res video to 416px before passing to WebGL
  if (typeof window !== 'undefined' && input instanceof HTMLVideoElement && input.videoWidth > 0) {
    const origW = input.videoWidth;
    const origH = input.videoHeight;

    if (origW > MAX_INFERENCE_WIDTH) {
      if (!offscreenCanvas) {
        offscreenCanvas = document.createElement('canvas');
        offscreenCtx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
      }

      scaleRatio = MAX_INFERENCE_WIDTH / origW;
      const targetW = MAX_INFERENCE_WIDTH;
      const targetH = Math.round(origH * scaleRatio);

      if (offscreenCanvas.width !== targetW || offscreenCanvas.height !== targetH) {
        offscreenCanvas.width = targetW;
        offscreenCanvas.height = targetH;
      }

      if (offscreenCtx) {
        offscreenCtx.drawImage(input, 0, 0, targetW, targetH);
        target = offscreenCanvas;
      }
    }
  }

  const predictions = await model.detect(target);

  return predictions
    .filter((p) => p.class === 'person' && p.score >= 0.3)
    .map((p) => ({
      x: p.bbox[0] / scaleRatio,
      y: p.bbox[1] / scaleRatio,
      width: p.bbox[2] / scaleRatio,
      height: p.bbox[3] / scaleRatio,
      confidence: p.score,
      label: 'person',
    }));
}

export function disposeDetector(): void {
  if (model) {
    model.dispose();
    model = null;
  }
}
