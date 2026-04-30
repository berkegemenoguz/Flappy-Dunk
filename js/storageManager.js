// ========================================
// Flappy Dunk — StorageManager
// localStorage ile kalıcı veri yönetimi
// ========================================

const PREFIX = 'flappyDunk_';

const KEYS = {
    TOTAL_GOLD:         PREFIX + 'totalGold',
    PURCHASED_SKINS:    PREFIX + 'purchasedSkins',
    ACTIVE_SKIN:        PREFIX + 'activeSkin',
    HIGH_SCORE:         PREFIX + 'highScore',
    PURCHASED_BG_SKINS: PREFIX + 'purchasedBgSkins',
    ACTIVE_BG_SKIN:     PREFIX + 'activeBgSkin',
};

export class StorageManager {

    // ── Altın ────────────────────────────────────────────────

    static getTotalGold() {
        return parseInt(localStorage.getItem(KEYS.TOTAL_GOLD) || '0', 10);
    }

    static addGold(amount) {
        localStorage.setItem(KEYS.TOTAL_GOLD, String(this.getTotalGold() + amount));
    }

    /** Altın harca. Başarılı ise true döner. */
    static spendGold(amount) {
        const current = this.getTotalGold();
        if (current < amount) return false;
        localStorage.setItem(KEYS.TOTAL_GOLD, String(current - amount));
        return true;
    }

    // ── Skin Yardımcıları (Generic) ──────────────────────────

    static _getList(key, defaultId) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [defaultId];
    }

    static _addToList(key, id, defaultId) {
        const list = this._getList(key, defaultId);
        if (!list.includes(id)) {
            list.push(id);
            localStorage.setItem(key, JSON.stringify(list));
        }
    }

    // ── Top Skinleri ─────────────────────────────────────────

    static getPurchasedSkins() { return this._getList(KEYS.PURCHASED_SKINS, 'default'); }
    static purchaseSkin(id)    { this._addToList(KEYS.PURCHASED_SKINS, id, 'default'); }
    static getActiveSkin()     { return localStorage.getItem(KEYS.ACTIVE_SKIN) || 'default'; }
    static setActiveSkin(id)   { localStorage.setItem(KEYS.ACTIVE_SKIN, id); }

    // ── Arkaplan Skinleri ────────────────────────────────────

    static getPurchasedBgSkins() { return this._getList(KEYS.PURCHASED_BG_SKINS, 'bg_default'); }
    static purchaseBgSkin(id)    { this._addToList(KEYS.PURCHASED_BG_SKINS, id, 'bg_default'); }
    static getActiveBgSkin()     { return localStorage.getItem(KEYS.ACTIVE_BG_SKIN) || 'bg_default'; }
    static setActiveBgSkin(id)   { localStorage.setItem(KEYS.ACTIVE_BG_SKIN, id); }

    // ── Yüksek Skor ──────────────────────────────────────────

    static getHighScore() {
        return parseInt(localStorage.getItem(KEYS.HIGH_SCORE) || '0', 10);
    }

    /** Yeni rekorsa kaydeder, true döner */
    static saveHighScore(score) {
        if (score <= this.getHighScore()) return false;
        localStorage.setItem(KEYS.HIGH_SCORE, String(score));
        return true;
    }

    static resetAll() {
        Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    }
}
