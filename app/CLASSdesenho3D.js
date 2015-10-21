/////////////////////////////////////////////////////////////////////////
////// CLASS DESENHO3D

function Desenho3D() {
  this.vertices = [];
  this.normal = [];

  this.pointsArray  = []; // manipulador!
  this.normalsArray = []; // manipulador!

  this.layer = 2;
}

Desenho3D.prototype.criarCurva3D = function(curvaFechada, caminho) {
  this.center = [];
  this.curva1 = curvaFechada;
  this.curva2 = caminho;
  // achar max
  // min
  // centrto
  // botar o centro da imagem no centro da tela
  // escalar para deixar pequenininho
  // x = -z, rotacioar no eixo y 90
  // colocar imagem no centro do caminho
  // rotacionar de acordo com a tangente do caminho
  this.vertices = [];
  this.normal = [];

  var xmax =  100;
  var xmin = -100;
  var ymax =  100;
  var ymin = -100;

  for(i = 0; i < curvaFechada.length; i++) {
    if(curvaFechada[i][0] > xmax) xmax = curvaFechada[i][0];
    else if(curvaFechada[i][0] < xmin) xmin = curvaFechada[i][0];
    if(curvaFechada[i][1] > ymax) ymax = curvaFechada[i][1];
    else if(curvaFechada[i][1] < ymin) ymin = curvaFechada[i][1];
  }

  this.center[0] = (xmax+xmin)/2;
  this.center[1] = (ymax+ymin)/2;

  for(i = 0; i < curvaFechada.length; i++) {
    curvaFechada[i][0] = (curvaFechada[i][0] - this.center[0]);
    curvaFechada[i][1] = (curvaFechada[i][1] - this.center[1]);

    curvaFechada[i][2] = -curvaFechada[i][0];
    curvaFechada[i][0] = 0;
  }

  for(j = 1; j < caminho.length - 1; j++) {
    // Para cada ponto do caminho que a curva fechada tem que
    // percorrer, acha as faces com esse ponto e o proximo;
    for(i = 0; i < curvaFechada.length; i++) {
      var x1 =                      caminho[j][0];
      var y1 = curvaFechada[i][1] + caminho[j][1]; 
      var z1 = curvaFechada[i][2];

      var x2 =                                              caminho[j][0];
      var y2 = curvaFechada[(i+1)%curvaFechada.length][1] + caminho[j][1]; 
      var z2 = curvaFechada[(i+1)%curvaFechada.length][2];

      var x3 =                      caminho[j+1][0];
      var y3 = curvaFechada[i][1] + caminho[j+1][1]; 
      var z3 = curvaFechada[i][2];

      // achar normal
      var norm = calculaNormal(vec4(x3, y3, z3, 1.0), vec4(x2, y2, z2, 1.0),vec4(x1, y1, z1, 1.0));
      
      this.vertices.push(vec4(x1, y1, z1, 1.0));
      this.vertices.push(vec4(x2, y2, z2, 1.0));
      this.vertices.push(vec4(x3, y3, z3, 1.0));
      this.normal.push(norm);
      this.normal.push(norm);
      this.normal.push(norm);

      //x1 =                                         caminho[j][0]; // repetido!
      //y1 = curvaFechada[(i+1)%caminho.length][1] + caminho[j][1]; 
      //z1 = curvaFechada[(i+1)%caminho.length][2];

      x1 =                                              caminho[j+1][0];
      y1 = curvaFechada[(i+1)%curvaFechada.length][1] + caminho[j+1][1]; 
      z1 = curvaFechada[(i+1)%curvaFechada.length][2];

      //x3 =                      caminho[j+1][0]; // repetido!
      //y3 = curvaFechada[i][1] + caminho[j+1][1]; 
      //z3 = curvaFechada[i][2];

      // achar normal
      norm = calculaNormal(vec4(x1, y1, z1, 1.0), vec4(x2, y2, z2, 1.0),vec4(x3, y3, z3, 1.0));
      
      this.vertices.push(vec4(x1, y1, z1, 1.0));
      this.vertices.push(vec4(x2, y2, z2, 1.0));
      this.vertices.push(vec4(x3, y3, z3, 1.0));
      this.normal.push(norm);
      this.normal.push(norm);
      this.normal.push(norm);
    }
  }

  //alert("v" + this.vertices.length);
  //alert("n" + this.normal.length);

  this.bufferD(this.layer); 
}

function calculaNormal(a, b, c) {
     var t1 = subtract(b, a);
     var t2 = subtract(c, b);
     var normal = vec4(cross(t1, t2), 0);

     return normal;     
}


