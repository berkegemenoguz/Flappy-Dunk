// ========================================
// Flappy Dunk — SkinManager
// Skin tanımları ve Canvas 2D çizim fonksiyonları
// Her skin bir emoji ile çizilir.
// ========================================

import { StorageManager } from './storageManager.js';

const SKIN_EMOJIS = {
    default:    '🏀',
    tennis:     '🎾',
    football:   '⚽',
    volleyball: '🏐',
    bowling:    '🎳',
    galaxy:     '🌌',
};

export class SkinManager {

    static getActiveSkinId() { return StorageManager.getActiveSkin(); }

    /**
     * Aktif skin'e göre topu çiz.
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x
     * @param {number} y
     * @param {number} radius
     * @param {string} skinId
     * @param {number} rotation
     */
    static drawBall(ctx, x, y, radius, skinId, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        const emoji = SKIN_EMOJIS[skinId] || SKIN_EMOJIS.default;
        const fontSize = radius * 2;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000000';
        ctx.fillText(emoji, 0, 0);

        ctx.restore();
    }
}
