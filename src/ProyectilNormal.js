
var ProyectilNormal = cc.Class.extend({
gameLayer:null,
spriteProyectil:null,
bodyProyectil:null,
ctor:function(gameLayer, posicion) {

    this.gameLayer = gameLayer;

    this.spriteProyectil = new cc.PhysicsSprite(res.pelota);
    this.spriteProyectil.setScaleX(.04);
    this.spriteProyectil.setScaleY(.04);
    this.bodyProyectil = new cp.Body(5, cp.momentForCircle(
            1, 0, (this.spriteProyectil.width * this.spriteProyectil.getScaleX()) / 2, cp.vzero));
    this.bodyProyectil.p = posicion;
    this.spriteProyectil.setBody(this.bodyProyectil);
    var shape = new cp.CircleShape(this.bodyProyectil, (
            this.spriteProyectil.width * this.spriteProyectil.getScaleX()) / 2, cp.vzero);
    shape.setFriction(1);
    shape.setCollisionType(tipoProyectil);
    this.gameLayer.space.addShape(shape);
    this.gameLayer.addChild(this.spriteProyectil, 20);
}
});