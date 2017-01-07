
var SistemaDisparo = cc.Class.extend({
gameLayer:null,
slingRubber1:null,
slingRubber2:null,
slingRubber3:null,
posicionInicialProyectil:null,
spritePelota:null,
slingRadius: {min: 20, max: 80},
slingAngle: {min: 4.36, max: 5.14},
apuntando:false,
ctor:function(gameLayer, posicion) {

    this.gameLayer = gameLayer;

    //Inicializar el sprite de la pelota
    this.spritePelota = new cc.PhysicsSprite(res.pelota);
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

    this.posicionInicialProyectil = cc.p(body.p.x, body.p.y);

    var sling1Sprite = new cc.Sprite.create(res.sling1);
    //sling1Sprite.setAnchorPoint(cc.p(1, 0));
    sling1Sprite.setPosition(posicion);
    sling1Sprite.setScaleX(0.7);
    sling1Sprite.setScaleY(0.7);
    sling1Sprite.setAnchorPoint(cc.p(1, 0));
    this.gameLayer.addChild(sling1Sprite, 19);

    var sling2Sprite = new cc.Sprite.create(res.sling2);
    //sling2Sprite.setAnchorPoint(cc.p(1, 0));
    sling2Sprite.setPosition(cc.p(posicion.x - 16, posicion.y + 57));
    sling2Sprite.setScaleX(0.7);
    sling2Sprite.setScaleY(0.7);
    sling2Sprite.setAnchorPoint(cc.p(1, 0));
    this.gameLayer.addChild(sling2Sprite, 20);

    this.slingRubber1 = new cc.Sprite.create(res.sling3);
    this.slingRubber1.setPosition(cc.p(posicion.x - 30, posicion.y + 120));
    this.slingRubber1.setScaleY(0.7);
    this.slingRubber1.setAnchorPoint(cc.p(1, 0.5));
    this.gameLayer.addChild(this.slingRubber1, 20);

    this.slingRubber2 = new cc.Sprite.create(res.sling3);
    this.slingRubber2.setPosition(cc.p(posicion.x - 2, posicion.y + 117));
    this.slingRubber2.setScaleY(0.7);
    this.slingRubber2.setAnchorPoint(cc.p(1, 0.5));
    this.gameLayer.addChild(this.slingRubber2, 20);

}, mouseDown:function(posicion) {

    var vector = cc.pSub(this.posicionInicialProyectil, posicion);
    if ((this.apuntando = (cc.pLength(vector) < this.slingRadius.max)) && !this.slingRubber3) {
        this.slingRubber3 = new cc.Sprite.create(res.sling3);
        this.slingRubber3.setPosition(posicion);
        this.slingRubber3.setScaleX(2);
        this.slingRubber3.setScaleY(1.5);
        this.slingRubber3.setAnchorPoint(cc.p(0, 0.5));
        this.gameLayer.addChild(this.slingRubber3, 20);
        this.apuntando = true;
    }
}, mouseMove:function(posicion) {

    if (!this.apuntando) return;

    var vector = cc.pSub(posicion, this.posicionInicialProyectil),
            radius = cc.pLength(vector),
            angle = cc.pToAngle(vector);
    angle = angle < 0 ? (Math.PI * 2) + angle : angle;
    radius = Math.min(Math.max(radius, this.slingRadius.min), this.slingRadius.max);
    if (angle <= this.slingAngle.max && angle >= this.slingAngle.min)
        radius = this.slingRadius.min;
    this.spritePelota.setPosition(cc.pAdd(this.posicionInicialProyectil,
            cc.p(radius * Math.cos(angle), radius * Math.sin(angle))));

    var updateRubber = function (rubber, to, lengthAddon, topRubber) {
        var from = rubber.getPosition(),
            rubberVec = cc.pSub(to, from),
            rubberAng = cc.pToAngle(rubberVec),
            rubberDeg = rubberAng * (180 / Math.PI),
            length = cc.pLength(rubberVec) + (lengthAddon || 8);

        rubber.setRotation(-rubberDeg);
        rubber.setScaleX(-(length / rubber.getContentSize()
            .width));

        if (topRubber) {
            rubber.setScaleY(1.1 - ((0.7 / this.slingRadius.max) * length));
            this.slingRubber3.setRotation(-rubberDeg);
            this.slingRubber3.setPosition(cc.pAdd(from, cc.p((length) * Math.cos(rubberAng), (length) * Math.sin(rubberAng))));
        }
    }.bind(this);

    var rubberToPos = this.spritePelota.getPosition();
    updateRubber(this.slingRubber2, rubberToPos, 13, true);
    updateRubber(this.slingRubber1, rubberToPos, 0);
    this.slingRubber1.setScaleY(this.slingRubber2.getScaleY());
}, mouseUp:function(posicion) {
    if (this.apuntando) {
        this.slingRubber1.setVisible(false);
        this.slingRubber2.setVisible(false);
        this.slingRubber3.setVisible(false);

        this.gameLayer.space.addBody(this.spritePelota.body);
        //this.gameLayer.space.addShape(this.spritePelota.shape);

        var vector = cc.pSub(this.posicionInicialProyectil, this.spritePelota.getPosition()),
                impulse = cc.pMult(vector, 12);
                //bPos = this.spritePelota.body.GetWorldCenter();
        this.spritePelota.body.applyImpulse(impulse, cp.v(0, 0));
        this.apuntando = false;
    }
}
});