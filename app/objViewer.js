//
//       Marcos Kazuya Yamazaki
//       NUSP: 7577622 
//       EP2-MAC420 Comp Grafica
//

var layers = [];
var modelViewMatrix   , projectionMatrix;

var realTime;

var lightPosition = vec4(  5.0, 5.0, 10.0, 0.0 );
var lightAmbient  = vec4(  0.2,  0.2,  0.2, 1.0 );
var lightDiffuse  = vec4(  1.0,  1.0,  1.0, 1.0 );
var lightSpecular = vec4(  1.0,  1.0,  1.0, 1.0 );

var materialAmbient   = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse   = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialSpecular  = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ambientColor, diffuseColor, specularColor;

var near    = -1.0;
var far     =  0.1;
var cradius =  4.0;
var ctheta  =  0.0;
var cphi    =  0.0;
var dr      =  1.0 * Math.PI/180.0;

var fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var aspect;       // Viewport aspect ratio

var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

// our universe
var xleft   = -1.0;
var xright  =  1.0;
var ybottom = -1.0;
var ytop    =  1.0;
var znear   = -100.0;
var zfar    =  100.0;

var colorBranco = [
  vec4( 1.0, 1.0, 1.0, 1.0 ),
  vec4( 1.0, 1.0, 1.0, 1.0 ),
  vec4( 1.0, 1.0, 1.0, 1.0 ),
  vec4( 1.0, 1.0, 1.0, 1.0 ),
  vec4( 1.0, 1.0, 1.0, 1.0 ),
  vec4( 1.0, 1.0, 1.0, 1.0 )
];

var colorBlue = [
  vec4( 0.0, 0.0, 1.0, 1.0 ),
  vec4( 0.0, 0.0, 1.0, 1.0 ),
  vec4( 0.0, 0.0, 1.0, 1.0 ),
  vec4( 0.0, 0.0, 1.0, 1.0 ),
  vec4( 0.0, 0.0, 1.0, 1.0 ),
  vec4( 0.0, 0.0, 1.0, 1.0 )
];

////////////////////////////////////////////////////////////////////////////////////////////


window.onload = function init() {
  aspect = 1; // canvas.width/canvas.height;
  realTime = true;
  // create light components
  ambientProduct = mult(lightAmbient, materialAmbient);
  diffuseProduct = mult(lightDiffuse, materialDiffuse);
  specularProduct = mult(lightSpecular, materialSpecular);

  document.getElementById("limpar1").onclick = function(){
      layers[0] = new Layer(1); layers[0].init("gl-canvas-1");
      layers[0].numeroMaxPontos = document.getElementById("numP1").value;
      layers[0].grauPolinomio = parseInt(document.getElementById("grau1").value);
  };
  document.getElementById("limpar2").onclick = function(){
      layers[1] = new Layer(2); layers[1].init("gl-canvas-2");
      layers[1].numeroMaxPontos = document.getElementById("numP2").value;
      layers[1].grauPolinomio = parseInt(document.getElementById("grau2").value);
  };

  document.getElementById('1a').onchange = function (evt) {
    document.getElementById("rag1").style.visibility = "visible";
    document.getElementById("bpl1").style.visibility = "hidden";
  };
   document.getElementById('1b').onchange = function (evt) {
    document.getElementById("rag1").style.visibility = "hidden";
    document.getElementById("bpl1").style.visibility = "visible";
  };
  document.getElementById('2a').onchange = function (evt) {
    document.getElementById("rag2").style.visibility = "visible";
    document.getElementById("bpl2").style.visibility = "hidden";
  };
  document.getElementById('2b').onchange = function (evt) {
    document.getElementById("rag2").style.visibility = "hidden";
    document.getElementById("bpl2").style.visibility = "visible";
  };

  document.getElementById('numP1').onchange = function (evt) {
    layers[0].numeroMaxPontos = document.getElementById("numP1").value;
    if(layers[0].quantidadePontos > layers[0].numeroMaxPontos) deletarUltimoPonto(0);
  };

  document.getElementById('numP2').onchange = function (evt) {
    layers[1].numeroMaxPontos = document.getElementById("numP2").value;
    if(layers[1].quantidadePontos > layers[1].numeroMaxPontos) deletarUltimoPonto(1);
  };

  document.getElementById('grau1').onchange = function (evt) {
    if(parseInt(document.getElementById("grau1").value)+2 <= layers[0].quantidadePontos) {
      layers[0].grauPolinomio = parseInt(document.getElementById("grau1").value);
      layers[0].fazerSegmentoBSpline(0);
      layers[2].atualizaDesenho3D(true);
    }
    else {
      document.getElementById("grau1").value = layers[0].grauPolinomio;
    }
  };

  document.getElementById('grau2').onchange = function (evt) {
    if(parseInt(document.getElementById("grau2").value)+2 <= layers[1].quantidadePontos) {
      layers[1].grauPolinomio = parseInt(document.getElementById("grau2").value);
      layers[1].fazerSegmentoBSpline(1);
      layers[2].atualizaDesenho3D(true);
    }
    else {
      document.getElementById("grau2").value = layers[1].grauPolinomio;
    }
  };

  document.getElementById("del1").onclick = function(){ 
    layers[0].deletarUltimoPonto();
    layers[2].atualizaDesenho3D(true);
  };
  document.getElementById("del2").onclick = function(){ 
    layers[1].deletarUltimoPonto(); 
    layers[2].atualizaDesenho3D(true);
    };
  document.getElementById('realTime').onchange = function (evt) {realTime = !realTime;};

  layers.push(new Layer(1));
  layers[0].init("gl-canvas-1");

  layers.push(new Layer(2));
  layers[1].init("gl-canvas-2");
  
  layers.push(new Layer(3));
  layers[2].init("gl-canvas-3");
  layers[2].canudo = new Desenho3D();
  layers[2].canudo.manipuladorT(2);

  render();
}

