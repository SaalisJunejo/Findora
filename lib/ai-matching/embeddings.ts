/**
 * Client-side face embedding generation using @vladmandic/face-api.
 *
 * Runs entirely in the browser — no server-side canvas or tfjs-node.
 * Models are loaded once from /public/models and cached for the session.
 *
 * Pipeline:
 * 1. SSD MobileNet v1 — face detection
 * 2. Face Landmark 68 — 68-point facial landmark detection
 * 3. Face Recognition — 128-dimensional embedding (face descriptor)
 *
 * IMPORTANT: face-api is dynamically imported (not statically imported at the
 * top of this file) to avoid SSR crashes. The package references Node.js
 * APIs (TextEncoder via util) that crash during Next.js static prerendering.
 * Dynamic import ensures the module is only loaded in the browser.
 */

/** Cached reference to the face-api module, loaded on first use. */
let _faceapi: typeof import("@vladmandic/face-api") | null = null;

async function getFaceApi() {
  if (!_faceapi) {
    _faceapi = await import("@vladmandic/face-api");
  }
  return _faceapi;
}

/** Cached flag — models are loaded only once per session. */
let modelsLoaded = false;

/**
 * Load the three required face-api model weight sets from /models.
 * Safe to call multiple times — subsequent calls are no-ops.
 */
export async function loadClientModels(): Promise<void> {
  if (modelsLoaded) return;

  const faceapi = await getFaceApi();
  const MODEL_URL = "/models";

  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);

  modelsLoaded = true;
}

/**
 * Generate a 128-dimensional face embedding from an image file.
 *
 * @param imageFile - The image file selected by the user
 * @returns `{ embedding, warning }`:
 *   - On success: `embedding` is a number[128], `warning` is null.
 *   - On no face detected: `embedding` is null, `warning` is a friendly message.
 *   - On error: `embedding` is null, `warning` describes the error.
 *
 * Never throws — all errors are caught and returned as warnings.
 */
export async function generateClientEmbeddingFromFile(
  imageFile: File
): Promise<{ embedding: number[] | null; warning: string | null }> {
  try {
    // Ensure models are loaded
    await loadClientModels();

    // Create an HTMLImageElement from the File
    const imageUrl = URL.createObjectURL(imageFile);
    const img = new Image();

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load image for analysis."));
      img.src = imageUrl;
    });

    const faceapi = await getFaceApi();

    // Run the face detection pipeline
    const detection = await faceapi
      .detectSingleFace(img, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceDescriptor();

    // Clean up the object URL
    URL.revokeObjectURL(imageUrl);

    if (!detection) {
      return {
        embedding: null,
        warning:
          "No face detected in this photo. You can still submit, but AI matching may be less accurate. Try a clearer, front-facing photo.",
      };
    }

    // detection.descriptor is a Float32Array(128) — convert to number[]
    const embedding = Array.from(detection.descriptor);

    return { embedding, warning: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error during face analysis.";
    return {
      embedding: null,
      warning: `Face analysis failed: ${message} You can still submit the form.`,
    };
  }
}
