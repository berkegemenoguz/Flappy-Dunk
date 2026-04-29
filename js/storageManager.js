// ========================================
// Flappy Dunk — StorageManager
// localStorage ile kalıcı veri yönetimi
// ========================================

const PREFIX = 'flappyDunk_';

const KEYS = {
    TOTAL_GOLD:      PREFIX + 'totalGold',
    PURCHASED_SKINS: PREFIX + 'purchasedSkins',
    ACTIVE_SKIN:     PREFIX + 'activeSkin',
    HIGH_SCORE:      PREFIX + 'highScore',
};

export class StorageManager {

    /** Toplam altın miktarını oku */
    static getTotalGold() {
        return parseInt(localStorage.getItem(KEYS.TOTAL_GOLD) || '0', 10);
    }

    /** Altın ekle (oyun sonu) */
    static addGold(amount) {
        const current = this.getTotalGold();
        localStorage.setItem(KEYS.TOTAL_GOLD, String(current + amount));
    }

    /** Altın harca (skin satın alma). Başarılı ise true döner. */
    static spendGold(amount) {
        const current = this.getTotalGold();
        if (current >= amount) {
            localStorage.setItem(KEYS.TOTAL_GOLD, String(current - amount));
            return true;
        }
        return false;
    }

    /** Satın alınan skin ID listesini oku */
    static getPurchasedSkins() {
        const data = localStorage.getItem(KEYS.PURCHASED_SKINS);
        return data ? JSON.parse(data) : ['default'];
    }

    /** Skin'i satın alınmış olarak kaydet */
    static purchaseSkin(skinId) {
        const skins = this.getPurchasedSkins();
        if (!skins.includes(skinId)) {
            skins.push(skinId);
            localStorage.setItem(KEYS.PURCHASED_SKINS, JSON.stringify(skins));
        }
    }

    /** Aktif skin ID'sini oku */
    static getActiveSkin() {
        return localStorage.getItem(KEYS.ACTIVE_SKIN) || 'default';
    }

    /** Aktif skin'i değiştir */
    static setActiveSkin(skinId) {
        localStorage.setItem(KEYS.ACTIVE_SKIN, skinId);
    }

    /** En yüksek skoru oku */
    static getHighScore() {
        return parseInt(localStorage.getItem(KEYS.HIGH_SCORE) || '0', 10);
    }

    /** En yüksek skoru güncelle (yeni skor daha yüksekse kaydeder) */
    static saveHighScore(score) {
        if (score > this.getHighScore()) {
            localStorage.setItem(KEYS.HIGH_SCORE, String(score));
            return true; // Yeni rekor!
        }
        return false;
    }

    /** Tüm verileri sıfırla (debug/test için) */
    static resetAll() {
        Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    }
}
