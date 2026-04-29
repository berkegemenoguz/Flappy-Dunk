// ========================================
// Flappy Dunk — Coin (Altın)
// Toplanabilir altın nesnesi.
// Dönen coin animasyonu + parlama efekti.
// ========================================

import { COIN_RADIUS } from './constants.js';

export class Coin {
    /**
     * @param {number} x     — Başlangıç X koordinatı
     * @param {number} y     — Başlangıç Y koordinatı
     * @param {number} speed — Sola doğru hareket hızı (px/s, potayla aynı)
     */
    constructor(x, y, speed) {
        this.x      = x;
        this.y      = y;
        this.radius = COIN_RADIUS;
        this.speed  = speed;

        this.collected      = false;
        this.animationAngle = Math.random() * Math.PI * 2;  // Başlangıç faz açısı
    }

    /** Her frame pozisyon ve animasyon güncelle */
    update(dt) {
        this.x -= this.speed * dt;
        this.animationAngle += dt * 5;   // Dönüş hızı
    }

    /** Altını canvas üzerine çiz */
    draw(ctx) {
        if (this.collected) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        const scaleX = Math.abs(Math.cos(this.animationAngle));
        ctx.scale(Math.max(scaleX, 0.25), 1);

        const fontSize = this.radius * 2;
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000000';
        ctx.fillText('🪙', 0, 0);

        ctx.restore();
    }

    /** Çarpışma sınır bilgisi (daire) */
    getBounds() {
        return { x: this.x, y: this.y, radius: this.radius };
    }

    /** Ekrandan tamamen çıktı mı? */
    isOffScreen() {
        return this.x + this.radius < -10;
    }
}
