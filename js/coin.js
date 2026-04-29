// ========================================
// Flappy Dunk — Coin (Altın)
// Toplanabilir altın nesnesi.
// Dönen coin animasyonu + parlama efekti.
// ========================================

import { COIN_RADIUS, COLORS } from './constants.js';

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

        // ── Dönen coin efekti (X ekseninde perspektif) ───────
        const scaleX = Math.abs(Math.cos(this.animationAngle));
        ctx.scale(Math.max(scaleX, 0.25), 1);

        // ── Gölge ────────────────────────────────────────────
        ctx.beginPath();
        ctx.arc(1, 2, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fill();

        // ── Coin gövdesi (radyal gradyan) ────────────────────
        const grad = ctx.createRadialGradient(
            -this.radius * 0.3, -this.radius * 0.3, 0,
            0, 0, this.radius
        );
        grad.addColorStop(0, COLORS.COIN_SHINE);
        grad.addColorStop(0.6, COLORS.COIN);
        grad.addColorStop(1, COLORS.COIN_DARK);

        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // ── Kenar çizgisi ────────────────────────────────────
        ctx.strokeStyle = COLORS.COIN_DARK;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // ── İç daire ────────────────────────────────────────
        ctx.beginPath();
        ctx.arc(0, 0, this.radius * 0.65, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(200,150,0,0.5)';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // ── "$" sembolü (yeterince geniş olduğunda) ─────────
        if (scaleX > 0.45) {
            ctx.fillStyle = COLORS.COIN_DARK;
            ctx.font = `bold ${this.radius * 0.9}px Inter, Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('$', 0, 0.5);
        }

        ctx.restore();

        // ── Parlama efekti (coin dışında çizilir) ────────────
        this._drawSparkle(ctx);
    }

    /** Periyodik parlama animasyonu */
    _drawSparkle(ctx) {
        const phase = Math.sin(this.animationAngle * 1.5);
        if (phase > 0.75) {
            const alpha = (phase - 0.75) * 4;   // 0 → 1
            ctx.save();
            ctx.globalAlpha = alpha * 0.8;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(
                this.x + this.radius * 0.65,
                this.y - this.radius * 0.65,
                1.8, 0, Math.PI * 2
            );
            ctx.fill();
            ctx.restore();
        }
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
