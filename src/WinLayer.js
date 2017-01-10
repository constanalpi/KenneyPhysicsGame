var WinLayer = cc.LayerColor.extend({
    ctor:function (nivelActual) {
        this._super();
        this.init();
    },
    init:function () {
        this._super(cc.color(0, 0, 0, 180));

        var winSize = cc.director.getWinSize();

        var botonSiguienteNivel = new cc.MenuItemSprite(
            new cc.Sprite(res.boton_siguiente),
            new cc.Sprite(res.boton_siguiente),
            this.pulsarSiguiente, this);

        var menu = new cc.Menu(botonSiguienteNivel);
        menu.setPosition(winSize.width / 2, winSize.height / 2);

        this.addChild(menu);
    },
    pulsarSiguiente:function (sender) {
        // Volver a ejecutar la escena Prinicpal
        cc.director["nivel"]++;
        cc.director.runScene(new GameScene());
    }
});
