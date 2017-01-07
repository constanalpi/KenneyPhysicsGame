
var ProyectilNormal = cc.Class.extend({
gameLayer:null,
spriteProyectil:null,
bodyProyectil:null,
ctor:function(gameLayer, posicion) {

    this.gameLayer = gameLayer;

    this.spriteProyectil = new cc.PhysicsSprite(res.pelota);
    this.spriteProyectil.setScaleX(1.4);
    this.spriteProyectil.setScaleY(1.4);
    this.bodyProyectil = new cp.Body(1, cp.momentForCircle(1, 0, this.spriteProyectil.width / 2, cp.vzero));
    this.bodyProyectil.p = posicion;
    this.spriteProyectil.setBody(this.bodyProyectil);
    var shape = new cp.CircleShape(this.bodyProyectil, this.spriteProyectil.width / 2, cp.vzero);
    shape.setFriction(1);
    this.gameLayer.space.addShape(shape);
    this.gameLayer.addChild(this.spriteProyectil, 20);
}
});