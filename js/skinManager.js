// ========================================
// Flappy Dunk — SkinManager
// Skin tanımları ve Canvas 2D çizim fonksiyonları
// Her skin bir emoji ile çizilir.
// ========================================

import { SKINS } from './constants.js';
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

    static getAllSkins()  { return SKINS; }
    static getSkin(id)    { return SKINS.find(s => s.id === id) || SKINS[0]; }
    static getActiveSkinId() { return StorageManager.getActiveSkin(); }

    /**
     * Aktif skin'e göre topu çiz.
     * @param {CanvasRenderingContext2D} ctx
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
        ctx.fillText(emoji, 0, 0);

        ctx.restore();
    }
}
