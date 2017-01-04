var tipoSuelo = 1;
var tipoJugador = 2;
var tipoMoneda = 3;
var tipoEnemigo = 4;
var tipoPincho = 5;

var idCapaJuego = 1;
var idCapaControles = 2;

var GameLayer = cc.Layer.extend({
    mapa: null,
    mapaAncho: null,
    nivel:null,
    ctor:function () {
        this._super();
        var size = cc.winSize;
        // Cachear

        // Coger el nivel del director
        this.nivel = cc.director["nivel"];
        // Inicializar Space
        this.space = new cp.Space();
        this.space.gravity = cp.v(0, -350);
        // Depuración
        this.depuracion = new cc.PhysicsDebugNode(this.space);
        this.addChild(this.depuracion, 10);

        this.cargarMapa();
        this.scheduleUpdate();

        // ------------- COLISIONES ------------------

        return true;
    },update:function (dt) {


    }, cargarMapa:function() {
        switch(this.nivel) {
            case 1:
                this.mapa = new cc.TMXTiledMap(res.mapa1_tmx);
                break;
            case 2: this.mapa = new cc.TMXTiledMap(res.mapa2_tmx);
                break;
        }
        // Añadirlo a la Layer
        this.addChild(this.mapa);
        // Ancho del mapa
        this.mapaAncho = this.mapa.getContentSize().width;
        //console.log("El ancho del mapa es " + this.mapaAncho);

        // Solicitar los objeto dentro de la capa Suelos
        var grupoSuelos = this.mapa.getObjectGroup("Suelos");
        var suelosArray = grupoSuelos.getObjects();

        // Los objetos de la capa suelos se transforman a
        // formas estáticas de Chipmunk ( SegmentShape ).
        for (var i = 0; i < suelosArray.length; i++) {
            var suelo = suelosArray[i];
            var puntos = suelo.polylinePoints;
            for(var j = 0; j < puntos.length - 1; j++){
                var bodySuelo = new cp.StaticBody();
                var shapeSuelo = new cp.SegmentShape(bodySuelo,
                    cp.v(parseInt(suelo.x) + parseInt(puntos[j].x),
                        parseInt(suelo.y) - parseInt(puntos[j].y)),
                    cp.v(parseInt(suelo.x) + parseInt(puntos[j + 1].x),
                        parseInt(suelo.y) - parseInt(puntos[j + 1].y)),
                    10);

                shapeSuelo.setCollisionType(tipoSuelo);
                this.space.addStaticShape(shapeSuelo);
            }
        }

    // Objetos de la capa pinchos
    var grupoPinchos = this.mapa.getObjectGroup("Pinchos");
    var pinchosArray = grupoPinchos.getObjects();
    console.log(pinchosArray.length);
    for (var i = 0; i < pinchosArray.length; i++) {
        var pincho = pinchosArray[i];
        var puntos = pincho.polylinePoints;
        for(var j = 0; j < puntos.length - 1; j++){
            var bodyPincho = new cp.StaticBody();
            var shapePincho = new cp.SegmentShape(bodyPincho,
                cp.v(parseInt(pincho.x) + parseInt(puntos[j].x),
                    parseInt(pincho.y) - parseInt(puntos[j].y)),
                cp.v(parseInt(pincho.x) + parseInt(puntos[j + 1].x),
                    parseInt(pincho.y) - parseInt(puntos[j + 1].y)),
                10);

            shapePincho.setCollisionType(tipoPincho);
            this.space.addStaticShape(shapePincho);
        }
    }

    var grupoMonedas = this.mapa.getObjectGroup("Monedas");
    var monedasArray = grupoMonedas.getObjects();
    for (var i = 0; i < monedasArray.length; i++) {
        var moneda = new Moneda(this,
        cc.p(monedasArray[i]["x"],monedasArray[i]["y"]));
        this.monedas.push(moneda);
    }

    var grupoEnemigos = this.mapa.getObjectGroup("Enemigos");
    var enemigosArray = grupoEnemigos.getObjects();
    for (var i = 0; i < enemigosArray.length; i++) {
        var enemigo = new Enemigo(this, cc.p(enemigosArray[i]["x"],enemigosArray[i]["y"]));
        this.enemigos.push(enemigo);
    }


   }, collisionSueloConJugador:function(arbiter, space) {
        this.jugador.tocaSuelo();
   }, collisionJugadorConMoneda:function(arbiter, space) {
       // Emisión de partículas
       this._emitter.setEmissionRate(5);
       this.tiempoEfecto = 3;

       // Impulso extra
       this.jugador.body.applyImpulse(cp.v(300, 0), cp.v(0, 0));
       // Marcar la moneda para eliminarla
       var shapes = arbiter.getShapes();
       // shapes[0] es el jugador
       this.formasEliminar.push(shapes[1]);
       var capaControles = this.getParent().getChildByTag(idCapaControles);
       capaControles.agregarMoneda();

   }, collisionJugadorEnemigo:function(arbiter, space) {
        // Cuando colisiona con un enemigo vuelve a la posicion inicial
        this.jugador.body.p = cc.p(50,150);
   }, ganarJuego:function() {
        // Considero que el jugador gana cuando su posicion llega al ancho del mapa menos 100
        if (this.jugador.body.p.x >= this.mapaAncho - 100) {
            cc.director["nivel"] = this.nivel + 1;
            cc.director.runScene(new GameScene());
        }
   }, collisionJugadorPincho:function(arbiter, space) {
        console.log("We are here!!!");
        this.jugador.body.p = cc.p(50, 150);
   }
});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GameLayer();
        this.addChild(layer, 0, idCapaJuego);
        var controlesLayer = new ControlesLayer();
        this.addChild(controlesLayer, 0, idCapaControles);
    }
});
