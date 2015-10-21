/////////////////////////////////////////////////////////////////////////
// CLASSE SEGMENTO

function Segmento(layer) {
  this.vertices = [];
  this.cor = [];
  this.layer = layer;
}

Segmento.prototype.adicionaPontoSegmento = function(p) {
  this.vertices.push(vec4(p));
  this.cor.push(vec4( 0.0, 0.3, 0.0, 1.0 ));
  this.bufferS(this.layer);
}

Segmento.prototype.deletaUltimoPonto = function() {
  this.vertices.pop();
  this.cor.pop();
  this.bufferS(this.layer);
}

Segmento.prototype.transladaPontoNoSegmento = function(i, x, y) {
  this.vertices[i][0] += x;
  this.vertices[i][1] += y;
  this.bufferS(this.layer);
}

function BSplineRecursivo(i, p, t, U) {
  if(p == 0) {
    if (U[i] <= t && t < U[i+1]) return 1;
    else return 0; 
  }

  var conta1 = U[i+p] - U[i];
  var conta2 = U[i+p+1] - U[i+1];
  if( conta1 != 0 ) conta1 = ((t - U[i])/conta1)     * BSplineRecursivo(i  , p-1, t, U); 
  if( conta2 != 0 ) conta2 = ((U[i+p+1] - t)/conta2) * BSplineRecursivo(i+1, p-1, t, U);

  return conta1 + conta2;
}

Segmento.prototype.desenhaCurva = function(P, p, c){
  // recebe todos o vetor que contem a classe de pontos, juntamente com as translacaoes
  // recebe o grau do poliomio
  // e se a curva é aberta (com intepolacao nas pontas) ou fechada, c == layer0 = fechado
  this.vertices.length = 0;
  this.cor.length = 0;

  var U = []; // vetor de nós
  var tamVetorNos = p + P.length-1 +1; // tamanho do vetor de nos, para dado numero de pontos de controle e o grau do plinomio
  
  // se a curva for aberta, os nos internos serao:
  var i1 = p + 1; // p+1;
  var i2 = tamVetorNos - p - 1; // m-p-1;

  if(i1 > i2) { // caso i1 seja maior, trocamos
    var i3 = i1;
    i1 = i2;
    i2 = i3;
  }

  // se devemos desenhar a curva fechada, repetiremos os vertices p+1 iniciais
  var curvaFechada = 0;
  if(c == 0) curvaFechada = p + 1;

  var numeroU = 0;
  if(curvaFechada > 0) { // Para desenhar a curva aberta, faz vetor U, com pesos iguais!
    for(i = 0; i <= tamVetorNos + (p + 3); ++i) U[i] = ++numeroU;
  } else {
    // enche vetor U para curva aberta
    numeroU = 1;
    for(i = 0; i < i1; ++i) U[i] = 0; // p elementos iniciais iguais a 0
    for(i = i1; i <= i2; ++i) U[i] = numeroU++;
    for(i = i2+1; i <= tamVetorNos; ++i) U[i] = numeroU; // p nós finais iguais
  }

  var t10 = numeroU/100.0;
  var init = 0.0 , fim = numeroU; 
  if (c == 0) {
    init = t10*25;
    fim = t10*75;
  } // COISA MAROTA PARA FICAR MENOS FEIO! nao sei como consertar!

  for(var t = init; t <= fim; t += t10) {
    var X = 0, Y = 0; // PONTOS da curva
    for(i = 0 ; i < P.length + curvaFechada; i++) { // fazer a somatoria de todos os pontos
      var N = BSplineRecursivo(i, p, t, U);
      
      X += (P[i%P.length].x + P[i%P.length].translation[0])*N;
      Y += (P[i%P.length].y + P[i%P.length].translation[1])*N;
    }
    this.vertices.push( vec4( X  , Y  , 0.0, 1.0));
    this.cor.push(      vec4( 1.0, 0.0, 0.0, 1.0));
  }
  this.bufferS(this.layer);
}

Segmento.prototype.bufferS = function(l) {
  this.nBuffer = layers[l].gl.createBuffer();
  layers[l].gl.bindBuffer( layers[l].gl.ARRAY_BUFFER, this.nBuffer );
  layers[l].gl.bufferData( layers[l].gl.ARRAY_BUFFER, flatten(this.cor), layers[l].gl.STATIC_DRAW );

  this.vNormal = layers[l].gl.getAttribLocation( layers[l].program, "vNormal" );
  layers[l].gl.vertexAttribPointer( this.vNormal, 4, layers[l].gl.FLOAT, false, 0, 0 );
  layers[l].gl.enableVertexAttribArray( this.vNormal );

  this.vBuffer = layers[l].gl.createBuffer();
  layers[l].gl.bindBuffer( layers[l].gl.ARRAY_BUFFER, this.vBuffer );
  layers[l].gl.bufferData( layers[l].gl.ARRAY_BUFFER, flatten(this.vertices), layers[l].gl.STATIC_DRAW );
  
  this.vPosition = layers[l].gl.getAttribLocation(layers[l].program, "vPosition");
  layers[l].gl.vertexAttribPointer(this.vPosition, 4, layers[l].gl.FLOAT, false, 0, 0);
  layers[l].gl.enableVertexAttribArray(this.vPosition);
}

Segmento.prototype.renderS = function(l) {
  var modelViewMatrix = lookAt(eye, at, up);

  layers[l].gl.bindBuffer( layers[l].gl.ARRAY_BUFFER, this.nBuffer );
  layers[l].gl.vertexAttribPointer( this.vNormal, 4, layers[l].gl.FLOAT, false, 0, 0 );

  layers[l].gl.bindBuffer( layers[l].gl.ARRAY_BUFFER, this.vBuffer );
  layers[l].gl.vertexAttribPointer( this.vPosition, 4, layers[l].gl.FLOAT, false, 0, 0);

  layers[l].gl.uniformMatrix4fv(layers[l].modelViewMatrixLoc , false, flatten(modelViewMatrix ));
  layers[l].gl.uniformMatrix4fv(layers[l].projectionMatrixLoc, false, flatten(projectionMatrix));

  //layers[l].gl.drawArrays( layers[l].gl.LINE_STRIP, 0, this.vertices.length );
  if(l == 1) layers[l].gl.drawArrays( layers[l].gl.LINE_STRIP, 0, this.vertices.length );
  if(l == 0) layers[l].gl.drawArrays( layers[l].gl.LINE_LOOP, 0, this.vertices.length );
};