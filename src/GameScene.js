var tipoSuelo = 1;

var idCapaJuego = 1;
var idCapaControles = 2;

var GameLayer = cc.Layer.extend({
    mapa: null,
    mapaAncho: null,
    nivel:null,
    objetos:[],
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
        //this.depuracion = new cc.PhysicsDebugNode(this.space);
        //this.addChild(this.depuracion, 10);

        this.cargarMapa();
        this.scheduleUpdate();

        // ------------- COLISIONES ------------------

        return true;
    },update:function (dt) {
        this.space.step(dt);

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
                    1);

                shapeSuelo.setCollisionType(tipoSuelo);
                this.space.addStaticShape(shapeSuelo);
            }
        }

        var grupoCristales = this.mapa.getObjectGroup("Cristal");
        var cristalesArray = grupoCristales.getObjects();
        for (var i = 0; i < cristalesArray.length; i++) {
            var cristal = new Objeto(this,
                cc.p(cristalesArray[i]["x"], cristalesArray[i]["y"]));
            console.log(cristal);
            this.objetos.push(cristal);
        }
   }
});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new GameLayer();
        this.addChild(layer, 0, idCapaJuego);
        //var controlesLayer = new ControlesLayer();
        //this.addChild(controlesLayer, 0, idCapaControles);
    }
});
