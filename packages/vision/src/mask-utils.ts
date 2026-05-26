export function decodeSAMMask(base64Mask: string, width: number, height: number): number[][] {
  const binary = atob(base64Mask);
  const mask: number[][] = Array.from({ length: height }, () => new Array(width).fill(0));
  for (let i = 0; i < binary.length; i++) {
    const byte = binary.charCodeAt(i);
    for (let bit = 0; bit < 8; bit++) {
      const pixelIndex = i * 8 + bit;
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);
      if (y < height) mask[y][x] = (byte >> (7 - bit)) & 1;
    }
  }
  return mask;
}

export function estimateSurfaceM2(
  boundingBox: { width: number; height: number },
  imageWidth: number,
  referenceWidthM: number = 0.6
): number {
  const pixelsPerMeter = imageWidth / (referenceWidthM * (imageWidth / boundingBox.width));
  const widthM = boundingBox.width / pixelsPerMeter;
  const heightM = boundingBox.height / pixelsPerMeter;
  return Math.round(widthM * heightM * 100) / 100;
}