Desenho3D.prototype.manipuladorT = function(l) {
  this.pointsArray.push(vec4( 0.0    , 0.0  , 0.0 , 1.0)); // linha x
  this.pointsArray.push(vec4( 0.0    , 0.5  , 0.0 , 1.0)); 
  this.pointsArray.push(vec4(-0.04242, 0.5  , 0.0 , 1.0)); // triangulo x
  this.pointsArray.push(vec4( 0.04242, 0.5  , 0.0 , 1.0));
  this.pointsArray.push(vec4( 0.0    , 0.56 , 0.0 , 1.0)); 

  this.pointsArray.push(vec4( 0.0 , 0.0 , 0.0    , 1.0)); //linha x
  this.pointsArray.push(vec4( 0.5 , 0.0 , 0.0    , 1.0));
  this.pointsArray.push(vec4( 0.5 , 0.0 ,-0.04242, 1.0)); //triangulo y
  this.pointsArray.push(vec4( 0.5 , 0.0 , 0.04242, 1.0));
  this.pointsArray.push(vec4( 0.56, 0.0 , 0.0    , 1.0)); 

  this.pointsArray.push(vec4( 0.0    , 0.0 , 0.0 , 1.0)); // linha z
  this.pointsArray.push(vec4( 0.0    , 0.0 , 0.5 , 1.0));
  this.pointsArray.push(vec4(-0.04242, 0.0 , 0.5 , 1.0)); // triangulo z
  this.pointsArray.push(vec4( 0.04242, 0.0 , 0.5 , 1.0));
  this.pointsArray.push(vec4( 0.0    , 0.0 , 0.56, 1.0)); 

  // aqui eh usado como vetor normal, mas colocaremos os vetores das cores RGB
  for(i = 0; i < 5; i++) this.normalsArray.push(vec4( 1.0, 0.0, 0.0, 1.0 ));  // red
  for(i = 0; i < 5; i++) this.normalsArray.push(vec4( 0.0, 1.0, 0.0, 1.0 ));  // green
  for(i = 0; i < 5; i++) this.normalsArray.push(vec4( 0.0, 0.0, 1.0, 1.0 ));  // blue

  this.mColor = layers[l].gl.createBuffer();
  layers[l].gl.bindBuffer(layers[l].gl.ARRAY_BUFFER, this.mColor );
  layers[l].gl.bufferData( layers[l].gl.ARRAY_BUFFER, flatten(this.normalsArray), layers[l].gl.STATIC_DRAW );

  this.mColorLoc = layers[l].gl.getAttribLocation( layers[l].program, "vNormal" );
  layers[l].gl.vertexAttribPointer( this.mColorLoc, 4, layers[l].gl.FLOAT, false, 0, 0 );
  layers[l].gl.enableVertexAttribArray( this.mColorLoc );

  this.mBuffer = layers[l].gl.createBuffer();
  layers[l].gl.bindBuffer( layers[l].gl.ARRAY_BUFFER, this.mBuffer );
  layers[l].gl.bufferData( layers[l].gl.ARRAY_BUFFER, flatten(this.pointsArray), layers[l].gl.STATIC_DRAW );
  
  this.mPosition = layers[l].gl.getAttribLocation( layers[l].program, "vPosition");
  layers[l].gl.vertexAttribPointer( this.mPosition, 4, layers[l].gl.FLOAT, false, 0, 0);
  layers[l].gl.enableVertexAttribArray(this.mPosition);
}

Desenho3D.prototype.bufferD = function(l) {
  this.nBuffer = layers[l].gl.createBuffer();
  layers[l].gl.bindBuffer( layers[l].gl.ARRAY_BUFFER, this.nBuffer );
  layers[l].gl.bufferData( layers[l].gl.ARRAY_BUFFER, flatten(this.normal), layers[l].gl.STATIC_DRAW );

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

Desenho3D.prototype.renderD = function(l) {
  //var modelViewMatrix = lookAt(eye, at, up);

  layers[l].gl.bindBuffer( layers[l].gl.ARRAY_BUFFER, this.nBuffer );
  layers[l].gl.vertexAttribPointer( this.vNormal, 4, layers[l].gl.FLOAT, false, 0, 0 );

  layers[l].gl.bindBuffer( layers[l].gl.ARRAY_BUFFER, this.vBuffer );
  layers[l].gl.vertexAttribPointer( this.vPosition, 4, layers[l].gl.FLOAT, false, 0, 0);

  //layers[l].gl.uniformMatrix4fv(layers[l].modelViewMatrixLoc , false, flatten(modelViewMatrix ));
  //layers[l].gl.uniformMatrix4fv(layers[l].projectionMatrixLoc, false, flatten(projectionMatrix));

  layers[l].gl.drawArrays( layers[l].gl.TRIANGLES, 0, this.vertices.length );
};

Desenho3D.prototype.renderDT = function(l) {
  var modelViewMatrix = lookAt(eye, at, up);
  modelViewMatrix = mult(modelViewMatrix, layers[l].rotationMatrix);

  layers[l].gl.bindBuffer( layers[l].gl.ARRAY_BUFFER, this.mColor );
  layers[l].gl.vertexAttribPointer( this.mColorLoc, 4, layers[l].gl.FLOAT, false, 0, 0 );

  layers[l].gl.bindBuffer( layers[l].gl.ARRAY_BUFFER, this.mBuffer );
  layers[l].gl.vertexAttribPointer( this.mPosition, 4, layers[l].gl.FLOAT, false, 0, 0);

  layers[l].gl.uniformMatrix4fv(layers[l].modelViewMatrixLoc , false, flatten(modelViewMatrix ));
  layers[l].gl.uniformMatrix4fv(layers[l].projectionMatrixLoc, false, flatten(projectionMatrix));

  layers[l].gl.drawArrays( layers[l].gl.LINES,     0 , 2 ); // desenha a reta
  layers[l].gl.drawArrays( layers[l].gl.TRIANGLES, 2 , 3 ); // desenha o triangulo
  layers[l].gl.drawArrays( layers[l].gl.LINES,     5 , 2 );
  layers[l].gl.drawArrays( layers[l].gl.TRIANGLES, 7 , 3 );
  layers[l].gl.drawArrays( layers[l].gl.LINES,     10, 2 );
  layers[l].gl.drawArrays( layers[l].gl.TRIANGLES, 12, 3 );
};
