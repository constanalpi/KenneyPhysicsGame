
var ProyectilOvni = cc.Class.extend({
    gameLayer:null,
    spriteProyectil:null,
    bodyProyectil:null,
    shapeProyectil:null,
    tiempoSinDisparar:0,
    ctor:function(gameLayer, posicion) {
        this.gameLayer = gameLayer;

        this.spriteProyectil = new cc.PhysicsSprite(res.proyectil_ovni);
        this.spriteProyectil.setScaleX(.05);
        this.spriteProyectil.setScaleY(.05);
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
    }, disparar:function(dt, aliens) {
        if (aliens.length == 0) return;
        this.tiempoSinDisparar += dt;
        if (this.tiempoSinDisparar > .5) {
            this.generarDisparo(aliens);
            this.tiempoSinDisparar = 0;
        }
    }, generarDisparo:function(aliens) {
        var alienObjetivo = this.getAlienMasCercano(aliens);
        var spriteDisparoOvni = new cc.PhysicsSprite(res.disparo_ovni);
        spriteDisparoOvni.setScaleX(.1);
        spriteDisparoOvni.setScaleY(.1);
        var bodyDisparoOvni = new cp.Body(1, cp.momentForCircle(1, 0, (
                spriteDisparoOvni.width * spriteDisparoOvni.getScaleX()) / 2, cp.vzero));
        bodyDisparoOvni.p = this.spriteProyectil.getPosition();
        spriteDisparoOvni.setBody(bodyDisparoOvni);
        var shapeDisparoOvni = new cp.CircleShape(bodyDisparoOvni, (
                spriteDisparoOvni.width * spriteDisparoOvni.getScaleX()) / 2, cp.vzero);
        shapeDisparoOvni["mySprite"] = spriteDisparoOvni;
        shapeDisparoOvni.setFriction(1);
        shapeDisparoOvni.setCollisionType(tipoDisparoOvni);
        this.gameLayer.addChild(spriteDisparoOvni);
        this.gameLayer.space.addBody(bodyDisparoOvni);
        this.gameLayer.space.addShape(shapeDisparoOvni);

        var impulse = cc.pMult(cc.pSub(alienObjetivo.sprite.getPosition(), spriteDisparoOvni.getPosition()), 3);
        bodyDisparoOvni.applyImpulse(impulse, cp.v(0, 0));
    }, getAlienMasCercano:function(aliens) {
        var alienMasCercano = aliens[0];
        for (var i = 0; i < aliens.length; i++)
            if (Math.abs(alienMasCercano.sprite.getPosition().x - this.spriteProyectil.getPosition().x) >
                    Math.abs(aliens[i].sprite.getPosition().x - this.spriteProyectil.getPosition().x))
                alienMasCercano = aliens[i];
        return alienMasCercano;
    }
});