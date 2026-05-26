export interface TextureApplyOptions {
  canvas: HTMLCanvasElement;
  originalImageData: ImageData;
  maskData: number[][];
  textureUrl: string;
  textureScale?: number;
}

export async function applyTextureToMask(options: TextureApplyOptions): Promise<void> {
  const { canvas, originalImageData, maskData, textureUrl, textureScale = 1 } = options;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const textureImg = await loadImage(textureUrl);
  const offscreen = new OffscreenCanvas(canvas.width, canvas.height);
  const offCtx = offscreen.getContext("2d")!;

  offCtx.putImageData(originalImageData, 0, 0);

  const pattern = offCtx.createPattern(textureImg, "repeat");
  if (!pattern) return;

  offCtx.save();
  offCtx.scale(textureScale, textureScale);

  for (let y = 0; y < maskData.length; y++) {
    for (let x = 0; x < maskData[y].length; x++) {
      if (maskData[y][x] > 0) {
        const srcPixel = getPixel(originalImageData, x, y);
        const luminance = (srcPixel.r * 0.299 + srcPixel.g * 0.587 + srcPixel.b * 0.114) / 255;
        offCtx.globalCompositeOperation = "multiply";
        offCtx.globalAlpha = luminance;
        offCtx.fillStyle = pattern;
        offCtx.fillRect(x, y, 1, 1);
      }
    }
  }

  offCtx.restore();
  ctx.drawImage(offscreen, 0, 0);
}

function getPixel(imageData: ImageData, x: number, y: number) {
  const i = (y * imageData.width + x) * 4;
  return { r: imageData.data[i], g: imageData.data[i + 1], b: imageData.data[i + 2] };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
