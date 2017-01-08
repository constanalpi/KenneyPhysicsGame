var tipoCristal = 2;
var tipoMadera = 3;
var tipoPiedra = 4;

var tipoProyectil = 1;
var tipoObjeto = 2;

var idCapaJuego = 1;
var idCapaControles = 2;

// ------------ ESTADOS CAMARA ------------
var estadoApuntando = 1;
var estadoDisparando = 2;
var estadoObservando = 3;
var estadoVolviendoAlDisparador = 4;

var GameLayer = cc.Layer.extend({
    mapa: null,
    mapaAncho: null,
    space:null,
    nivel:null,
    sistemaDisparo:null,
    objetos:[],
    objetosEliminar:[],
    puntoEnfoqueObjetos:null,
    estadoCamara:null,
    estadoAnimacionInicial:null,
    cronometroCamara:0,
    proyectilActivo:null,
    ctor:function () {
        this._super();
        // Cachear

        this.estadoCamara = estadoObservando;

        // Inicializar listeners de Mouse
        cc.eventManager.addListener({event: cc.EventListener.MOUSE, onMouseDown: this.procesarMouseDown}, this);
        cc.eventManager.addListener({event: cc.EventListener.MOUSE, onMouseMove: this.procesarMouseMove}, this);
        cc.eventManager.addListener({event: cc.EventListener.MOUSE, onMouseUp: this.procesarMouseUp}, this);

        // Coger el nivel del director
        this.nivel = cc.director["nivel"];
        // Inicializar Space
        this.space = new cp.Space();
        this.space.gravity = cp.v(0, -350);
        // Depuración
        this.depuracion = new cc.PhysicsDebugNode(this.space);
        this.addChild(this.depuracion, 10);

        // - -------- COLISIONES ------------
        // objeto y proyectil
        this.space.addCollisionHandler(tipoProyectil, tipoObjeto,
                null, null, this.colisionProyectilObjeto.bind(this), null);
        this.space.addCollisionHandler(tipoObjeto, tipoObjeto,
                null, null, this.colisionObjetoObjeto.bind(this), null);

        this.cargarMapa();
        this.setPosition(cc.p(-(this.puntoEnfoqueObjetos.x - cc.winSize.width / 2),0));
        this.scheduleUpdate();

        return true;
    },update:function (dt) {
        this.space.step(dt);
        this.actualizarCamara(dt);
        this.eliminarObjetos();
        for (var i = 0; i < this.objetos.length; i++)
            console.log(this.objetos[i].sprite);

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
                shapeSuelo.setFriction(1);
                this.space.addStaticShape(shapeSuelo);
            }
        }

        this.cargarCristales();
        this.cargarMaderas();
        this.cargarPiedras();
        this.cargarSistemaDisparo();
        this.cargarPuntoEnfoqueObjetos();
    }, cargarPuntoEnfoqueObjetos:function() {
        this.puntoEnfoqueObjetos = cc.p(this.mapa.getObjectGroup("PuntoEnfoqueObjetos").getObjects()[0]["x"],
                this.mapa.getObjectGroup("PuntoEnfoqueObjetos").getObjects()[0]["y"]);
    }, cargarSistemaDisparo:function() {
        var grupoSistemaDisparo = this.mapa.getObjectGroup("SistemaDisparo");
        // Inicializar el sistema de disparo
        this.sistemaDisparo = new SistemaDisparo(this,
                cc.p(grupoSistemaDisparo.getObjects()[0]["x"],
                grupoSistemaDisparo.getObjects()[0]["y"]));
        this.sistemaDisparo.cargar(new ProyectilNormal(this, cc.p(200, 200)));
   }, cargarCristales:function() {
        var grupoCristales = this.mapa.getObjectGroup("Cristal");
        var cristalesArray = grupoCristales.getObjects();
        for (var i = 0; i < cristalesArray.length; i++) {
            var forma = this.cargarTipo(cristalesArray[i]["width"], cristalesArray[i]["height"]);
            var cristal = new Objeto(this,
                cc.p(cristalesArray[i]["x"], cristalesArray[i]["y"]), tipoCristal, forma);
            this.objetos.push(cristal);
        }
   }, cargarMaderas:function() {
        var grupoMaderas = this.mapa.getObjectGroup("Madera");
        var maderasArray = grupoMaderas.getObjects();
        for (var i = 0; i < maderasArray.length; i++) {
            var forma = this.cargarTipo(maderasArray[i]["width"], maderasArray[i]["height"]);
            var madera = new Objeto(this,
                cc.p(maderasArray[i]["x"], maderasArray[i]["y"]), tipoMadera, forma);
            this.objetos.push(madera);
        }
   }, cargarPiedras:function() {
        var grupoPiedras = this.mapa.getObjectGroup("Piedra");
        var piedrasArray = grupoPiedras.getObjects();
        for (var i = 0; i < piedrasArray.length; i++) {
            var forma = this.cargarTipo(piedrasArray[i]["width"], piedrasArray[i]["height"]);
            var piedra = new Objeto(this,
                cc.p(piedrasArray[i]["x"], piedrasArray[i]["y"]), tipoPiedra, forma);
            this.objetos.push(piedra);
        }
   }, cargarTipo:function(width, height) {
        if (width == 50 && height == 25)
            return formaRectanguloTumbado;
        if (width == 30 && height == 30)
            return formaCuadrado;
   }, procesarMouseDown:function (event) {
        var tocaEnSistemaDisparo = event.getCurrentTarget().sistemaDisparo.mouseDown(
            cc.p(event.getLocationX() - event.getCurrentTarget().getPosition().x, event.getLocationY()));
   }, procesarMouseMove:function(event) {
        event.getCurrentTarget().sistemaDisparo.mouseMove(cc.p(
                event.getLocationX() - event.getCurrentTarget().getPosition().x, event.getLocationY()));
   }, procesarMouseUp: function(event) {
        var instancia = event.getCurrentTarget();
        instancia.proyectilActivo = instancia.
                sistemaDisparo.mouseUp(cc.p(event.getLocationX()
                - event.getCurrentTarget().getPosition().x, event.getLocationY()));
        if (instancia.proyectilActivo) {
            instancia.estadoCamara = estadoDisparando;
        }
   }, actualizarCamara:function(dt) {
        switch(this.estadoCamara) {
            case estadoObservando:
                this.playEstadoObservandoCamara(dt);
                break;
            case estadoVolviendoAlDisparador:
                this.playEstadoVolviendoAlDisparador(dt);
                break;
            case estadoDisparando:
                this.playEstadoDisparando(dt);
                break;
        }
   }, playEstadoObservandoCamara:function(dt) {
        this.cronometroCamara += dt;
        if (this.cronometroCamara >= 5)
            this.estadoCamara = estadoVolviendoAlDisparador;
   }, playEstadoVolviendoAlDisparador:function(dt) {
        this.setPosition(cc.p(this.getPosition().x + 4,0));
        if (Math.abs(Math.abs(this.getPosition().x - cc.winSize.width / 2)
                    - this.sistemaDisparo.posicionInicialProyectil.x) < 5) {
            this.setPosition(cc.p(-(this.sistemaDisparo.proyectil.spriteProyectil.x - cc.winSize.width / 2), 0));
            this.estadoCamara = estadoApuntando;
        }
   }, playEstadoDisparando:function(dt) {
        this.setPosition(cc.p(-(this.sistemaDisparo.proyectil.spriteProyectil.x - cc.winSize.width / 2), 0));
   }, colisionProyectilObjeto(arbiter, space) {
        var shapes = arbiter.getShapes();
        shapes[1]["object"].colision(Math.max(Math.max(Math.abs(shapes[0].body.getVel().x),
                Math.abs(shapes[0].body.getVel().y)), Math.max(Math.abs(shapes[1].body.getVel().x),
                 Math.abs(shapes[1].body.getVel().y))));
        /*Tienes que implementar colision, que disminuira de la vida al objeto más o menos dependiendo del tipo,
        ademas de actualizar, que cambia el sprite, o hace desaparecer al objeto, en función de la disminución de la vida.*/
   }, colisionObjetoObjeto:function(arbiter, space) {

   }, eliminarObjeto:function(objeto) {
        this.objetosEliminar.push(objeto);
   }, eliminarObjetos:function() {
        for (var i = 0; i < this.objetosEliminar.length; i++) {
            this.objetos.splice(this.objetos.indexOf(this.objetosEliminar[i]), 1);
            this.removeChild(this.objetosEliminar[i].sprite);
            this.space.removeBody(this.objetosEliminar[i].sprite.body);
            this.space.removeShape(this.objetosEliminar[i].shape);
        }
        this.objetosEliminar =  [];
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
