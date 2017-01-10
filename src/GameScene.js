var tipoCristal = 2;
var tipoMadera = 3;
var tipoPiedra = 4;

var tipoProyectil = 1;
var tipoObjeto = 2;
var tipoSuelo = 3;
var tipoAlien = 4;
var tipoDisparoOvni = 5;
var tipoPincho = 6;

var idCapaJuego = 1;
var idCapaControles = 2;

// ------------ ESTADOS CAMARA ------------
var estadoApuntando = 1;
var estadoDisparando = 2;
var estadoObservando = 3;
var estadoVolviendoAlDisparador = 4;
var estadoYendoAMirar = 5;

var GameLayer = cc.Layer.extend({
    mapa: null,
    mapaAncho: null,
    space:null,
    nivel:null,
    sistemaDisparo:null,
    objetos:[],
    objetosEliminar:[],
    aliens:[],
    aliensEliminar:[],
    proyectilesEliminar:[],
    shapesEliminar:[],
    proyectiles:[],
    spritesAnimacionesEliminar:[],
    puntoEnfoqueObjetos:null,
    estadoCamara:null,
    estadoAnimacionInicial:null,
    cronometroCamara:0,
    proyectilActivo:null,
    proyectilSpriteActivo:null,
    numeroProyectil:null,
    tiempoProyectilParado:null,
    ctor:function () {
        this._super();
        // Cachear

        this.estadoCamara = estadoObservando;
        this.tiempoProyectilParado = 0;

        // Inicializar listeners de Mouse
        cc.eventManager.addListener({event: cc.EventListener.MOUSE, onMouseDown: this.procesarMouseDown}, this);
        cc.eventManager.addListener({event: cc.EventListener.MOUSE, onMouseMove: this.procesarMouseMove}, this);
        cc.eventManager.addListener({event: cc.EventListener.MOUSE, onMouseUp: this.procesarMouseUp}, this);

        // ------------ CACHEAR ------------
        cc.spriteFrameCache.addSpriteFrames(res.explosion_nave_plist);

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
        this.space.addCollisionHandler(tipoObjeto, tipoSuelo,
                null, null, this.colisionObjetoSuelo.bind(this), null);
        this.space.addCollisionHandler(tipoProyectil, tipoAlien,
                null, null, this.colisionProyectilAlien.bind(this), null);
        this.space.addCollisionHandler(tipoProyectil, tipoSuelo,
                null, null, this.colisionProyectilSuelo.bind(this), null);
        this.space.addCollisionHandler(tipoObjeto, tipoAlien,
                null, null, this.colisionObjetoAlien.bind(this), null);
        this.space.addCollisionHandler(tipoAlien, tipoSuelo,
                null, null, this.colisionAlienSuelo.bind(this), null);
        this.space.addCollisionHandler(tipoDisparoOvni, tipoAlien,
                null, null, this.colisionDisparoOvniAlien.bind(this), null);
        this.space.addCollisionHandler(tipoDisparoOvni, tipoObjeto,
                null, null, this.colisionDisparoOvniObjeto.bind(this), null);
        this.space.addCollisionHandler(tipoDisparoOvni, tipoSuelo,
                null, null, this.colisionDisparoOvniSuelo.bind(this), null);
        this.space.addCollisionHandler(tipoAlien, tipoPincho,
                null, null, this.colisionAlienPincho.bind(this), null);
        this.space.addCollisionHandler(tipoProyectil, tipoPincho,
                null, null, this.colisionProyectilPincho.bind(this), null);

        this.cargarMapa();
        this.setPosition(cc.p(-(this.puntoEnfoqueObjetos.x - cc.winSize.width / 2),0));
        this.scheduleUpdate();

        return true;
    },update:function (dt) {
        this.space.step(dt);
        this.actualizarCamara(dt);
        this.actualizarDisparo(dt);
        this.eliminarObjetos();
        this.eliminarAliens();
        this.eliminarProyectiles();
        this.eliminarShapes();
        this.eliminarSpritesAnimaciones();
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
                    15);
                shapeSuelo.setFriction(1);
                shapeSuelo.setCollisionType(tipoSuelo);
                this.space.addStaticShape(shapeSuelo);
            }
        }
        this.cargarPinchos();
        this.cargarCristales();
        this.cargarMaderas();
        this.cargarPiedras();
        this.aliens = [];
        this.cargarAliensRedondos();
        this.cargarAliensCuadrados();
        this.cargarAliensSuit();
        this.cargarProyectiles();
        this.cargarSistemaDisparo();
        this.cargarPuntoEnfoqueObjetos();
    }, cargarPinchos:function() {
        pincho = this.mapa.getObjectGroup("Pinchos").getObjects()[0];
        puntosPinchos = pincho.polylinePoints;
        for (var i = 0; i < puntosPinchos.length - 1; i++) {
            var bodyPincho = new cp.StaticBody();
            var shapePincho = new cp.SegmentShape(bodyPincho,
                cp.v(parseInt(pincho.x) + parseInt(puntosPinchos[i].x),
                    parseInt(pincho.y) - parseInt(puntosPinchos[i].y)),
                cp.v(parseInt(pincho.x) + parseInt(puntosPinchos[i + 1].x),
                    parseInt(pincho.y) - parseInt(puntosPinchos[i + 1].y)),
                15);
            shapePincho.setFriction(1);
            shapePincho.setCollisionType(tipoPincho);
            this.space.addStaticShape(shapePincho);
        }
    }, cargarProyectiles:function() {
        this.proyectiles = [];
        var grupoProyectilesNormales = this.mapa.getObjectGroup("ProyectilesNormales");
        var proyectilesNormales = grupoProyectilesNormales.getObjects();
        for (var i = 0; i < proyectilesNormales.length; i++) {
            var proyectilNormal = new ProyectilNormal(this, cc.p(proyectilesNormales[i]["x"], proyectilesNormales[i]["y"]));
            this.proyectiles.push(proyectilNormal);
        }

        var grupoProyectilesMultiples = this.mapa.getObjectGroup("ProyectilesMultiples");
        var proyectilesMultiples = grupoProyectilesMultiples.getObjects();
        for (var i = 0; i < proyectilesMultiples.length; i++) {
            var proyectilMultiple = new ProyectilMultiple(this, cc.p(proyectilesMultiples[i]["x"], proyectilesMultiples[i]["y"]));
            this.proyectiles.push(proyectilMultiple);
        }

        var grupoProyectilesOvni = this.mapa.getObjectGroup("ProyectilesOvni");
        var proyectilesOvni = grupoProyectilesOvni.getObjects();
        for (var i = 0; i < proyectilesOvni.length; i++) {
            var proyectilOvni = new ProyectilOvni(this, cc.p(proyectilesOvni[i]["x"], proyectilesOvni[i]["y"]));
            this.proyectiles.push(proyectilOvni);
        }
        this.proyectiles.sort(function(proyectilA, proyectilB) {return proyectilB.spriteProyectil.x - proyectilA.spriteProyectil.x});
        //this.proyectiles.reverse();
        this.numeroProyectil = 0;

    }, cargarAliensSuit:function() {
        var grupoAliensSuit = this.mapa.getObjectGroup("AliensSuit");
        var aliensSuitArray = grupoAliensSuit.getObjects();
        for (var i = 0; i < aliensSuitArray.length; i++) {
            var alienSuit = new AlienCuadrado(this, cc.p(aliensSuitArray[i]["x"],
                    aliensSuitArray[i]["y"]), 1000);
            this.aliens.push(alienSuit);
        }
    }, cargarAliensCuadrados:function() {
        var grupoAliensCuadrados = this.mapa.getObjectGroup("AliensCuadrados");
        var aliensCuadradosArray = grupoAliensCuadrados.getObjects();
        for (var i = 0; i < aliensCuadradosArray.length; i++) {
            var alienCuadrado = new AlienCuadrado(this, cc.p(aliensCuadradosArray[i]["x"],
                    aliensCuadradosArray[i]["y"]), 500);
            this.aliens.push(alienCuadrado);
        }
    }, cargarAliensRedondos:function() {
        var grupoAliensRedondos = this.mapa.getObjectGroup("AliensRedondos");
        var aliensRedondosArray = grupoAliensRedondos.getObjects();
        for (var i = 0; i < aliensRedondosArray.length; i++) {
            var alienRedondo = new AlienRedondo(this,
                cc.p(aliensRedondosArray[i]["x"], aliensRedondosArray[i]["y"]));
            this.aliens.push(alienRedondo);
        }
    }, cargarPuntoEnfoqueObjetos:function() {
        this.puntoEnfoqueObjetos = cc.p(this.mapa.getObjectGroup("PuntoEnfoqueObjetos").getObjects()[0]["x"],
                this.mapa.getObjectGroup("PuntoEnfoqueObjetos").getObjects()[0]["y"]);
    }, cargarSistemaDisparo:function() {
        var grupoSistemaDisparo = this.mapa.getObjectGroup("SistemaDisparo");
        // Inicializar el sistema de disparo
        this.sistemaDisparo = new SistemaDisparo(this,
                cc.p(grupoSistemaDisparo.getObjects()[0]["x"],
                grupoSistemaDisparo.getObjects()[0]["y"]));
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
        var instancia = event.getCurrentTarget();
        var tocaEnSistemaDisparo = instancia.sistemaDisparo.mouseDown(
            cc.p(event.getLocationX() - event.getCurrentTarget().getPosition().x, event.getLocationY()));
        if (instancia.estadoCamara == estadoDisparando && instancia.proyectilActivo instanceof ProyectilMultiple)
            instancia.proyectilActivo.multiplicar();
   }, procesarMouseMove:function(event) {
        event.getCurrentTarget().sistemaDisparo.mouseMove(cc.p(
                event.getLocationX() - event.getCurrentTarget().getPosition().x, event.getLocationY()));
   }, procesarMouseUp: function(event) {
        var instancia = event.getCurrentTarget();
        instancia.sistemaDisparo.mouseUp(cc.p(event.getLocationX()
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
            case estadoYendoAMirar:
                this.playEstadoYendoAMirar();
        }
   }, playEstadoYendoAMirar:function() {
        this.setPosition(cc.p(this.getPosition().x - 4,0));
        if (Math.abs(Math.abs(this.getPosition().x - cc.winSize.width / 2)
                    - this.puntoEnfoqueObjetos.x) < 5) {
            this.estadoCamara = estadoObservando;
        }
   }, playEstadoObservandoCamara:function(dt) {
        this.cronometroCamara += dt;
        if (this.cronometroCamara >= 5) {
            if (this.numeroProyectil >= this.proyectiles.length) {
                if (this.aliens.length > 0)
                    this.perderPartida();
                else
                    this.ganarPartida();
            }
            else if (this.aliens.length == 0)
                this.ganarPartida();

            this.estadoCamara = estadoVolviendoAlDisparador;
            this.cronometroCamara = 0;
        }
   }, playEstadoVolviendoAlDisparador:function(dt) {
        this.setPosition(cc.p(this.getPosition().x + 4,0));
        if (Math.abs(Math.abs(this.getPosition().x - cc.winSize.width / 2 - 150)
                    - this.sistemaDisparo.posicionInicialProyectil.x) < 5) {
            this.setPosition(cc.p(-(this.sistemaDisparo.posicionInicialProyectil.x - cc.winSize.width / 2 - 150), 0));
            this.estadoCamara = estadoApuntando;
            this.sistemaDisparo.cargar(this.proyectiles[this.numeroProyectil]);
        }
   }, playEstadoDisparando:function(dt) {
        if (this.proyectilActivo == null && this.proyectilSpriteActivo == null || this.proyectilParado(dt)) {
            this.estadoCamara = estadoYendoAMirar;
            this.numeroProyectil++;
            return;
        }
        if (this.proyectilActivo != null) {
            this.setPosition(cc.p(-(this.proyectilActivo.spriteProyectil.x - cc.winSize.width / 2), 0));
            if (Math.abs(this.puntoEnfoqueObjetos.x - this.proyectilActivo.spriteProyectil.x) < 100) {
                this.estadoCamara = estadoObservando;
                this.numeroProyectil++;
            }
        }
        else {
            this.setPosition(cc.p(-(this.proyectilSpriteActivo.x - cc.winSize.width / 2), 0));
            if (Math.abs(this.puntoEnfoqueObjetos.x - this.proyectilSpriteActivo.x) < 100) {
                this.estadoCamara = estadoObservando;
                this.numeroProyectil++;
                this.proyectilSpriteActivo = null;
            }
        }

   }, proyectilParado:function(dt) {
        if (this.proyectilActivo == null)
            return false;
        else if (Math.max(Math.abs(this.proyectilActivo.bodyProyectil.getVel().x),
                Math.abs(this.proyectilActivo.bodyProyectil.getVel().y)) < 10)
            this.tiempoProyectilParado += dt;
        if (this.tiempoProyectilParado > 3) {
            this.tiempoProyectilParado = 0;
            return true;
        }
        return false;
   }, colisionAlienPincho:function(arbiter, space) {
        arbiter.getShapes()[0].colision(10000);
   }, colisionProyectilPincho(arbiter, space) {
        if (this.proyectilActivo instanceof ProyectilOvni && arbiter.getShapes()[0] == this.proyectilActivo.shapeProyectil) {
            this.animacionExplosionNave(this.proyectilActivo.spriteProyectil.getPosition());
            this.eliminarProyectil(this.proyectilActivo);
            this.numeroProyectil++;
            return;
        }
   }, colisionProyectilSuelo:function(arbiter, space) {
        if (this.proyectilActivo instanceof ProyectilOvni && arbiter.getShapes()[0] == this.proyectilActivo.shapeProyectil) {
            this.animacionExplosionNave(this.proyectilActivo.spriteProyectil.getPosition());
            this.eliminarProyectil(this.proyectilActivo);
            this.numeroProyectil++;
            return;
        }
   }, colisionProyectilObjeto:function(arbiter, space) {
        var shapes = arbiter.getShapes();
        if (this.proyectilActivo instanceof ProyectilOvni && arbiter.getShapes()[0] == this.proyectilActivo.shapeProyectil) {
            this.animacionExplosionNave(this.proyectilActivo.spriteProyectil.getPosition());
            this.eliminarProyectil(this.proyectilActivo);
            return;
        }
        shapes[1]["object"].colision(Math.max(Math.max(Math.abs(shapes[0].body.getVel().x),
                Math.abs(shapes[0].body.getVel().y)), Math.max(Math.abs(shapes[1].body.getVel().x),
                 Math.abs(shapes[1].body.getVel().y))));
        /*Tienes que implementar colision, que disminuira de la vida al objeto más o menos dependiendo del tipo,
        ademas de actualizar, que cambia el sprite, o hace desaparecer al objeto, en función de la disminución de la vida.*/
   }, colisionObjetoObjeto:function(arbiter, space) {
        var shapes = arbiter.getShapes();
        var maximaVelocidad = Math.max(Math.max(Math.abs(shapes[0].body.getVel().x),
                                  Math.abs(shapes[0].body.getVel().y)),
                                   Math.max(Math.abs(shapes[1].body.getVel().x),
                                   Math.abs(shapes[1].body.getVel().y)));
        shapes[1]["object"].colision(maximaVelocidad);
        shapes[0]["object"].colision(maximaVelocidad);
   }, colisionObjetoSuelo:function(arbiter, space) {
        var shapes = arbiter.getShapes();
        shapes[0]["object"].colision(Math.max(Math.abs(shapes[0].body.getVel().x), Math.abs(shapes[0].body.getVel().y)));
   }, colisionProyectilAlien:function(arbiter, space) {
        var shapes = arbiter.getShapes();
        if (this.proyectilActivo instanceof ProyectilOvni && arbiter.getShapes()[0] == this.proyectilActivo.shapeProyectil) {
            this.animacionExplosionNave(this.proyectilActivo.spriteProyectil.getPosition());
            this.eliminarProyectil(this.proyectilActivo);
            return;
        }
        shapes[1]["alien"].colision(Math.max(Math.max(Math.abs(shapes[0].body.getVel().x),
                Math.abs(shapes[0].body.getVel().y)), Math.max(Math.abs(shapes[1].body.getVel().x),
                Math.abs(shapes[1].body.getVel().y))), true);
   }, colisionObjetoAlien:function(arbiter, space) {
        var shapes = arbiter.getShapes();
        shapes[1]["alien"].colision(Math.max(Math.max(Math.abs(shapes[0].body.getVel().x),
                Math.abs(shapes[0].body.getVel().y)), Math.max(Math.abs(shapes[1].body.getVel().x),
                Math.abs(shapes[1].body.getVel().y))), false);
   }, colisionDisparoOvniAlien:function(arbiter, space) {
        var shapes = arbiter.getShapes();
        shapes[1]["alien"].colision(10000, false);
        this.eliminarShape(shapes[0]);
   }, colisionDisparoOvniObjeto:function(arbiter, space) {
        var shapes = arbiter.getShapes();
        shapes[1]["object"].colision(10000, false);
        this.eliminarShape(shapes[0]);
   }, colisionDisparoOvniSuelo:function(arbiter, space) {
        var shapes = arbiter.getShapes();
        this.eliminarShape(shapes[0]);
   }, colisionAlienSuelo:function(arbiter, space) {
        var shapes = arbiter.getShapes();
        shapes[0]["alien"].colision(Math.max(Math.abs(shapes[0].body.getVel().x), Math.abs(shapes[0].body.getVel().y)), false);
   }, eliminarObjeto:function(objeto) {
        this.objetosEliminar.push(objeto);
   }, eliminarObjetos:function() {
        for (var i = 0; i < this.objetosEliminar.length; i++) {
            this.objetos.splice(this.objetos.indexOf(this.objetosEliminar[i]), 1);
            this.removeChild(this.objetosEliminar[i].sprite);
            this.space.removeBody(this.objetosEliminar[i].sprite.body);
            this.space.removeShape(this.objetosEliminar[i].shape);
        }
        this.objetosEliminar = [];
   }, eliminarAlien:function(alien) {
        this.aliensEliminar.push(alien);
   }, eliminarAliens:function() {
        for (var i = 0; i < this.aliensEliminar.length; i++) {
            cc.audioEngine.playEffect(res.muerte_alien_wav);
            this.aliens.splice(this.aliens.indexOf(this.aliensEliminar[i]), 1);
            this.removeChild(this.aliensEliminar[i].sprite);
            this.space.removeBody(this.aliensEliminar[i].sprite.body);
            this.space.removeShape(this.aliensEliminar[i].shape);
        }
        this.aliensEliminar = [];
   }, eliminarProyectil:function(proyectil) {
        this.proyectilesEliminar.push(proyectil);
   }, eliminarProyectiles:function() {
        for (var i = 0; i < this.proyectilesEliminar.length; i++) {
            if (this.space.containsBody(this.proyectilesEliminar[i].bodyProyectil))
                this.space.removeBody(this.proyectilesEliminar[i].bodyProyectil);
            if (this.space.containsShape(this.proyectilesEliminar[i].shapeProyectil))
                this.space.removeShape(this.proyectilesEliminar[i].shapeProyectil);
            this.removeChild(this.proyectilesEliminar[i].spriteProyectil);
            if (this.proyectilesEliminar[i] instanceof ProyectilOvni)
                this.proyectilesEliminar[i].eliminado = true;
            if (this.proyectilesEliminar[i] == this.proyectilActivo)
                this.proyectilActivo = null;
        }
        this.proyectilesEliminar = [];
   }, eliminarShape:function(shape) {
        this.shapesEliminar.push(shape);
   }, eliminarShapes:function() {
        for (var i = 0; i < this.shapesEliminar.length; i++) {
            if (this.space.containsBody(this.shapesEliminar[i].body))
                this.space.removeBody(this.shapesEliminar[i].body);
            if (this.space.containsShape(this.shapesEliminar[i]))
                this.space.removeShape(this.shapesEliminar[i]);
            this.removeChild(this.shapesEliminar[i]["mySprite"]);
        }
        this.shapesEliminar = [];
   }, actualizarDisparo:function(dt) {
        if (this.proyectilActivo instanceof ProyectilOvni)
            this.proyectilActivo.disparar(dt, this.aliens);
   }, perderPartida:function() {
        cc.director.pause();
        //cc.audioEngine.stopMusic();
        this.getParent().addChild(new GameOverLayer());
   }, ganarPartida:function() {
        cc.director.pause();
        //cc.audioEngine.stopMusic();
        this.getParent().addChild(new WinLayer());
   }, animacionExplosionNave:function(posicion) {
        var framesAnimacion = [];
        for (var i = 1; i <= 3; i++) {
            var str = "explosion_nave_0" + i + ".png";
            var frame = cc.spriteFrameCache.getSpriteFrame(str);
            framesAnimacion.push(frame);
        }
        var animacion = new cc.Animation(framesAnimacion, 0.2);
        var actionAnimacionBucle = new cc.Animate(animacion);
        console.log(actionAnimacionBucle);
        sprite = new cc.Sprite("#explosion_nave_01.png");
        sprite.setScaleX(0.1);
        sprite.setScaleY(0.1);
        sprite.setPosition(posicion);
        sprite["myAnimacion"] = actionAnimacionBucle;
        cc.audioEngine.playEffect(res.explosion_nave_mp3);
        sprite.runAction(actionAnimacionBucle);
        this.addChild(sprite, 100);
        this.spritesAnimacionesEliminar.push(sprite);
        console.log(sprite["myAnimacion"]);
   }, eliminarSpritesAnimaciones:function() {
        var spritesEliminar = [];
        for (var i = 0; i < this.spritesAnimacionesEliminar.length; i++) {
            if (this.spritesAnimacionesEliminar[i]["myAnimacion"].isDone()) {
                this.spritesAnimacionesEliminar[i].removeFromParent();
                spritesEliminar.push(this.spritesAnimacionesEliminar[i]);
            }
        }
        for (var j = 0; j < spritesEliminar.length; j++) {
            this.spritesAnimacionesEliminar.splice(this.spritesAnimacionesEliminar.indexOf(spritesEliminar[j]), 1);
        }
   }
});

var GameScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        cc.audioEngine.playMusic(res.sonido_bucle, true);
        var layer = new GameLayer();
        this.addChild(layer);
        //var controlesLayer = new ControlesLayer();
        //this.addChild(controlesLayer, 0, idCapaControles);
    }
});
