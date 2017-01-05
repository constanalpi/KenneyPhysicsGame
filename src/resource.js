var res = {
    HelloWorld_png : "res/HelloWorld.png",
    CloseNormal_png : "res/CloseNormal.png",
    CloseSelected_png : "res/CloseSelected.png",
    boton_nivel_1: "res/nivel_1.png",
    boton_nivel_2: "res/nivel_2.png",
    menu_titulo_png : "res/menu_titulo.png",
    mapa1_tmx: "res/mapa1.tmx",
    tiles32_png: "res/tiles32.png",
    glass11: "res/glass11.png",
    glass21: "res/glass21.png",
    wood11: "res/wood11.png",
    wood21: "res/wood21.png",
    stone11: "res/stone11.png",
    stone21: "res/stone21.png"
};

var g_resources = [];
for (var i in res) {
    g_resources.push(res[i]);
}