// ========================================
// Flappy Dunk — Hoop (Basketbol Potası)
// Rim bar (görsel) + bumper'lar (sekme) + ağ
// ========================================

import { RIM_WIDTH, RIM_THICKNESS, HOOP_OPENING, COLORS } from './constants.js';

// Bumper boyutları (rim'in sol/sağ ucundaki küçük dikdörtgenler)
const BUMPER_W = 12;
const BUMPER_H = 20;

export class Hoop {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;       // Açıklığın DİKEY merkezi
        this.speed = speed;

        this.scored = false;
        this.passChecked = false;
    }

    update(dt) {
        this.x -= this.speed * dt;
    }

    // ── Çizim ──────────────────────────────────────────────────

    draw(ctx) {
        const hw = RIM_WIDTH / 2;
        const ho = HOOP_OPENING / 2;
        const rimY = this.y + ho;

        // ── Ana rim çizgisi (sadece görsel) ───────────────────
        const grad = ctx.createLinearGradient(
            this.x - hw, rimY, this.x - hw, rimY + RIM_THICKNESS
        );
        grad.addColorStop(0, COLORS.RIM_SHINE);
        grad.addColorStop(0.4, COLORS.RIM);
        grad.addColorStop(1, '#a02030');
        ctx.fillStyle = grad;
        ctx.fillRect(this.x - hw, rimY, RIM_WIDTH, RIM_THICKNESS);

        // Üst kenar parlama
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.fillRect(this.x - hw, rimY, RIM_WIDTH, 1.5);

        // ── Sol bumper ───────────────────────────────────────
        this._drawBumper(ctx, this.x - hw - BUMPER_W, rimY - (BUMPER_H - RIM_THICKNESS) / 2);

        // ── Sağ bumper ───────────────────────────────────────
        this._drawBumper(ctx, this.x + hw, rimY - (BUMPER_H - RIM_THICKNESS) / 2);

        // ── Ağ (net) ─────────────────────────────────────────
        this._drawNet(ctx, this.x - hw, rimY + RIM_THICKNESS, RIM_WIDTH);
    }

    /** Bumper dikdörtgeni çiz (koyu kırmızı, hafif parlama) */
    _drawBumper(ctx, x, y) {
        const grad = ctx.createLinearGradient(x, y, x, y + BUMPER_H);
        grad.addColorStop(0, '#c0252f');
        grad.addColorStop(0.5, '#8b1a2a');
        grad.addColorStop(1, '#6b1020');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, BUMPER_W, BUMPER_H);

        // Parlama
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(x, y, BUMPER_W, 2);
    }

    /** Ağ (net) mesh çizimi */
    _drawNet(ctx, netX, netY, netW) {
        const NET_HEIGHT = 32;
        const ROWS = 4;
        const COLS = 5;

        ctx.strokeStyle = COLORS.NET;
        ctx.lineWidth = 0.9;

        for (let row = 1; row <= ROWS; row++) {
            const t = row / ROWS;
            const prevT = (row - 1) / ROWS;
            const curW = netW * (1 - t * 0.35);
            const prevW = netW * (1 - prevT * 0.35);
            const curOff = (netW - curW) / 2;
            const prevOff = (netW - prevW) / 2;
            const curY = netY + NET_HEIGHT * t;
            const prevY = netY + NET_HEIGHT * prevT;

            for (let col = 0; col <= COLS; col++) {
                const ct = col / COLS;
                const cx = netX + curOff + curW * ct;
                const px = netX + prevOff + prevW * ct;
                ctx.beginPath();
                ctx.moveTo(px, prevY);
                ctx.lineTo(cx, curY);
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.moveTo(netX + curOff, curY);
            ctx.lineTo(netX + curOff + curW, curY);
            ctx.stroke();
        }
    }

    // ── Çarpışma Sınırları ──────────────────────────────────────

    /** Sol ve sağ bumper AABB'leri (sekme için) */
    getBumperBounds() {
        const hw = RIM_WIDTH / 2;
        const rimY = this.y + HOOP_OPENING / 2;
        const bY = rimY - (BUMPER_H - RIM_THICKNESS) / 2;

        return {
            left: {
                x: this.x - hw - BUMPER_W,
                y: bY,
                width: BUMPER_W,
                height: BUMPER_H,
            },
            right: {
                x: this.x + hw,
                y: bY,
                width: BUMPER_W,
                height: BUMPER_H,
            },
        };
    }

    /** Geçiş bölgesi (skor) */
    getPassThroughZone() {
        return {
            left: this.x - RIM_WIDTH / 2,
            right: this.x + RIM_WIDTH / 2,
            top: this.y - HOOP_OPENING / 2,
            bottom: this.y + HOOP_OPENING / 2,
        };
    }

    isOffScreen() {
        return this.x + RIM_WIDTH / 2 + BUMPER_W < -20;
    }
}

