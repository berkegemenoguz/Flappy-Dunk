// ========================================
// Flappy Dunk — Game Engine
// Oyun döngüsü, state machine, çarpışma,
// spawning, zorluk artışı, input yönetimi.
// ========================================

import {
    CANVAS_WIDTH, CANVAS_HEIGHT, STATES, COLORS,
    BASE_HOOP_SPEED, BASE_SPAWN_INTERVAL,
    HOOP_MIN_Y, HOOP_MAX_Y,
    DIFFICULTY_SCALE_FACTOR, MAX_DIFFICULTY_MULTIPLIER, MIN_SPAWN_INTERVAL,
    COIN_MIN_Y, COIN_MAX_Y,
    RIM_WIDTH, SKINS,
} from './constants.js';

import { Ball } from './ball.js';
import { Hoop } from './hoop.js';
import { Coin } from './coin.js';
import { Renderer } from './renderer.js';
import { StorageManager } from './storageManager.js';
import { SkinManager } from './skinManager.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // ── Oyun nesneleri ───────────────────────────────────
        this.ball = new Ball();
        this.hoops = [];
        this.coins = [];

        // ── Oyun durumu ──────────────────────────────────────
        this.state = STATES.MENU;
        this.score = 0;
        this.sessionGold = 0;

        // ── Zamanlama ────────────────────────────────────────
        this.lastTimestamp = 0;
        this.spawnTimer = 0;
        this.animationId = null;

        // ── Parçacık sistemi (hafif) ─────────────────────────
        this.particles = [];

        // ── Arka plan yıldızları (deterministik) ─────────────
        this.bgStars = this._generateStars(60);

        // ── Buton tanımları ──────────────────────────────────
        this.menuButtons = [];
        this.gameOverButtons = [];
        this.shopBackButton = null;
        this.skinItems = [];   // Mağaza skin tıklama alanları

        this._setupButtons();
        this._setupInput();

        // bind
        this._gameLoop = this._gameLoop.bind(this);
    }

    // ================================================================
    //  BAŞLATMA
    // ================================================================

    init() {
        this.state = STATES.MENU;
        this.lastTimestamp = performance.now();
        this.animationId = requestAnimationFrame(this._gameLoop);
    }

    // ================================================================
    //  OYUN DÖNGÜSÜ
    // ================================================================

    _gameLoop(timestamp) {
        // DeltaTime — çerçeve atlamalarına karşı 50ms ile sınırla
        const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.05);
        this.lastTimestamp = timestamp;

        this._update(dt);
        this._render();

        this.animationId = requestAnimationFrame(this._gameLoop);
    }

    // ── Güncelleme ───────────────────────────────────────────

    _update(dt) {
        // Parçacıkları her zaman güncelle (her state'de)
        this._updateParticles(dt);

        if (this.state !== STATES.PLAYING) return;

        // 1. Top fiziği
        this.ball.update(dt);

        // 2. Pota ve altın hareketi
        const speed = this._getCurrentSpeed();
        for (const h of this.hoops) { h.speed = speed; h.update(dt); }
        for (const c of this.coins) { c.speed = speed; c.update(dt); }

        // 3. Spawn zamanlayıcı
        this.spawnTimer -= dt * 1000;
        if (this.spawnTimer <= 0) {
            this._spawnHoop();
            this.spawnTimer = this._getCurrentSpawnInterval();
        }

        // 4. Sınır kontrolü (tavan/zemin)
        if (this._checkBoundaries()) return;

        // 5. Pota çarpışma + geçiş kontrolü
        if (this._checkHoopCollisions()) return;

        // 6. Altın toplama
        this._checkCoinCollisions();

        // 7. Kaçırılan pota kontrolü
        if (this._checkMissedHoops()) return;

        // 8. Temizlik — ekrandan çıkan nesneler
        this.hoops = this.hoops.filter(h => !h.isOffScreen());
        this.coins = this.coins.filter(c => !c.isOffScreen() && !c.collected);
    }

    // ── Render ───────────────────────────────────────────────

    _render() {
        const ctx = this.ctx;

        // Arka plan (her state'de)
        Renderer.drawBackground(ctx, this.bgStars);

        switch (this.state) {
            case STATES.MENU:
                Renderer.drawMainMenu(ctx, StorageManager.getTotalGold(), this.menuButtons);
                break;

            case STATES.SHOP:
                Renderer.drawShop(
                    ctx,
                    StorageManager.getTotalGold(),
                    StorageManager.getPurchasedSkins(),
                    StorageManager.getActiveSkin(),
                    this.shopBackButton,
                    this.skinItems
                );
                break;

            case STATES.READY:
                this.ball.draw(ctx, SkinManager.getActiveSkinId());
                Renderer.drawScore(ctx, 0);
                Renderer.drawInstructions(ctx);
                break;

            case STATES.PLAYING:
                // Potalar → altınlar → parçacıklar → top → UI
                for (const h of this.hoops) h.draw(ctx);
                for (const c of this.coins) c.draw(ctx);
                Renderer.drawParticles(ctx, this.particles);
                this.ball.draw(ctx, SkinManager.getActiveSkinId());
                Renderer.drawScore(ctx, this.score);
                Renderer.drawSessionGold(ctx, this.sessionGold);
                Renderer.drawHighScore(ctx, StorageManager.getHighScore());
                break;

            case STATES.GAME_OVER:
                // Donmuş oyun sahnesini çiz
                for (const h of this.hoops) h.draw(ctx);
                for (const c of this.coins) c.draw(ctx);
                Renderer.drawParticles(ctx, this.particles);
                this.ball.draw(ctx, SkinManager.getActiveSkinId());
                // Overlay
                Renderer.drawGameOver(ctx, this.score, this.sessionGold, StorageManager.getHighScore(), this.isNewRecord, this.gameOverButtons);
                break;
        }
    }

    // ================================================================
    //  ÇARPIŞMA KONTROLLERI
    // ================================================================

    /** Tavan/zemin sınır kontrolü → true = game over tetiklendi */
    _checkBoundaries() {
        const b = this.ball;
        if (b.y - b.radius <= 0 || b.y + b.radius >= CANVAS_HEIGHT) {
            this._gameOver();
            return true;
        }
        return false;
    }

    /** Pota rim çarpışması (sekme) + geçiş algılama */
    _checkHoopCollisions() {
        const ball = this.ball.getBounds();

        for (const hoop of this.hoops) {
            // ── Bumper sekme mekaniği ─────────────────────────────────────
            const bumpers = hoop.getBumperBounds();
            let bumpedThisFrame = false;

            for (const bumper of [bumpers.left, bumpers.right]) {
                if (this._circleRect(ball, bumper)) {
                    bumpedThisFrame = true;

                    // Topu pota merkezine yönlendir
                    const dirY = hoop.y - this.ball.y;
                    this.ball.velocity = Math.sign(dirY) * 120;

                    // Topu bumper dışına it
                    if (this.ball.y < bumper.y + bumper.height / 2) {
                        this.ball.y = bumper.y - this.ball.radius - 1;
                    } else {
                        this.ball.y = bumper.y + bumper.height + this.ball.radius + 1;
                    }

                    this._spawnParticles(
                        bumper.x + bumper.width / 2,
                        bumper.y + bumper.height / 2,
                        6, ['#ff6b6b', '#e63946', '#ffffff']
                    );
                    break;
                }
            }

            // ── Skor (geçiş) algılama ──────────────────────────────────────
            //
            // Yaklaşım: top pota X aralığındayken gördüğü en küçük Y (minYWhileInX)
            // kaydedilir. "minY < zone.bottom" = top rim barının üstünde bir yerde
            // bulunmuştur → geçiş için geçerli pozisyon.
            // Ardından top.y > zone.bottom olduğunda SKOR.
            //
            // Sağ kenar frame-boundary: inX false'a dönerken de aynı kontrol yapılır.
            // Bumper sonrası: top zone içinde repositioned → geçerli giriş olarak işaretle.
            if (!hoop.scored) {
                const zone = hoop.getPassThroughZone();
                const inX = this.ball.x + this.ball.radius > zone.left &&
                    this.ball.x - this.ball.radius < zone.right;

                if (inX) {
                    // minYWhileInX: en küçük Y = topun X aralığındaki en yüksek noktası
                    if (hoop.minYWhileInX === undefined) {
                        hoop.minYWhileInX = this.ball.y;
                    } else {
                        hoop.minYWhileInX = Math.min(hoop.minYWhileInX, this.ball.y);
                    }

                    // Bumper çarpışması → geçerli giriş olarak zorla işaretle
                    if (bumpedThisFrame) {
                        hoop.minYWhileInX = zone.top - 1;
                    }

                    // Skor: rim üstündeydi (minY < zone.bottom) VE şimdi rim altında
                    if (hoop.minYWhileInX < zone.bottom && this.ball.y > zone.bottom) {
                        hoop.scored = true;
                        this.score++;
                        this._spawnParticles(hoop.x, hoop.y, 12, ['#4caf50', '#81c784', '#ffffff']);
                    }

                } else if (hoop.minYWhileInX !== undefined) {
                    // Sağ kenar frame-boundary: inX bu frame false'a düştü,
                    // ama top tam bu anda zone.bottom'ı geçmiş olabilir.
                    if (hoop.minYWhileInX < zone.bottom && this.ball.y > zone.bottom) {
                        hoop.scored = true;
                        this.score++;
                        this._spawnParticles(hoop.x, hoop.y, 12, ['#4caf50', '#81c784', '#ffffff']);
                    }
                    hoop.minYWhileInX = undefined;
                }
            }
        }
        return false;
    }

    /** Altın toplama (Daire vs Daire) */
    _checkCoinCollisions() {
        const ball = this.ball.getBounds();
        for (const coin of this.coins) {
            if (coin.collected) continue;
            if (this._circleCircle(ball, coin.getBounds())) {
                coin.collected = true;
                this.sessionGold++;
                // Altın parçacık efekti
                this._spawnParticles(coin.x, coin.y, 8, ['#ffd700', '#fff8dc', '#ffeb3b']);
            }
        }
    }

    /** Kaçırılan pota kontrolü → true = game over */
    _checkMissedHoops() {
        for (const hoop of this.hoops) {
            if (hoop.isOffScreen() && !hoop.scored) {
                this._gameOver();
                return true;
            }
        }
        return false;
    }

    // ── Çarpışma Yardımcıları ────────────────────────────────

    /** Daire-Dikdörtgen AABB çarpışma kontrolü */
    _circleRect(circle, rect) {
        const cx = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
        const cy = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
        const dx = circle.x - cx;
        const dy = circle.y - cy;
        return (dx * dx + dy * dy) < (circle.radius * circle.radius);
    }

    /** Daire-Daire çarpışma kontrolü */
    _circleCircle(a, b) {
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const rSum = a.radius + b.radius;
        return (dx * dx + dy * dy) < (rSum * rSum);
    }

    // ================================================================
    //  SPAWNING
    // ================================================================

    /** Yeni pota (ve zorunlu + opsiyonel altın) spawn et */
    _spawnHoop() {
        const speed = this._getCurrentSpeed();
        const y = HOOP_MIN_Y + Math.random() * (HOOP_MAX_Y - HOOP_MIN_Y);
        const hoop = new Hoop(CANVAS_WIDTH + RIM_WIDTH, y, speed);
        this.hoops.push(hoop);

        // Her potanın girişinde KESİNLİKLE 1 altın spawn et
        this._spawnEntranceCoin(hoop);

        // %40 olasılıkla ekstra rastgele altın spawn et
        if (Math.random() < 0.40) {
            this._spawnRandomCoin(hoop.speed);
        }
    }

    /**
     * Potanın girişine (sol tarafına) altın yerleştir.
     * Topun geçeceği açıklığın tam önüne konumlanır.
     */
    _spawnEntranceCoin(hoop) {
        // Açıklığın dikey merkezi = hoop.y (HOOP_OPENING'in merkezi)
        // X: potanın sol kenarından biraz önce (topu çeksin)
        const entranceX = hoop.x - RIM_WIDTH / 2 - 30;
        const entranceY = hoop.y; // açıklık merkezi

        const coinY = Math.max(COIN_MIN_Y, Math.min(COIN_MAX_Y, entranceY));
        const coin = new Coin(entranceX, coinY, hoop.speed);
        this.coins.push(coin);
    }

    /**
     * Ekstra rastgele altın — potayla ilgisiz, serbest konumda.
     */
    _spawnRandomCoin(speed) {
        const coinX = CANVAS_WIDTH + 20 + Math.random() * 120; // biraz dağıtılmış X
        const coinY = COIN_MIN_Y + Math.random() * (COIN_MAX_Y - COIN_MIN_Y);
        const coin = new Coin(coinX, coinY, speed);
        this.coins.push(coin);
    }

    // ================================================================
    //  ZORLUK SİSTEMİ
    // ================================================================

    getDifficultyMultiplier() {
        return Math.min(
            1 + this.score * DIFFICULTY_SCALE_FACTOR,
            MAX_DIFFICULTY_MULTIPLIER
        );
    }

    _getCurrentSpeed() {
        return BASE_HOOP_SPEED * this.getDifficultyMultiplier();
    }

    _getCurrentSpawnInterval() {
        return Math.max(
            BASE_SPAWN_INTERVAL / this.getDifficultyMultiplier(),
            MIN_SPAWN_INTERVAL
        );
    }

    // ================================================================
    //  PARÇACIK SİSTEMİ (Hafif)
    // ================================================================

    _spawnParticles(x, y, count, colors) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 60 + Math.random() * 120;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1.5 + Math.random() * 2.5,
                alpha: 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 0.4 + Math.random() * 0.4,
                age: 0,
            });
        }
    }

    _updateParticles(dt) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.age += dt;
            if (p.age >= p.life) {
                this.particles.splice(i, 1);
                continue;
            }
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 200 * dt;     // mini yerçekimi
            p.alpha = 1 - (p.age / p.life);
        }
    }

    // ================================================================
    //  STATE GEÇİŞLERİ
    // ================================================================

    _startGame() {
        this._resetGame();
        this.state = STATES.READY;
    }

    _gameOver() {
        this.state = STATES.GAME_OVER;
        StorageManager.addGold(this.sessionGold);
        this.isNewRecord = StorageManager.saveHighScore(this.score);
    }

    _restart() {
        this._resetGame();
        this.state = STATES.READY;
    }

    _showMainMenu() {
        this._resetGame();
        this.state = STATES.MENU;
    }

    _showShop() {
        this.state = STATES.SHOP;
    }

    _resetGame() {
        this.ball.reset();
        this.hoops = [];
        this.coins = [];
        this.particles = [];
        this.score = 0;
        this.sessionGold = 0;
        this.isNewRecord = false;
        this.spawnTimer = 1500;  // İlk pota 1.5 sn sonra
    }

    // ================================================================
    //  BUTON SİSTEMİ
    // ================================================================

    _setupButtons() {
        const btnW = 210;
        const btnH = 48;
        const cx = (CANVAS_WIDTH - btnW) / 2;

        // ── Ana Menü butonları ────────────────────────────────
        this.menuButtons = [
            {
                x: cx, y: CANVAS_HEIGHT * 0.48, width: btnW, height: btnH,
                text: '▶  PLAY', color: COLORS.BUTTON,
                hoverColor: COLORS.BUTTON_HOVER,
                action: () => this._startGame(),
                hovered: false, disabled: false,
            },
            {
                x: cx, y: CANVAS_HEIGHT * 0.48 + btnH + 14, width: btnW, height: btnH,
                text: '🛒  SHOP', color: '#5c6bc0',
                hoverColor: '#7986cb',
                action: () => this._showShop(),
                hovered: false, disabled: false,
            },
        ];

        // ── Game Over butonları ──────────────────────────────
        this.gameOverButtons = [
            {
                x: cx, y: CANVAS_HEIGHT * 0.54, width: btnW, height: btnH,
                text: '🔄  Restart', color: COLORS.BUTTON,
                hoverColor: COLORS.BUTTON_HOVER,
                action: () => this._restart(),
                hovered: false, disabled: false,
            },
            {
                x: cx, y: CANVAS_HEIGHT * 0.54 + btnH + 14, width: btnW, height: btnH,
                text: '🏠  Main Menu', color: '#5c6bc0',
                hoverColor: '#7986cb',
                action: () => this._showMainMenu(),
                hovered: false, disabled: false,
            },
        ];

        // ── Mağaza geri butonu ───────────────────────────────
        this.shopBackButton = {
            x: 12, y: 18, width: 80, height: 36,
            text: '← BACK', color: '#455a64',
            hoverColor: '#607d8b',
            action: () => this._showMainMenu(),
            hovered: false, disabled: false,
        };

        // ── Skin tıklama alanları (renderer tarafından güncellenir) ──
        this.skinItems = SKINS.map(() => ({
            x: 0, y: 0, width: 0, height: 0,
        }));
    }

    // ================================================================
    //  INPUT YÖNETİMİ
    // ================================================================

    _setupInput() {
        // ── Tıklama ──────────────────────────────────────────
        this.canvas.addEventListener('click', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            this._handleClick(x, y);
        });

        // ── Dokunma (mobil) ──────────────────────────────────
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (touch.clientX - rect.left) * scaleX;
            const y = (touch.clientY - rect.top) * scaleY;
            this._handleClick(x, y);
        }, { passive: false });

        // ── Klavye ───────────────────────────────────────────
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.key === ' ') {
                e.preventDefault();
                this._handleAction();
            }
        });

        // ── Mouse hover (butonlar) ───────────────────────────
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            this._handleHover(x, y);
        });
    }

    /** Tıklama yönlendirici */
    _handleClick(x, y) {
        switch (this.state) {
            case STATES.MENU:
                for (const btn of this.menuButtons) {
                    if (this._isInside(x, y, btn)) {
                        btn.action();
                        return;
                    }
                }
                break;

            case STATES.SHOP:
                // Geri butonu
                if (this._isInside(x, y, this.shopBackButton)) {
                    this.shopBackButton.action();
                    return;
                }
                // Skin tıklamaları
                this._handleShopClick(x, y);
                break;

            case STATES.READY:
                this.state = STATES.PLAYING;
                this.ball.jump();
                break;

            case STATES.PLAYING:
                this.ball.jump();
                break;

            case STATES.GAME_OVER:
                for (const btn of this.gameOverButtons) {
                    if (this._isInside(x, y, btn)) {
                        btn.action();
                        return;
                    }
                }
                break;
        }
    }

    /** Klavye aksiyon kısayolu (Space) */
    _handleAction() {
        switch (this.state) {
            case STATES.MENU:
                this._startGame();
                break;
            case STATES.READY:
                this.state = STATES.PLAYING;
                this.ball.jump();
                break;
            case STATES.PLAYING:
                this.ball.jump();
                break;
            case STATES.GAME_OVER:
                this._restart();
                break;
        }
    }

    /** Mağaza skin tıklama işlemi */
    _handleShopClick(x, y) {
        const purchasedSkins = StorageManager.getPurchasedSkins();
        const activeSkin = StorageManager.getActiveSkin();

        for (let i = 0; i < SKINS.length; i++) {
            const area = this.skinItems[i];
            if (!area || area.width === 0) continue;
            if (this._isInside(x, y, area)) {
                const skin = SKINS[i];
                const owned = purchasedSkins.includes(skin.id);
                const active = activeSkin === skin.id;

                if (active) {
                    // Zaten seçili — hiçbir şey yapma
                    return;
                }
                if (owned) {
                    // Satın alınmış — seç
                    StorageManager.setActiveSkin(skin.id);
                    return;
                }
                // Satın alınmamış — satın almayı dene
                if (StorageManager.spendGold(skin.price)) {
                    StorageManager.purchaseSkin(skin.id);
                    StorageManager.setActiveSkin(skin.id);
                    // Satın alma parçacık efekti
                    this._spawnParticles(
                        area.x + area.width / 2,
                        area.y + area.height / 2,
                        15, ['#ffd700', '#ffeb3b', '#ffffff']
                    );
                }
                return;
            }
        }
    }

    /** Hover efekti güncelle */
    _handleHover(x, y) {
        const allButtons = this._getCurrentButtons();
        let cursorPointer = false;
        for (const btn of allButtons) {
            btn.hovered = this._isInside(x, y, btn) && !btn.disabled;
            if (btn.hovered) cursorPointer = true;
        }

        // Mağazadayken skin satırları için de pointer
        if (this.state === STATES.SHOP) {
            for (const area of this.skinItems) {
                if (area.width > 0 && this._isInside(x, y, area)) {
                    cursorPointer = true;
                }
            }
        }

        this.canvas.style.cursor = cursorPointer ? 'pointer' : 'default';
    }

    /** Aktif state'deki butonları döndür */
    _getCurrentButtons() {
        switch (this.state) {
            case STATES.MENU: return this.menuButtons;
            case STATES.GAME_OVER: return this.gameOverButtons;
            case STATES.SHOP: return [this.shopBackButton];
            default: return [];
        }
    }

    /** Nokta dikdörtgen içinde mi? */
    _isInside(px, py, rect) {
        return px >= rect.x && px <= rect.x + rect.width &&
            py >= rect.y && py <= rect.y + rect.height;
    }

    // ================================================================
    //  YARDIMCILAR
    // ================================================================

    /** Arka plan yıldızları oluştur (deterministik) */
    _generateStars(count) {
        const stars = [];
        // Sabit seed yaklaşımı — her seferinde aynı yıldızlar
        let seed = 42;
        const rng = () => {
            seed = (seed * 16807 + 0) % 2147483647;
            return seed / 2147483647;
        };
        for (let i = 0; i < count; i++) {
            stars.push({
                x: rng() * CANVAS_WIDTH,
                y: rng() * CANVAS_HEIGHT,
                r: 0.4 + rng() * 1.2,
            });
        }
        return stars;
    }
}
