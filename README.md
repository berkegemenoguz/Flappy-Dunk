# Flappy Dunk

Tarayıcı tabanlı bir basketbol arcade oyunu. Topu zıplatarak potalardan geçirin, coin toplayın ve yeni görünümler açın.

## Oynanış


- **Tıklama / Boşluk tuşu** ile topu zıplatabilirsiniz
- Potaların açıklığından geçirerek puan kazanın
- Potayı kaçırmak veya tavana/zemine çarpmak = oyun sonu
- Her puan ile zorluk artar (hız ve spawn sıklığı)

## Özellikler

- Gerçekçi yerçekimi ve fizik sistemi
- Coin toplama ve mağaza sistemi
- 6 farklı top görünümü (🏀 ⚾ ⚽ 🏐 🏈 🏉)
- 3 farklı arka plan teması + varsayılan gradient
- Parçacık efektleri (coin toplama ve skor kazanma)
- localStorage ile ilerleme kaydı (skor, coin, açılan içerikler)
- Mobil ve masaüstü desteği (dokunma + fare + klavye)

## Teknolojiler

- HTML5 Canvas 2D
- Vanilla JavaScript (ES6 Modules)
- CSS3
- localStorage API

## Proje Yapısı

```
Flappy Dunk/
├── index.html
├── package.json
├── css/
│   └── style.css
├── js/
│   ├── main.js           # Oyun başlatma
│   ├── game.js            # Ana oyun motoru
│   ├── ball.js            # Top fiziği
│   ├── hoop.js            # Pota nesnesi
│   ├── coin.js            # Toplanabilir coin
│   ├── renderer.js        # Canvas UI çizimi
│   ├── constants.js       # Oyun sabitleri
│   ├── storageManager.js  # Kayıt sistemi
│   └── skinManager.js     # Görünüm yönetimi
└── images/
    ├── bg_theme1.png
    ├── bg_theme2.png
    └── bg_theme3.png
```

## Çalıştırma

```bash
npm install
npm start
```

Tarayıcıda `localhost` üzerinden açılır.

## Oyun Parametreleri

| Parametre | Değer |
|---|---|
| Yerçekimi | 1200 px/s² |
| Zıplama kuvveti | 500 px/s |
| Maks düşüş hızı | 600 px/s |
| Pota açıklığı | 95 px |
| Zorluk artışı | Puan başına %5 |
| Maks zorluk çarpanı | 2.5x |
