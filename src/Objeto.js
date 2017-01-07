var formaRectanguloTumbado = 1;
var formaCuadrado = 2;

var Objeto = cc.Class.extend({
    gameLayer:null,
    sprite:null,
    shape:null,
    tipo:null,
    forma:null,
    ctor:function(gameLayer, posicion, tipo, forma) {

        this.forma = forma;
        this.tipo = tipo;

        // Crear Sprite - Cuerpo y forma
        this.cargarSprite();
        // Cuerpo dinámico, SI le afectan las fuerzas
        this.body = new cp.Body(1, cp.momentForBox(1,
            this.sprite.getContentSize().width,
            this.sprite.getContentSize().height));
        this.body.setPos(posicion);
        this.sprite.setBody(this.body);
        gameLayer.space.addBody(this.body);
        this.shape = new cp.BoxShape(this.body,
                this.sprite.getContentSize().width,
                this.sprite.getContentSize().height);
        this.shape.setFriction(1);
        //this.shape.setCollisionType(tipoJugador);
        // forma dinamica
        gameLayer.space.addShape(this.shape);
        // añadir sprite a la capa
        gameLayer.addChild(this.sprite, 10);
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
                }
                break;
        }
    }
});