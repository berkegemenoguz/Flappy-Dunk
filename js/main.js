// ========================================
// Flappy Dunk — Giriş Noktası (Entry Point)
// Canvas'ı başlat ve oyun motorunu çalıştır.
// ========================================

import { Game }                          from './game.js';
import { CANVAS_WIDTH, CANVAS_HEIGHT }   from './constants.js';

// ── Canvas Referansı ─────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
canvas.width  = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// ── Oyunu Başlat ─────────────────────────────────────────────
const game = new Game(canvas);
game.init();
