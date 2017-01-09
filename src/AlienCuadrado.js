
var AlienCuadrado = cc.Class.extend({
    gameLayer:null,
    sprite:null,
    shape:null,
    color:null,
    vida:null,
    eliminado:false,
    ctor:function(gameLayer, posicion, vidaInicial) {

        this.gameLayer = gameLayer;
        this.vida = vidaInicial;
        var aleatorio = Math.floor(Math.random() * 4);
        this.color = aleatorio;

        this.sprite = this.cargarSprite();
        this.sprite.setScaleX(.5);
        this.sprite.setScaleY(.5);
        var body = new cp.Body(2, cp.momentForBox(1,
                           this.sprite.getContentSize().width * this.sprite.getScaleX(),
                           this.sprite.getContentSize().height * this.sprite.getScaleY()));
        body.setPos(posicion);
        this.shape = new cp.BoxShape(body,
                             this.sprite.getContentSize().width * this.sprite.getScaleX(),
                             this.sprite.getContentSize().height * this.sprite.getScaleY());
        this.shape["alien"] = this;
        this.shape.setFriction(1);
        this.shape.setCollisionType(tipoObjeto);
        // forma dinamica
        this.gameLayer.space.addBody(body);
        this.sprite.setBody(body);
        this.shape.setCollisionType(tipoAlien);
        this.gameLayer.space.addShape(this.shape);
        // añadir sprite a la capa
        this.gameLayer.addChild(this.sprite, 10);
    }, cargarSprite:function() {
        var newSprite;
        switch(this.color) {
            case 0:
                if (this.vida > 500)
                    newSprite = new cc.PhysicsSprite(res.alienBeige_suit);
                else
                    newSprite = new cc.PhysicsSprite(res.alienBeige_square);
                break;
            case 1:
                if (this.vida > 500)
                    newSprite = new cc.PhysicsSprite(res.alienBlue_suit);
                else
                    newSprite = new cc.PhysicsSprite(res.alienBlue_square);
                break;
            case 2:
                if (this.vida > 500)
                    newSprite = new cc.PhysicsSprite(res.alienGreen_suit);
                else
                    newSprite = new cc.PhysicsSprite(res.alienGreen_square);
                break;
            case 3:
                if (this.vida > 500)
                    newSprite = new cc.PhysicsSprite(res.alienPink_suit);
                else
                    newSprite = new cc.PhysicsSprite(res.alienPink_square);
                break;
            case 4:
                if (this.vida > 500)
                    newSprite = new cc.PhysicsSprite(res.alienYellow_suit);
                else
                    newSprite = new cc.PhysicsSprite(res.alienYellow_square);
                break;
        }
        return newSprite;
    }, colision:function(velocidad) {
        if (this.vida > 500)
            this.vida -= velocidad * .25;
        else
            this.vida -= velocidad;
        this.actualizar();
    }, actualizar:function() {
        if (this.vida > 0)
            this.cambiarSprite(this.cargarSprite());
        else if (!this.eliminado) {
            this.gameLayer.eliminarAlien(this);
            this.eliminado = true;
        }
    }, cambiarSprite:function(newSprite) {
        newSprite.setScaleX(0.5);
        newSprite.setScaleY(0.5);
        newSprite.setBody(this.sprite.body);
        this.gameLayer.removeChild(this.sprite);
        this.gameLayer.addChild(newSprite);
        this.sprite = newSprite;
    }
});