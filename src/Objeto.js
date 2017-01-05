var Objeto = cc.Class.extend({
    gameLayer:null,
    sprite:null,
    shape:null,
    ctor:function(gameLayer, posicion) {
        // Crear Sprite - Cuerpo y forma
        this.sprite = new cc.PhysicsSprite(res.glass1);
        // Cuerpo dinámico, SI le afectan las fuerzas
        this.body = new cp.Body(5, cp.momentForBox(1,
            this.sprite.getContentSize().width,
            this.sprite.getContentSize().height));
        this.body.setPos(posicion);
        this.sprite.setBody(this.body);
        gameLayer.space.addBody(this.body);
        this.shape = new cp.BoxShape(this.body,
                this.sprite.getContentSize().width,
                this.sprite.getContentSize().height);
        //this.shape.setCollisionType(tipoJugador);
        // forma dinamica
        gameLayer.space.addShape(this.shape);
        // añadir sprite a la capa
        gameLayer.addChild(this.sprite, 10);
    }
});