// ========================================
// Flappy Dunk — Sabitler (Constants)
// Tüm oyun parametreleri tek dosyadan yönetilir.
// ========================================

// ----- Canvas -----
export const CANVAS_WIDTH  = 700;
export const CANVAS_HEIGHT = 640;

// ----- Fizik -----
export const GRAVITY        = 1200;   // px/s² — yerçekimi ivmesi
export const JUMP_FORCE     = 500;    // px/s  — zıplama hızı (yukarı)
export const MAX_FALL_SPEED = 600;    // px/s  — terminal düşüş hızı

// ----- Top (Ball) -----
export const BALL_RADIUS  = 14;
export const BALL_START_X = 90;
export const BALL_START_Y = CANVAS_HEIGHT / 2;

// ----- Pota (Hoop) -----
export const BASE_HOOP_SPEED    = 170;    // px/s — başlangıç pota hızı
export const BASE_SPAWN_INTERVAL = 3200;  // ms   — başlangıç spawn aralığı
export const HOOP_MIN_Y = 160;            // px   — pota merkezinin min Y'si
export const HOOP_MAX_Y = 420;            // px   — pota merkezinin max Y'si
export const RIM_WIDTH     = 90;          // px   — rim barlarının yatay genişliği
export const RIM_THICKNESS = 8;           // px   — rim barlarının dikey kalınlığı
export const HOOP_OPENING  = 95;          // px   — geçiş boşluğu (topun geçeceği)

// ----- Zorluk Artışı -----
export const DIFFICULTY_SCALE_FACTOR    = 0.05;  // skor başına çarpan artışı
export const MAX_DIFFICULTY_MULTIPLIER  = 2.5;   // maksimum zorluk çarpanı
export const MIN_SPAWN_INTERVAL         = 1000;  // ms — minimum spawn aralığı

// ----- Altın (Coin) -----
export const COIN_RADIUS       = 11;
export const COIN_SPAWN_CHANCE = 0.70;  // %70 olasılıkla pota yanında altın
export const COIN_OFFSET_Y     = 80;    // px — potadan dikey uzaklık (ABOVE/BELOW mod)
export const COIN_MIN_Y = 40;
export const COIN_MAX_Y = CANVAS_HEIGHT - 40;

// ----- Skin Tanımları -----
export const SKINS = [
    { id: 'default',    name: 'Basketball',     price: 0   },
    { id: 'tennis',     name: 'Tennis Ball',    price: 50  },
    { id: 'football',   name: 'Soccer Ball',    price: 100 },
    { id: 'volleyball', name: 'Volleyball',     price: 150 },
    { id: 'bowling',    name: 'Bowling Ball',   price: 250 },
    { id: 'galaxy',     name: 'Galaxy',         price: 500 },
];

// ----- Renkler -----
export const COLORS = {
    // Arka plan gradyanı
    BG_TOP:    '#0f0c29',
    BG_MID:    '#302b63',
    BG_BOTTOM: '#24243e',

    // Rim
    RIM:       '#e63946',
    RIM_SHINE: '#ff6b6b',

    // Ağ (net)
    NET: 'rgba(255,255,255,0.40)',

    // Altın
    COIN:       '#ffd700',
    COIN_DARK:  '#cc9900',
    COIN_SHINE: '#fff8dc',

    // Metin
    TEXT:        '#ffffff',
    TEXT_SHADOW: 'rgba(0,0,0,0.5)',

    // UI
    OVERLAY:      'rgba(0,0,0,0.72)',
    BUTTON:       '#e63946',
    BUTTON_HOVER: '#ff6b6b',
    BUTTON_TEXT:  '#ffffff',
    BUTTON_GREEN: '#4caf50',
    BUTTON_GREEN_HOVER: '#66bb6a',
};

// ----- Oyun Durumları (State Enum) -----
export const STATES = {
    MENU:      'MENU',
    SHOP:      'SHOP',
    READY:     'READY',
    PLAYING:   'PLAYING',
    GAME_OVER: 'GAME_OVER',
};
