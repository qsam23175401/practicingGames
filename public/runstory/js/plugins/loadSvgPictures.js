/*
這樣子載入圖片
ImageManager.loadSvg("img/picture.svg", width, height).then(bitmap => {
  let sprite = new Sprite(bitmap);
  sprite.x = 200;
  sprite.y = 200;
  SceneManager._scene.addChild(sprite);
});

這樣子移除圖片
SceneManager._scene.removeChild(sprite);


或是
$gameScreen.showSvg(id, url, x, y, width, height);
$gameScreen.moveSvg(id, dx, dy, scaleX, scaleY, opacity);
$gameScreen.eraseSvg(id);
$gameScreen.showSvg(1, "img/pictures/text.svg", 100, 100, 300, 200);
$gameScreen.moveSvg(1, 50, 0, 1.5, 1.5, 128);
$gameScreen.eraseSvg(1);

*/


(function () {

    // ============================================================================
    // ImageManager: 處理圖片快取
    // ============================================================================

    ImageManager.SvgCache = {};
    //讀入
    ImageManager.loadSvg = function (url, width, height) {
        const key = `${url}_${width}_${height}`;
        if (this.SvgCache[key]) {
            return Promise.resolve(this.SvgCache[key]);
        }
        return fetch(url)
            .then(r => r.text())
            .then(svgText => {
                return new Promise(resolve => {
                    let svg = new Blob([svgText], { type: "image/svg+xml" });
                    let blobUrl = URL.createObjectURL(svg);
                    let img = new Image();
                    img.onload = () => {
                        const w = width || img.width;
                        const h = height || img.height;
                        let canvas = document.createElement("canvas");
                        canvas.width = w;
                        canvas.height = h;
                        let ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0, w, h);
                        let bitmap = new Bitmap(w, h);
                        bitmap.context.drawImage(canvas, 0, 0);
                        bitmap._setDirty();
                        this.SvgCache[key] = bitmap;
                        resolve(bitmap);
                        URL.revokeObjectURL(blobUrl);
                    };
                    img.src = blobUrl;
                });
            });
    };

    // ============================================================================
    // Game_Picture: 新增一個給 SVG 用的資料類別
    // ============================================================================
    function Game_SvgPicture() {
        this.initialize.apply(this, arguments);
    }

    Game_SvgPicture.prototype.initialize = function (id, data) {
        this._id = id;
        this._url = data.url;
        this._x = data.x;
        this._y = data.y;
        this._width = data.width;
        this._height = data.height;
        this._opacity = data.opacity;
        this._scaleX = 1.0;
        this._scaleY = 1.0;
    };

    Game_SvgPicture.prototype.update = function () {
        // 未來可用於移動等動畫效果
    };


    // ============================================================================
    // Game_Screen: 只管理圖片資料，不管理 Sprite
    // ============================================================================

    const _Game_Screen_initialize = Game_Screen.prototype.initialize;
    Game_Screen.prototype.initialize = function () {
        _Game_Screen_initialize.call(this);
        this.clearSvgPictures();
    };

    Game_Screen.prototype.clearSvgPictures = function () {
        this._svgPictures = {};
    };

    Game_Screen.prototype.svgPictures = function () {
        return this._svgPictures;
    };

    Game_Screen.prototype.svgPicture = function (id) {
        return this._svgPictures[id];
    };

    Game_Screen.prototype.showSvg = function (id, url, x, y, width = null, height = null, opacity = 255) {
        const data = { url, x, y, width, height, opacity };
        this._svgPictures[id] = new Game_SvgPicture(id, data);
    };

    Game_Screen.prototype.moveSvg = function (id, dx, dy, scaleX, scaleY, opacity) {
        const picture = this.svgPicture(id);
        if (picture) {
            picture._x += dx;
            picture._y += dy;
            picture._scaleX = scaleX;
            picture._scaleY = scaleY;
            if (opacity !== null) {
                picture._opacity = opacity.clamp(0, 255);
            }
        }
    };

    Game_Screen.prototype.eraseSvg = function (id) {
        if (this._svgPictures[id]) {
            delete this._svgPictures[id];
        }
    };

    // ============================================================================
    // Spriteset_SvgPictures: 根據 Game_Screen 資料建立 Sprite 的新類別
    // ============================================================================

    function Spriteset_SvgPictures() {
        this.initialize.apply(this, arguments);
    }

    Spriteset_SvgPictures.prototype = Object.create(Sprite.prototype);
    Spriteset_SvgPictures.prototype.constructor = Spriteset_SvgPictures;

    Spriteset_SvgPictures.prototype.initialize = function () {
        Sprite.prototype.initialize.call(this);
        this.z = 10; // 確保它在一般圖片之上
        this._pictureSprites = {};
        this.createPictures();
    };

    Spriteset_SvgPictures.prototype.createPictures = function () {
        const pictures = $gameScreen.svgPictures();
        for (const id in pictures) {
            this.createSprite(id, pictures[id]);
        }
    };

    Spriteset_SvgPictures.prototype.createSprite = function (id, picture) {
        if (this._pictureSprites[id]) {
            this.removeChild(this._pictureSprites[id]);
        }

        ImageManager.loadSvg(picture._url, picture._width, picture._height).then(bitmap => {
            if ($gameScreen.svgPicture(id)) { // 確保在非同步載入完成後，圖片還沒被刪除
                const sprite = new Sprite(bitmap);
                sprite.x = picture._x;
                sprite.y = picture._y;
                sprite.scale.x = picture._scaleX;
                sprite.scale.y = picture._scaleY;
                sprite.opacity = picture._opacity;
                this._pictureSprites[id] = sprite;
                this.addChild(sprite);
            }
        });
    };

    Spriteset_SvgPictures.prototype.update = function () {
        Sprite.prototype.update.call(this);
        this.updatePictures();
    };

    Spriteset_SvgPictures.prototype.updatePictures = function () {
        const gamePictures = $gameScreen.svgPictures();
        
        // 檢查新增或變更
        for (const id in gamePictures) {
            const gamePicture = gamePictures[id];
            const sprite = this._pictureSprites[id];
            if (!sprite) {
                this.createSprite(id, gamePicture);
            } else {
                this.updateSprite(sprite, gamePicture);
            }
        }

        // 檢查刪除
        for (const id in this._pictureSprites) {
            if (!gamePictures[id]) {
                this.removeChild(this._pictureSprites[id]);
                delete this._pictureSprites[id];
            }
        }
    };

    Spriteset_SvgPictures.prototype.updateSprite = function (sprite, picture) {
        sprite.x = picture._x;
        sprite.y = picture._y;
        sprite.scale.x = picture._scaleX;
        sprite.scale.y = picture._scaleY;
        sprite.opacity = picture._opacity;
    };


    // ============================================================================
    // Scene_Map: 將 Spriteset_SvgPictures 加入場景
    // ============================================================================

    const _Scene_Map_createSpriteset = Scene_Map.prototype.createSpriteset;
    Scene_Map.prototype.createSpriteset = function () {
        _Scene_Map_createSpriteset.call(this);
        this._svgPictureSpriteset = new Spriteset_SvgPictures();
        this._spriteset.addChild(this._svgPictureSpriteset);
    };

})();