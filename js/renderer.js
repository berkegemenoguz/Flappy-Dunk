// ========================================
// Flappy Dunk — Renderer
// Canvas üzerine tüm UI çizimlerini yapan
// yardımcı fonksiyonlar.
// ========================================

import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, SKINS, BG_SKINS } from './constants.js';
import { SkinManager } from './skinManager.js';

export class Renderer {

    // ── Arka Plan ─────────────────────────────────────────────

    /** Arka plan: görsel varsa image, yoksa gradyan + yıldız emojileri */
    static drawBackground(ctx, stars, bgSkin, bgImages) {
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        // Görsel tabanlı arkaplan
        if (bgSkin && bgSkin.image && bgImages && bgImages[bgSkin.id]) {
            const img = bgImages[bgSkin.id];
            if (img.complete && img.naturalWidth > 0) {
                ctx.drawImage(img, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                return;
            }
        }

        // Varsayılan gradyan arkaplan
        const grad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
        grad.addColorStop(0, COLORS.BG_TOP);
        grad.addColorStop(0.5, COLORS.BG_MID);
        grad.addColorStop(1, COLORS.BG_BOTTOM);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        if (stars) {
            ctx.save();
            ctx.globalAlpha = 0.35;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            for (const s of stars) {
                ctx.font = `${Math.max(s.r * 3, 4)}px Arial`;
                ctx.fillText('⭐', s.x, s.y);
            }
            ctx.restore();
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
        if (gold > 0) this._drawBadge(ctx, `🪹 ${gold}`, 32, 16, COLORS.COIN);
    }

    /** En yüksek skor gösterimi (sağ üst köşe) */
    static drawHighScore(ctx, highScore) {
        if (highScore > 0) this._drawBadge(ctx, `🏆 BEST: ${highScore}`, 62, 14, '#ffd700');
    }

    /** Sağ üst köşe badge (ortak) */
    static _drawBadge(ctx, text, topY, fontSize, color) {
        ctx.save();
        ctx.font = `bold ${fontSize}px Inter, Arial, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';
        const m = ctx.measureText(text);
        const px = CANVAS_WIDTH - 18, pad = 10;
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        this._roundRect(ctx, px - m.width - pad, topY - 4, m.width + pad * 2, fontSize + 10, 8);
        ctx.fill();
        ctx.fillStyle = color;
        ctx.fillText(text, px, topY);
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

    static drawShop(ctx, totalGold, shopTab, tabButtons, ballData, bgData, backButton) {
        // Arkaplan üzerine karartma overlay
        ctx.fillStyle = COLORS.OVERLAY;
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.save();
        ctx.font = 'bold 30px Inter, Arial, sans-serif';
        ctx.fillStyle = COLORS.TEXT;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🛒  SHOP', CANVAS_WIDTH / 2, 45);
        ctx.restore();

        this._drawGoldBadge(ctx, totalGold, CANVAS_WIDTH - 22, 22);

        this.drawButton(ctx, backButton);

        // ── Sekmeler ─────────────────────────────────────────
        for (const tab of tabButtons) {
            const isActiveTab = (tab.tabId === shopTab);
            ctx.fillStyle = isActiveTab
                ? 'rgba(230, 57, 70, 0.25)'
                : 'rgba(255,255,255,0.06)';
            this._roundRect(ctx, tab.x, tab.y, tab.width, tab.height, 8);
            ctx.fill();

            ctx.strokeStyle = isActiveTab ? COLORS.RIM : 'rgba(255,255,255,0.08)';
            ctx.lineWidth = isActiveTab ? 2 : 1;
            this._roundRect(ctx, tab.x, tab.y, tab.width, tab.height, 8);
            ctx.stroke();

            ctx.save();
            ctx.font = 'bold 14px Inter, Arial, sans-serif';
            ctx.fillStyle = isActiveTab ? '#ffffff' : 'rgba(255,255,255,0.5)';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(tab.text, tab.x + tab.width / 2, tab.y + tab.height / 2);
            ctx.restore();
        }

        // ── Öğe Listesi ─────────────────────────────────────
        const startY    = 130;
        const itemH     = 56;
        const itemGap   = 6;
        const itemW     = CANVAS_WIDTH - 60;
        const startX    = 30;

        const data     = shopTab === 'balls' ? ballData : bgData;
        const skinList = shopTab === 'balls' ? SKINS    : BG_SKINS;
        const drawPreview = shopTab === 'balls'
            ? (ctx, skin, x, y, h) => {
                SkinManager.drawBall(ctx, x + 30, y + h / 2, 14, skin.id, 0);
                return 55; // text offset
            }
            : (ctx, skin, x, y, h, images) => {
                const px = x + 8, py = y + 6, pw = 44, ph = h - 12;
                this._drawBgPreview(ctx, skin, px, py, pw, ph, images);
                return 62; // text offset
            };

        this._drawSkinList(ctx, startX, startY, itemW, itemH, itemGap, totalGold, skinList, data, drawPreview);
    }

    /** Generic skin listesi çizimi */
    static _drawSkinList(ctx, startX, startY, itemW, itemH, itemGap, totalGold, skinList, data, drawPreview) {
        const { purchased, active, items, images } = data;

        for (let i = 0; i < skinList.length; i++) {
            const skin = skinList[i];
            const y = startY + i * (itemH + itemGap);
            const isActive    = active === skin.id;
            const isPurchased = purchased.includes(skin.id);
            const canAfford   = totalGold >= skin.price;

            // Satır arkaplanı
            ctx.fillStyle = isActive ? 'rgba(230, 57, 70, 0.18)' : 'rgba(255,255,255,0.06)';
            this._roundRect(ctx, startX, y, itemW, itemH, 10);
            ctx.fill();
            ctx.strokeStyle = isActive ? COLORS.RIM : 'rgba(255,255,255,0.08)';
            ctx.lineWidth   = isActive ? 2 : 1;
            this._roundRect(ctx, startX, y, itemW, itemH, 10);
            ctx.stroke();

            // Önizleme + isim
            const textOffset = drawPreview(ctx, skin, startX, y, itemH, images);
            ctx.fillStyle = COLORS.TEXT;
            ctx.font = '15px Inter, Arial, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(skin.name, startX + textOffset, y + itemH / 2);

            // Durum (ACTIVE / SELECT / fiyat)
            this._drawItemStatus(ctx, startX, y, itemW, itemH, isActive, isPurchased, canAfford, skin.price);

            // Tıklama alanı güncelle
            if (items && items[i]) {
                items[i].x = startX;  items[i].y = y;
                items[i].width = itemW;  items[i].height = itemH;
            }
        }
    }

    /** Arkaplan önizleme thumbnail */
    static _drawBgPreview(ctx, skin, x, y, w, h, images) {
        const img = skin.image && images && images[skin.id];
        const loaded = img && img.complete && img.naturalWidth > 0;

        ctx.save();
        this._roundRect(ctx, x, y, w, h, 6);
        ctx.clip();
        if (loaded) {
            ctx.drawImage(img, x, y, w, h);
        } else {
            this._drawDefaultBgPreview(ctx, x, y, w, h);
        }
        ctx.restore();

        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        this._roundRect(ctx, x, y, w, h, 6);
        ctx.stroke();
    }

    /** Varsayılan gradyan önizleme (küçük, clip zaten uygulanmış) */
    static _drawDefaultBgPreview(ctx, x, y, w, h) {
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, COLORS.BG_TOP);
        grad.addColorStop(0.5, COLORS.BG_MID);
        grad.addColorStop(1, COLORS.BG_BOTTOM);
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w, h);
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.globalAlpha = 0.5;
        ctx.fillText('⭐', x + w / 2, y + h / 2);
    }

    /** Mağaza öğesi durumu (ACTIVE / SELECT / fiyat) */
    static _drawItemStatus(ctx, startX, y, itemW, itemH, isActive, isPurchased, canAfford, price) {
        ctx.textAlign = 'right';
        ctx.font = 'bold 13px Inter, Arial, sans-serif';
        const rx = startX + itemW - 14, ry = y + itemH / 2;
        if (isActive) {
            ctx.fillStyle = '#4caf50';
            ctx.fillText('✅ ACTIVE', rx, ry);
        } else if (isPurchased) {
            ctx.fillStyle = '#90caf9';
            ctx.fillText('SELECT ▶', rx, ry);
        } else {
            ctx.fillStyle = canAfford ? COLORS.COIN : '#e63946';
            ctx.fillText(`🪙 ${price}`, rx, ry);
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
