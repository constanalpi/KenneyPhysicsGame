var formaRectanguloTumbado = 1;
var formaCuadrado = 2;
var formaRectanguloDePie = 3;

var estadoIntacto = 0;
var estadoMedioRoto = 1;
var estadoRoto = 2;
var estadoMedioRoto = 3;
var estadoDestruido = 4;

var Objeto = cc.Class.extend({
    gameLayer:null,
    sprite:null,
    shape:null,
    tipo:null,
    forma:null,
    vida:null,
    eliminado:false,
    estado:null,
    debrisGlassList:[],
    debrisStoneList:[],
    debrisWoodList:[],
    ctor:function(gameLayer, posicion, tipo, forma) {

        this.forma = forma;
        this.tipo = tipo;
        this.vida = 1200;
        this.gameLayer = gameLayer;
        this.estado = estadoIntacto;

        this.debrisGlassList = [res.debrisGlass_1, res.debrisGlass_2, res.debrisGlass_3];
        this.debrisStoneList = [res.debrisStone_1, res.debrisStone_2, res.debrisStone_3];
        this.debrisWoodList = [res.debrisWood_1, res.debrisWood_2, res.debrisWood_3];

        // Crear Sprite - Cuerpo y forma
        this.cargarSprite();
        this.sprite.setScaleX(0.5);
        this.sprite.setScaleY(0.5);
        this.cargarBody();
        this.body.setPos(posicion);
        this.sprite.setBody(this.body);
        this.gameLayer.space.addBody(this.body);
        this.shape = new cp.BoxShape(this.body,
                this.sprite.getContentSize().width * this.sprite.getScaleX(),
                this.sprite.getContentSize().height * this.sprite.getScaleY());
        this.shape["object"] = this;
        this.shape.setFriction(1);
        this.shape.setCollisionType(tipoObjeto);
        // forma dinamica
        this.gameLayer.space.addShape(this.shape);
        // añadir sprite a la capa
        this.gameLayer.addChild(this.sprite, 10);

    }, cargarSprite:function() {
        switch(this.tipo) {
            case tipoCristal:
                switch(this.forma) {
                    case formaRectanguloTumbado:
                        this.sprite = new cc.PhysicsSprite(res.glass11);
                        break;
                    case formaCuadrado:
                        this.sprite = new cc.PhysicsSprite(res.glass21);
                        break;
                    case formaRectanguloDePie:
                        this.sprite = new cc.PhysicsSprite(res.glass31);
                        break;
                }
                break;
            case tipoMadera:
                switch(this.forma) {
                    case formaRectanguloTumbado:
                        this.sprite = new cc.PhysicsSprite(res.wood11);
                        break;
                    case formaCuadrado:
                        this.sprite = new cc.PhysicsSprite(res.wood21);
                        break;
                    case formaRectanguloDePie:
                        this.sprite = new cc.PhysicsSprite(res.wood31);
                        break;
                }
                break;
            case tipoPiedra:
                switch(this.forma) {
                    case formaRectanguloTumbado:
                        this.sprite = new cc.PhysicsSprite(res.stone11);
                        break;
                    case formaCuadrado:
                        this.sprite = new cc.PhysicsSprite(res.stone21);
                        break;
                    case formaRectanguloDePie:
                        this.sprite = new cc.PhysicsSprite(res.stone31);
                        break;
                }
                break;
        }
    }, cargarBody:function() {
        switch(this.tipo) {
            case tipoCristal:
                this.body = new cp.Body(1, cp.momentForBox(1,
                            this.sprite.getContentSize().width,
                            this.sprite.getContentSize().height));
                break;
            case tipoMadera:
                this.body = new cp.Body(1.5, cp.momentForBox(1,
                            this.sprite.getContentSize().width,
                            this.sprite.getContentSize().height));
                break;
            case tipoPiedra:
                this.body = new cp.Body(2, cp.momentForBox(1,
                            this.sprite.getContentSize().width,
                            this.sprite.getContentSize().height));
                break;
        }
    }, colision:function(fuerza) {
        var estadoAntesDelGolpe = this.estado;
        if (Math.abs(fuerza) < 150) return;
        switch(this.tipo) {
            case tipoCristal:
                this.vida -= fuerza * 1.5;
                break;
            case tipoMadera:
                this.vida -= fuerza * 1;
                break;
            case tipoPiedra:
                this.vida -= fuerza * .5;
                break;
        }
        this.actualizarEstado();
        this.generarDebris(estadoAntesDelGolpe);
    }, generarDebris:function(estadoAntesDelGolpe) {
        if (this.estado != estadoAntesDelGolpe) {
            for (var i = 0; i <= this.estado; i++)
                this.generarDebri();
        }
    }, generarDebri:function() {
        sprite = new cc.PhysicsSprite(this.obtenerDebris());
        sprite.setScaleX(.25);
        sprite.setScaleY(.25);
        body = new cp.Body(1, cp.momentForBox(1,
                           sprite.width * sprite.getScaleX(),
                           sprite.height * sprite.getScaleY()));
        body.applyImpulse(cp.v(200.5 * (Math.random() - 0.5), 200.5 * (Math.random() - 0.5)), cp.v(0, 0));
        sprite.setBody(body);
        body.setPos(this.sprite.getPosition());
        this.gameLayer.spritesDebris.push(sprite);
    }, obtenerDebris:function() {
        switch(this.tipo) {
            case tipoCristal:
                return this.debrisGlassList[Math.floor(Math.random() * 3)];
            case tipoMadera:
                return this.debrisWoodList[Math.floor(Math.random() * 3)];
            case tipoPiedra:
                return this.debrisStoneList[Math.floor(Math.random() * 3)];
        }
    }, actualizarEstado:function() {
        if (this.vida > 800)
            this.cargarEstadoIntacto();
        else if (this.vida > 400)
            this.cargarEstadoMedioRoto();
        else if (this.vida > 0)
            this.cargarEstadoRoto();
        else
            this.destruido();
    }, cargarEstadoIntacto:function() {
        this.estado = estadoIntacto;
        var newSprite;
        switch(this.tipo) {
            case tipoCristal:
                switch(this.forma) {
                    case formaRectanguloTumbado:
                        newSprite = new cc.PhysicsSprite(res.glass11);
                        break;
                    case formaCuadrado:
                        newSprite = new cc.PhysicsSprite(res.glass21);
                        break;
                    case formaRectanguloDePie:
                        newSprite = new cc.PhysicsSprite(res.glass31);
                        break;
                }
                break;
            case tipoMadera:
                switch(this.forma) {
                    case formaRectanguloTumbado:
                        newSprite = new cc.PhysicsSprite(res.wood11);
                        break;
                    case formaCuadrado:
                        newSprite = new cc.PhysicsSprite(res.wood21);
                        break;
                    case formaRectanguloDePie:
                        newSprite = new cc.PhysicsSprite(res.wood31);
                        break;
                }
                break;
            case tipoPiedra:
                switch(this.forma) {
                    case formaRectanguloTumbado:
                        newSprite = new cc.PhysicsSprite(res.stone11);
                        break;
                    case formaCuadrado:
                        newSprite = new cc.PhysicsSprite(res.stone21);
                        break;
                    case formaRectanguloDePie:
                        newSprite = new cc.PhysicsSprite(res.stone31);
                        break;
                }
                break;
        }
        this.cambiarSprite(newSprite);
    }, cargarEstadoMedioRoto:function() {
        this.estado = estadoMedioRoto;
        var newSprite;
        switch(this.tipo) {
            case tipoCristal:
                switch(this.forma) {
                    case formaRectanguloTumbado:
                        newSprite = new cc.PhysicsSprite(res.glass12);
                        break;
                    case formaCuadrado:
                        newSprite = new cc.PhysicsSprite(res.glass22);
                        break;
                    case formaRectanguloDePie:
                        newSprite = new cc.PhysicsSprite(res.glass32);
                        break;
                }
                break;
            case tipoMadera:
                switch(this.forma) {
                    case formaRectanguloTumbado:
                        newSprite = new cc.PhysicsSprite(res.wood12);
                        break;
                    case formaCuadrado:
                        newSprite = new cc.PhysicsSprite(res.wood22);
                        break;
                    case formaRectanguloDePie:
                        newSprite = new cc.PhysicsSprite(res.wood32);
                        break;
                }
                break;
            case tipoPiedra:
                switch(this.forma) {
                    case formaRectanguloTumbado:
                        newSprite = new cc.PhysicsSprite(res.stone12);
                        break;
                    case formaCuadrado:
                        newSprite = new cc.PhysicsSprite(res.stone22);
                        break;
                    case formaRectanguloDePie:
                        newSprite = new cc.PhysicsSprite(res.stone32);
                        break;
                }
                break;
        }
        this.cambiarSprite(newSprite);
    }, cambiarSprite:function(newSprite) {
        newSprite.setScaleX(0.5);
        newSprite.setScaleY(0.5);
        newSprite.setBody(this.sprite.body);
        this.gameLayer.removeChild(this.sprite);
        this.gameLayer.addChild(newSprite);
        this.sprite = newSprite;
    }, cargarEstadoRoto:function() {
        this.estado = estadoRoto;
        var newSprite;
        switch(this.tipo) {
            case tipoCristal:
                switch(this.forma) {
                    case formaRectanguloTumbado:
                        newSprite = new cc.PhysicsSprite(res.glass13);
                        break;
                    case formaCuadrado:
                        newSprite = new cc.PhysicsSprite(res.glass23);
                        break;
                    case formaRectanguloDePie:
                        newSprite = new cc.PhysicsSprite(res.glass33);
                        break;
                }
                break;
            case tipoMadera:
                switch(this.forma) {
                    case formaRectanguloTumbado:
                        newSprite = new cc.PhysicsSprite(res.wood13);
                        break;
                    case formaCuadrado:
                        newSprite = new cc.PhysicsSprite(res.wood23);
                        break;
                    case formaRectanguloDePie:
                        newSprite = new cc.PhysicsSprite(res.wood33);
                        break;
                }
                break;
            case tipoPiedra:
                switch(this.forma) {
                    case formaRectanguloTumbado:
                        newSprite = new cc.PhysicsSprite(res.stone13);
                        break;
                    case formaCuadrado:
                        newSprite = new cc.PhysicsSprite(res.stone23);
                        break;
                    case formaRectanguloDePie:
                        newSprite = new cc.PhysicsSprite(res.stone33);
                        break;
                }
                break;
        }
        this.cambiarSprite(newSprite);
    }, destruido:function() {
        this.estado = estadoDestruido;
        if (!this.eliminado) {
            this.reproducirSonidoRotura();
            this.gameLayer.eliminarObjeto(this);
            this.eliminado = true;
        }
    }, reproducirSonidoRotura:function() {
        switch(this.tipo) {
            case tipoCristal:
                cc.audioEngine.playEffect(res.glass_break_wav);
                break;
            case tipoMadera:
                cc.audioEngine.playEffect(res.wood_break_wav);
                break;
            case tipoPiedra:
                cc.audioEngine.playEffect(res.stone_break_wav);
                break;
        }
    }
});