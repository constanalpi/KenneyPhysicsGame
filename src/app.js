
var MenuLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        var size = cc.winSize;

        // Fondo
        var spriteFondoTitulo= new cc.Sprite(res.menu_titulo_png);
        // Asigno posición central
        spriteFondoTitulo.setPosition(cc.p(size.width / 2, size.height / 2));
        // Lo escalo porque es más pequeño que la pantalla
        spriteFondoTitulo.setScale(size.height / spriteFondoTitulo.height);
        // Añado Sprite a la escena
        this.addChild(spriteFondoTitulo);

        /*MenuItemSprite para cada botón
        var menuBotonJugar = new cc.MenuItemSprite(
            new cc.Sprite(res.boton_jugar_png), // IMG estado normal
            new cc.Sprite(res.boton_jugar_png), // IMG estado pulsado
            this.pulsarBotonJugar, this);*/

        // MenuItem para el boton del nivel 1
        var botonNivel1 = new cc.MenuItemSprite(new cc.Sprite(res.boton_nivel_1),
                    new cc.Sprite(res.boton_nivel_1), this.pulsarBotonNivel1, this);
        botonNivel1.setScale(0.8);
        // MenuItem para el boton del nivel 2
        var botonNivel2 = new cc.MenuItemSprite(new cc.Sprite(res.boton_nivel_2),
                            new cc.Sprite(res.boton_nivel_2), this.pulsarBotonNivel2, this);
        botonNivel2.setScale(0.8);
        var botonNivel3 = new cc.MenuItemSprite(new cc.Sprite(res.boton_nivel_3),
                                    new cc.Sprite(res.boton_nivel_3), this.pulsarBotonNivel3, this);
        botonNivel3.setScale(0.8);
        // creo el menú pasándole los botones
        var menu = new cc.Menu();
        menu.addChild(botonNivel1);
        menu.addChild(botonNivel2);
        menu.addChild(botonNivel3);
        menu.alignItemsHorizontally();
        // Asigno posición central
        menu.setPosition(cc.p(size.width / 2, size.height * 0.25));
        // Añado el menú a la escena
        this.addChild(menu);


        return true;
    }, pulsarBotonNivel1 : function(){
           cc.director["nivel"] = 1;
           cc.director.runScene(new GameScene());
     }, pulsarBotonNivel2:function() {
           cc.director["nivel"] = 2;
           cc.director.runScene(new GameScene());
     }, pulsarBotonNivel3:function() {
            cc.director["nivel"] = 3;
            cc.director.runScene(new GameScene());
     }

});

var MenuScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MenuLayer();
        this.addChild(layer);
    }
});

