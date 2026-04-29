// ========================================
// Flappy Dunk — Renderer
// Canvas üzerine tüm UI çizimlerini yapan
// yardımcı fonksiyonlar.
// ========================================

import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, SKINS, HOOP_OPENING, RIM_WIDTH } from './constants.js';
import { SkinManager } from './skinManager.js';

export class Renderer {

    // ── Arka Plan ─────────────────────────────────────────────

    /** Gradyanlı arka plan + yıldız emojileri */
    static drawBackground(ctx, stars) {
        const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        grad.addColorStop(0, COLORS.BG_TOP);
        grad.addColorStop(0.5, COLORS.BG_MID);
        grad.addColorStop(1, COLORS.BG_BOTTOM);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (stars) {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const s of stars) {
                const fontSize = Math.max(s.r * 3, 4);
                ctx.font = `${fontSize}px Arial`;
                ctx.globalAlpha = 0.35;
                ctx.fillText('⭐', s.x, s.y);
            }
            ctx.globalAlpha = 1;
        }
    }

    // ── Oyun İçi UI ──────────────────────────────────────────

    /** Skor gösterimi (üst orta) */
    static drawScore(ctx, score) {
        ctx.save();
        ctx.font = 'bold 52px Inter, Arial, sans-serif';
        ctx.fillStyle = COLORS.TEXT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.shadowColor = COLORS.TEXT_SHADOW;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 2;
        ctx.fillText(String(score), CANVAS_WIDTH / 2, 28);
        ctx.restore();
    }

    /** Oturum altın sayıcı (sol üst) */
    static drawSessionGold(ctx, gold) {
        if (gold <= 0) return;
        ctx.save();
        ctx.font = 'bold 16px Inter, Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';

        const text = `🪹 ${gold}`;
        const m = ctx.measureText(text);
        const px = CANVAS_WIDTH - 18;
        const py = 32;
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        this._roundRect(ctx, px - m.width - 10, py - 4, m.width + 20, 26, 8);
        ctx.fill();

        ctx.fillStyle = COLORS.COIN;
        ctx.fillText(text, px, py);
        ctx.restore();
    }

    /** En yüksek skor gösterimi (sağ üst köşe) */
    static drawHighScore(ctx, highScore) {
        if (highScore <= 0) return;
        ctx.save();
        ctx.font = 'bold 14px Inter, Arial, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';

        const text = `🏆 BEST: ${highScore}`;
        const m = ctx.measureText(text);
        const px = CANVAS_WIDTH - 18;
        const py = 62;
        const padX = 10, padY = 4;
        const bw = m.width + padX * 2;
        const bh = 22;

        ctx.fillStyle = 'rgba(0,0,0,0.30)';
        this._roundRect(ctx, px - m.width - padX, py - padY, bw, bh, 7);
        ctx.fill();

        ctx.fillStyle = '#ffd700';
        ctx.fillText(text, px, py);
        ctx.restore();
    }

    // ── Ana Menü ─────────────────────────────────────────────

    static drawMainMenu(ctx, totalGold, buttons) {
        ctx.save();
        ctx.font = '900 40px Inter, Arial, sans-serif';
        ctx.fillStyle = COLORS.TEXT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(230, 57, 70, 0.6)';
        ctx.shadowBlur = 25;
        ctx.fillText('FLAPPY DUNK', CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.22);
        ctx.restore();

        ctx.save();
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏀', CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.34);
        ctx.restore();

        this._drawGoldBadge(ctx, totalGold, CANVAS_WIDTH - 22, 22);

        for (const btn of buttons) {
            this.drawButton(ctx, btn);
        }
    }

    // ── Mağaza Ekranı ────────────────────────────────────────

    static drawShop(ctx, totalGold, purchasedSkins, activeSkin, backButton, skinItems) {
        ctx.save();
        ctx.font = 'bold 30px Inter, Arial, sans-serif';
        ctx.fillStyle = COLORS.TEXT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🛒  SHOP', CANVAS_WIDTH / 2, 55);
        ctx.restore();

        this._drawGoldBadge(ctx, totalGold, CANVAS_WIDTH - 22, 22);

        this.drawButton(ctx, backButton);

        const startY    = 100;
        const itemH     = 56;
        const itemGap   = 6;
        const itemW     = CANVAS_WIDTH - 60;
        const startX    = 30;

        for (let i = 0; i < SKINS.length; i++) {
            const skin = SKINS[i];
            const y = startY + i * (itemH + itemGap);
            const isPurchased = purchasedSkins.includes(skin.id);
            const isActive    = activeSkin === skin.id;
            const canAfford   = totalGold >= skin.price;

            ctx.fillStyle = isActive
                ? 'rgba(230, 57, 70, 0.18)'
                : 'rgba(255,255,255,0.06)';
            this._roundRect(ctx, startX, y, itemW, itemH, 10);
            ctx.fill();

            ctx.strokeStyle = isActive ? COLORS.RIM : 'rgba(255,255,255,0.08)';
            ctx.lineWidth   = isActive ? 2 : 1;
            this._roundRect(ctx, startX, y, itemW, itemH, 10);
            ctx.stroke();

            SkinManager.drawBall(ctx, startX + 30, y + itemH / 2, 14, skin.id, 0);

            ctx.fillStyle = COLORS.TEXT;
            ctx.font = '15px Inter, Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(skin.name, startX + 55, y + itemH / 2);

            ctx.textAlign = 'right';
            if (isActive) {
                ctx.fillStyle = '#4caf50';
                ctx.font = 'bold 13px Inter, Arial, sans-serif';
                ctx.fillText('✅ ACTIVE', startX + itemW - 14, y + itemH / 2);
            } else if (isPurchased) {
                ctx.fillStyle = '#90caf9';
                ctx.font = 'bold 13px Inter, Arial, sans-serif';
                ctx.fillText('SELECT ▶', startX + itemW - 14, y + itemH / 2);
            } else {
                ctx.fillStyle = canAfford ? COLORS.COIN : '#e63946';
                ctx.font = 'bold 13px Inter, Arial, sans-serif';
                ctx.fillText(`🪙 ${skin.price}`, startX + itemW - 14, y + itemH / 2);
            }

            if (skinItems && skinItems[i]) {
                skinItems[i].x = startX;
                skinItems[i].y = y;
                skinItems[i].width = itemW;
                skinItems[i].height = itemH;
            }
        }
    }

    // ── Game Over Ekranı ─────────────────────────────────────

    static drawGameOver(ctx, score, sessionGold, highScore, isNewRecord, buttons) {
        ctx.fillStyle = COLORS.OVERLAY;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.save();
        ctx.font = '900 44px Inter, Arial, sans-serif';
        ctx.fillStyle = COLORS.TEXT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(230, 57, 70, 0.7)';
        ctx.shadowBlur = 20;
        ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.22);
        ctx.restore();

        const boxY = CANVAS_HEIGHT * 0.30;
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
        this._roundRect(ctx, CANVAS_WIDTH / 2 - 120, boxY, 240, 110, 14);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        this._roundRect(ctx, CANVAS_WIDTH / 2 - 120, boxY, 240, 110, 14);
        ctx.stroke();

        ctx.font = 'bold 28px Inter, Arial, sans-serif';
        ctx.fillStyle = COLORS.TEXT;
        ctx.textAlign = 'center';
        ctx.fillText(`Score: ${score}`, CANVAS_WIDTH / 2, boxY + 30);

        ctx.font = 'bold 16px Inter, Arial, sans-serif';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`🏆 Best: ${highScore}`, CANVAS_WIDTH / 2, boxY + 62);

        ctx.font = 'bold 18px Inter, Arial, sans-serif';
        ctx.fillStyle = COLORS.COIN;
        ctx.fillText(`🪹 +${sessionGold}`, CANVAS_WIDTH / 2, boxY + 90);
        ctx.restore();

        if (isNewRecord) {
            ctx.save();
            ctx.font = 'bold 13px Inter, Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            const glow = ctx.createRadialGradient(
                CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.22, 0,
                CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.22, 90
            );
            glow.addColorStop(0, 'rgba(255,215,0,0.18)');
            glow.addColorStop(1, 'rgba(255,215,0,0)');
            ctx.fillStyle = glow;
            ctx.fillRect(CANVAS_WIDTH / 2 - 90, CANVAS_HEIGHT * 0.22 - 90, 180, 180);

            const rx = CANVAS_WIDTH / 2;
            const ry = boxY - 20;
            ctx.fillStyle = '#ffd700';
            this._roundRect(ctx, rx - 65, ry - 12, 130, 24, 12);
            ctx.fill();
            ctx.fillStyle = '#1a1a2e';
            ctx.fillText('✨ NEW RECORD! ✨', rx, ry);
            ctx.restore();
        }

        for (const btn of buttons) {
            this.drawButton(ctx, btn);
        }
    }

    // ── Ready Ekranı ─────────────────────────────────────────

    static drawInstructions(ctx) {
        ctx.save();
        const alpha = 0.4 + Math.sin(Date.now() / 500) * 0.3;
        ctx.globalAlpha = alpha;
        ctx.font = '17px Inter, Arial, sans-serif';
        ctx.fillStyle = COLORS.TEXT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Tap or press Space to play', CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.6);
        ctx.restore();
    }

    // ── Parçacık Efektleri ───────────────────────────────────

    static drawParticles(ctx, particles) {
        for (const p of particles) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            const fontSize = Math.max(p.size * 2, 4);
            ctx.font = `${fontSize}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('✨', p.x, p.y);
            ctx.restore();
        }
    }

    // ── Buton Çizimi ─────────────────────────────────────────

    static drawButton(ctx, btn) {
        ctx.save();
        const { x, y, width, height, text, color, hovered, disabled } = btn;

        ctx.shadowColor  = 'rgba(0,0,0,0.35)';
        ctx.shadowBlur   = 12;
        ctx.shadowOffsetY = 4;

        let bgColor = color || COLORS.BUTTON;
        if (disabled)    bgColor = '#444';
        else if (hovered) bgColor = btn.hoverColor || COLORS.BUTTON_HOVER;

        ctx.fillStyle = bgColor;
        this._roundRect(ctx, x, y, width, height, 12);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
        this._roundRect(ctx, x, y, width, height, 12);
        ctx.stroke();

        ctx.fillStyle = disabled ? '#777' : COLORS.BUTTON_TEXT;
        ctx.font = 'bold 17px Inter, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, x + width / 2, y + height / 2);

        ctx.restore();
    }

    // ── Altın Rozeti (Sağ Üst) ───────────────────────────────

    static _drawGoldBadge(ctx, gold, rightX, topY) {
        ctx.save();
        ctx.font = 'bold 17px Inter, Arial, sans-serif';
        const text = `🪙 ${gold}`;
        const m = ctx.measureText(text);

        const padX = 12, padY = 5;
        const bw = m.width + padX * 2;
        const bh = 26;
        const bx = rightX - bw;
        const by = topY;

        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        this._roundRect(ctx, bx, by, bw, bh, 8);
        ctx.fill();

        ctx.fillStyle = COLORS.COIN;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(text, rightX - padX, topY + padY);
        ctx.restore();
    }

    // ── Yardımcı: Yuvarlak Köşeli Dikdörtgen Path ───────────

    static _roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }
}
