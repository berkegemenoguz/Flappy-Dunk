// ========================================
// Flappy Dunk — Ball (Top / Karakter)
// Fizik motoru: yerçekimi, zıplama, terminal hız
// ========================================

import { BALL_RADIUS, BALL_START_X, BALL_START_Y,
         GRAVITY, JUMP_FORCE, MAX_FALL_SPEED } from './constants.js';
import { SkinManager } from './skinManager.js';

export class Ball {
    constructor() {
        this.x        = BALL_START_X;
        this.y        = BALL_START_Y;
        this.radius   = BALL_RADIUS;
        this.velocity = 0;        // Dikey hız (pozitif = aşağı)
        this.rotation = 0;        // Görsel dönüş açısı
    }

    /**
     * Fizik güncellemesi (her frame).
     * @param {number} dt — deltaTime (saniye)
     */
    update(dt) {
        // Yerçekimi → hıza ekle
        this.velocity += GRAVITY * dt;

        // Terminal hız sınırı
        if (this.velocity > MAX_FALL_SPEED) {
            this.velocity = MAX_FALL_SPEED;
        }

        // Pozisyonu güncelle
        this.y += this.velocity * dt;

        // Hıza bağlı dönme animasyonu
        this.rotation += this.velocity * dt * 0.04;
    }

    /** Zıplama — yukarı ivme uygula */
    jump() {
        this.velocity = -JUMP_FORCE;
    }

    /**
     * Aktif skin ile topu Canvas üzerine çiz.
     * @param {CanvasRenderingContext2D} ctx
     * @param {string} skinId
     */
    draw(ctx, skinId) {
        // Gölge
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x + 2, this.y + 3, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fill();
        ctx.restore();

        // Top çizimi (skin'e göre)
        SkinManager.drawBall(ctx, this.x, this.y, this.radius, skinId, this.rotation);
    }

    /** Çarpışma sınır bilgisi */
    getBounds() {
        return { x: this.x, y: this.y, radius: this.radius };
    }

    /** Başlangıç pozisyonuna sıfırla */
    reset() {
        this.x        = BALL_START_X;
        this.y        = BALL_START_Y;
        this.velocity = 0;
        this.rotation = 0;
    }
}
