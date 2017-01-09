
var ProyectilMultiple = cc.Class.extend({
    gameLayer:null,
    spriteProyectil:null,
    bodyProyectil:null,
    shapeProyectil:null,
    ctor:function(gameLayer, posicion) {
        this.gameLayer = gameLayer;

        this.spriteProyectil = new cc.PhysicsSprite(res.pelota_multiple);
        this.spriteProyectil.setScaleX(.7);
        this.spriteProyectil.setScaleY(.7);
        this.bodyProyectil = new cp.Body(5, cp.momentForCircle(1, 0, (
                this.spriteProyectil.width * this.spriteProyectil.getScaleX()) / 2, cp.vzero));
        this.bodyProyectil.p = posicion;
        this.spriteProyectil.setBody(this.bodyProyectil);
        this.shapeProyectil = new cp.CircleShape(this.bodyProyectil, (
                this.spriteProyectil.width * this.spriteProyectil.getScaleX()) / 2, cp.vzero);
        this.shapeProyectil.setFriction(1);
        this.shapeProyectil.setCollisionType(tipoProyectil);
        this.gameLayer.space.addShape(this.shapeProyectil);
        this.gameLayer.addChild(this.spriteProyectil, 20);

    }, multiplicar:function() {
        var posicionProyectil = this.spriteProyectil.getPosition();
        console.log(this.spriteProyectil.getPosition());
        var velocidadProyectil = this.bodyProyectil.getVel();
        var nuevosProyectiles = [];
        for (var i = 0; i < 3; i++)
            nuevosProyectiles.push(this.crearMiniProyectil(cc.p(posicionProyectil.x + i, posicionProyectil.y)));
        var impulse = cc.pMult(velocidadProyectil, 2);
        console.log(impulse);
        nuevosProyectiles[0].body.applyImpulse(impulse, cp.v(0, 0));
        nuevosProyectiles[1].body.applyImpulse(cp.v(impulse.x, impulse.y + 500), cp.v(0, 0));
        nuevosProyectiles[2].body.applyImpulse(cp.v(impulse.x, impulse.y - 500), cp.v(0, 0));

        console.log(nuevosProyectiles.length);
        this.gameLayer.eliminarProyectil(this);

    }, crearMiniProyectil:function(posicion) {
        var spriteMiniProyectil = new cc.PhysicsSprite(res.mini_proyectil);
        var bodyMiniProyectil = new cp.Body(2, cp.momentForCircle(1, 0, (spriteMiniProyectil.width * .3) / 2, cp.vzero));
        bodyMiniProyectil.p = posicion;
        spriteMiniProyectil.setBody(bodyMiniProyectil);
        var shapeMiniProyectil = new cp.CircleShape(bodyMiniProyectil, (spriteMiniProyectil.width * .3) / 2, cp.vzero);
        shapeMiniProyectil.setFriction(1);
        shapeMiniProyectil.setCollisionType(tipoProyectil);
        this.gameLayer.addChild(spriteMiniProyectil);
        this.gameLayer.space.addBody(bodyMiniProyectil);
        this.gameLayer.space.addShape(shapeMiniProyectil);
        return spriteMiniProyectil;
    }
});