/////////////////////////////////////////////////////////////////////
// CLASSE POINT PONTO

function Point(x, y, id, layer) {
  this.x = x;
  this.y = y;
  this.id = id;
  this.translation = vec3(0, 0, 0);
  this.layer = layer;

  this.fazVertices(0.007);
  this.bufferP(colorBranco, this.vertices, layer);
  this.fazVertices(0.04); // margem de erro para clicar
}

Point.prototype.translateP = function(x, y) {
  this.translation[0] += x;
  this.translation[1] += y;
};

Point.prototype.clicouP = function() {
  this.fazVertices(0.012);
  this.bufferP(colorBlue, this.vertices, this.layer);
};

Point.prototype.desclicouP = function() {
  this.fazVertices(0.007);
  this.bufferP(colorBranco, this.vertices, this.layer);
  this.fazVertices(0.04); // margem de erro para clicar
};

Point.prototype.fazVertices = function(t) {
  this.vertices = [
    vec4( this.x + t, this.y - t, 0.0, 1.0 ),
    vec4( this.x + t, this.y + t, 0.0, 1.0 ),
    vec4( this.x - t, this.y - t, 0.0, 1.0 ),
    vec4( this.x - t, this.y - t, 0.0, 1.0 ),
    vec4( this.x - t, this.y + t, 0.0, 1.0 ),
    vec4( this.x + t, this.y + t, 0.0, 1.0 )
  ];
}

Point.prototype.bufferP = function(col, ver, l) {
  this.nBuffer = layers[l].gl.createBuffer();
  layers[l].gl.bindBuffer( layers[l].gl.ARRAY_BUFFER, this.nBuffer );
  layers[l].gl.bufferData( layers[l].gl.ARRAY_BUFFER, flatten(col), layers[l].gl.STATIC_DRAW );

  this.vNormal = layers[l].gl.getAttribLocation( layers[l].program, "vNormal" );
  layers[l].gl.vertexAttribPointer( this.vNormal, 4, layers[l].gl.FLOAT, false, 0, 0 );
  layers[l].gl.enableVertexAttribArray( this.vNormal );

  this.vBuffer = layers[l].gl.createBuffer();
  layers[l].gl.bindBuffer( layers[l].gl.ARRAY_BUFFER, this.vBuffer );
  layers[l].gl.bufferData( layers[l].gl.ARRAY_BUFFER, flatten(ver), layers[l].gl.STATIC_DRAW );
  
  this.vPosition = layers[l].gl.getAttribLocation(layers[l].program, "vPosition");
  layers[l].gl.vertexAttribPointer(this.vPosition, 4, layers[l].gl.FLOAT, false, 0, 0);
  layers[l].gl.enableVertexAttribArray(this.vPosition);
}

Point.prototype.renderP = function(l) {
  var modelViewMatrix = lookAt(eye, at, up);
  var modelViewMatrix = mult(modelViewMatrix, translate(this.translation));

  layers[l].gl.bindBuffer( layers[l].gl.ARRAY_BUFFER, this.nBuffer );
  layers[l].gl.vertexAttribPointer( this.vNormal, 4, layers[l].gl.FLOAT, false, 0, 0 );

  layers[l].gl.bindBuffer( layers[l].gl.ARRAY_BUFFER, this.vBuffer );
  layers[l].gl.vertexAttribPointer( this.vPosition, 4, layers[l].gl.FLOAT, false, 0, 0);

  layers[l].gl.uniformMatrix4fv(layers[l].modelViewMatrixLoc , false, flatten(modelViewMatrix ));
  layers[l].gl.uniformMatrix4fv(layers[l].projectionMatrixLoc, false, flatten(projectionMatrix));

  layers[l].gl.drawArrays( layers[l].gl.TRIANGLES, 0, 6 );
};