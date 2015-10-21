/////////////////////////////////////////////////////////////////////////
////// CLASS LAYER

function Layer(id) {
  this.id = id;
  this.numeroMaxPontos = 5;
  this.grauPolinomio = 2;
  this.rotationMatrix = mat4(1);
}

Layer.prototype.init = function(cv) {
  this.canvas = document.getElementById( cv );

  this.quantidadePontos = 0;  // quantidade de objetos na tela
  this.points = []; // vetor de CLASSE ponto
  this.pointSelecionado = -1; // id do ponto que foi clicado
  this.segmentoDeReta = new Segmento(this.id-1); // uma classe que fica gravado todos os segmentos de retas que serao desenhados
  this.classTrackball = new Trackball(vec3(0.0,0.0,0.0), 0.1);
  
  
  this.gl = WebGLUtils.setupWebGL( this.canvas );
  if ( !this.gl ) { alert( "WebGL isn't available" ); }

  // create viewport and clear color
  this.gl.viewport( 0, 0, this.canvas.width, this.canvas.height );

  if(this.id == 3) this.gl.clearColor( 0.15, 0.15, 0.15, 1.0 );
  else this.gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
  
  // enable depth testing for hidden surface removal\
  this.gl.enable(this.gl.DEPTH_TEST);

    //  load shaders and initialize attribute buffers
  this.program = initShaders( this.gl, "vertex-shader", "fragment-shader" );
  this.gl.useProgram( this.program );
  
  this.modelViewMatrixLoc  = this.gl.getUniformLocation(this.program, "modelViewMatrix");
  this.projectionMatrixLoc = this.gl.getUniformLocation(this.program, "projectionMatrix");

  // uma dessas matrizes vai ser uma matrix nula e a outra identidade
  this.matrix1Loc = this.gl.getUniformLocation(this.program, "m1");
  this.matrix2Loc = this.gl.getUniformLocation(this.program, "m2");

  this.gl.uniform4fv(this.gl.getUniformLocation(this.program, "ambientProduct" ), flatten(ambientProduct) );
  this.gl.uniform4fv(this.gl.getUniformLocation(this.program, "diffuseProduct" ), flatten(diffuseProduct) );
  this.gl.uniform4fv(this.gl.getUniformLocation(this.program, "specularProduct"), flatten(specularProduct));  
  this.gl.uniform4fv(this.gl.getUniformLocation(this.program, "lightPosition"  ), flatten(lightPosition)  );
  this.gl.uniform1f (this.gl.getUniformLocation(this.program, "shininess"      ), materialShininess       );
};

Layer.prototype.fazerSegmentoBSpline = function(l) {
  this.curva1 = new Segmento(this.id-1);
  // if l == 0 , desenhar curva fechada 
  // else if l == 1, desenhar curva aberta, com interpolacao nos extremos

  // this.point é o vetor da classe de pontos desse layer!
  this.curva1.desenhaCurva(this.points, this.grauPolinomio, l);
}

Layer.prototype.deletarUltimoPonto = function () {
  if(this.quantidadePontos != 0) {
    this.points.pop();
    this.segmentoDeReta.deletaUltimoPonto();
    this.quantidadePontos--;
    this.fazerSegmentoBSpline(i);
  }
}

Layer.prototype.atualizaDesenho3D = function(rt) {
  if(layers[0].quantidadePontos >= 4 && layers[1].quantidadePontos >= 4 && rt) 
    this.canudo.criarCurva3D( layers[0].curva1.vertices, layers[1].curva1.vertices );
}