var render = function() {
  var i;

  eye = vec3(cradius * Math.sin(ctheta) * Math.cos(cphi), 
             cradius * Math.sin(ctheta) * Math.sin(cphi),
             cradius * Math.cos(ctheta));
  
  for(var l = 0; l < 3; l++){
    //layers[l].gl.clear( layers[l].gl.COLOR_BUFFER_BIT );
    layers[l].gl.clear( layers[l].gl.COLOR_BUFFER_BIT | layers[l].gl.DEPTH_BUFFER_BIT );

    projectionMatrix = ortho(xleft, xright, ybottom, ytop, znear, zfar);

    layers[l].gl.uniformMatrix4fv(layers[l].matrix1Loc, false, flatten(mat4(0)));
    layers[l].gl.uniformMatrix4fv(layers[l].matrix2Loc, false, flatten(mat4(1)));
  
    for( i = 0; i < layers[l].quantidadePontos; i++) layers[l].points[i].renderP(l); // desenha cada ponto
    if(layers[l].quantidadePontos >= 4) layers[l].curva1.renderS(l); // desenha a curva
    if(layers[l].quantidadePontos >  1) layers[l].segmentoDeReta.renderS(l); // desenha todos os segmentos que ligam os pontos
    
  }


  //layers[2].gl.clear( layers[2].gl.COLOR_BUFFER_BIT | layers[2].gl.DEPTH_BUFFER_BIT );
  layers[2].gl.clear( layers[2].gl.COLOR_BUFFER_BIT );
  projectionMatrix = perspective(fovy, aspect, near, far);

  if(layers[0].quantidadePontos >= 4 && layers[1].quantidadePontos >= 4) {
    layers[2].gl.uniformMatrix4fv(layers[2].matrix1Loc, false, flatten(mat4(1)));
    layers[2].gl.uniformMatrix4fv(layers[2].matrix2Loc, false, flatten(mat4(0)));
    layers[2].canudo.renderD(2);
  } 

  layers[2].gl.uniformMatrix4fv(layers[2].matrix1Loc, false, flatten(mat4(0)));
  layers[2].gl.uniformMatrix4fv(layers[2].matrix2Loc, false, flatten(mat4(1)));
  layers[2].canudo.renderDT(2);

  requestAnimFrame(render);
}