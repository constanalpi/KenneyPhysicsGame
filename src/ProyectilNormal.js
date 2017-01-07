
var ProyectilNormal = cc.Class.extend({
gameLayer:null,
spriteProyectil:null,
ctor:function(gameLayer, posicion) {
    this.gameLayer = gameLayer;

    this.spriteProyectil = cc.PhysicsSprite(res.pelota);
    this.spritePelota.setScaleX(1.4);
    this.spritePelota.setScaleY(1.4);
    var body = new cp.Body(1, cp.momentForCircle(1, 0, this.spritePelota.width / 2, cp.vzero));
    body.p = cc.p(posicion.x - 20, posicion.y + 120);
    this.spritePelota.setBody(body);
    //this.gameLayer.space.addBody(body);
    var shape = new cp.CircleShape(body, this.spritePelota.width / 2, cp.vzero);
    shape.setFriction(1);
    this.gameLayer.space.addShape(shape);
    this.gameLayer.addChild(this.spritePelota, 20);
}
});