var Objeto = cc.Class.extend({
    gameLayer:null,
    sprite:null,
    shape:null,
    tipo:null,
    ctor:function(gameLayer, posicion, tipo) {

        this.tipo = tipo;

        // Crear Sprite - Cuerpo y forma
        //this.sprite = new cc.PhysicsSprite(res.glass1);
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
        console.log(this.shape);
        //this.shape.setCollisionType(tipoJugador);
        // forma dinamica
        gameLayer.space.addShape(this.shape);
        // añadir sprite a la capa
        gameLayer.addChild(this.sprite, 10);
    }, cargarSprite:function() {
        switch(this.tipo) {
            case tipoCristal:
                this.sprite = new cc.PhysicsSprite(res.glass1);
                break;
            case tipoMadera:
                this.sprite = new cc.PhysicsSprite(res.wood1);
                break;
            case tipoPiedra:
                this.sprite = new cc.PhysicsSprite(res.stone1);
                break;
        }
    }
});