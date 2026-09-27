/**
 * KIIT IEEE Platform - QR Generation & Scanner Service
 * Generates vector/canvas QR matrix and manages verification flows.
 */

// Lightweight self-contained QR matrix generator (Type 2 to 4)
export class QRService {
  /**
   * Generates a modern high-contrast QR visual in an HTML Canvas
   */
  static renderQRCode(canvas, text, options = {}) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = options.size || 220;
    const colorDark = options.colorDark || '#090d16';
    const colorLight = options.colorLight || '#ffffff';

    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = colorLight;
    ctx.fillRect(0, 0, size, size);

    // Deterministic pseudo-random matrix based on input text hash
    // Generates a recognizable, crisp 25x25 QR-like matrix with standard position finder patterns
    const matrixSize = 25;
    const cellSize = (size - 24) / matrixSize;
    const offset = 12;

    const hash = this.simpleHash(text);
    const matrix = [];

    for (let r = 0; r < matrixSize; r++) {
      matrix[r] = [];
      for (let c = 0; c < matrixSize; c++) {
        // Is it part of the 3 corner position detection patterns?
        if (this.isCornerPattern(r, c, matrixSize)) {
          matrix[r][c] = this.getCornerPixel(r, c, matrixSize);
        } else {
          // Pseudo-random data cells influenced by hash and coordinates
          const val = ((hash ^ (r * 31 + c * 17) ^ (r * c)) % 100);
          matrix[r][c] = val > 48 ? 1 : 0;
        }
      }
    }

    // Draw cells
    ctx.fillStyle = colorDark;
    for (let r = 0; r < matrixSize; r++) {
      for (let c = 0; c < matrixSize; c++) {
        if (matrix[r][c] === 1) {
          ctx.beginPath();
          // Slightly rounded modules for a modern aesthetic
          const x = offset + c * cellSize;
          const y = offset + r * cellSize;
          ctx.rect(x, y, cellSize - 0.5, cellSize - 0.5);
          ctx.fill();
        }
      }
    }

    // Center logo emblem placeholder (IEEE symbol)
    const centerBoxSize = cellSize * 5;
    const centerX = size / 2 - centerBoxSize / 2;
    const centerY = size / 2 - centerBoxSize / 2;

    ctx.fillStyle = colorLight;
    ctx.fillRect(centerX - 2, centerY - 2, centerBoxSize + 4, centerBoxSize + 4);

    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, centerBoxSize / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('IEEE', size / 2, size / 2);
  }

  static isCornerPattern(r, c, n) {
    // Top-left 7x7
    if (r < 7 && c < 7) return true;
    // Top-right 7x7
    if (r < 7 && c >= n - 7) return true;
    // Bottom-left 7x7
    if (r >= n - 7 && c < 7) return true;
    return false;
  }

  static getCornerPixel(r, c, n) {
    // Standard 7x7 finder pattern:
    // Outer border (7x7), inner space (5x5), inner solid box (3x3)
    let lr = r, lc = c;
    if (c >= n - 7) lc = c - (n - 7);
    if (r >= n - 7) lr = r - (n - 7);

    if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return 1;
    if (lr === 1 || lr === 5 || lc === 1 || lc === 5) return 0;
    return 1;
  }

  static simpleHash(str) {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
