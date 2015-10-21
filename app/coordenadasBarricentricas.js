/////////////////////////////////////////////////////////////////////////

// Funcao que retorne TRUE caso o ponto P esteja dentro do
// triangulo com vertices nas coordenadas A B C
function barycentric (A, B, C, P){
  // Compute vectors
  var a = vec3(A);
  var b = vec3(B);
  var c = vec3(C);
  var p = vec3(P);

  var v0 = subtract(c, a);
  var v1 = subtract(b, a);
  var v2 = subtract(p, a);

  // Compute dot products
  var dot00 = dot(v0, v0);
  var dot01 = dot(v0, v1);
  var dot02 = dot(v0, v2);
  var dot11 = dot(v1, v1);
  var dot12 = dot(v1, v2);

  // Compute barycentric coordinates
  var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
  var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
  var v = (dot00 * dot12 - dot01 * dot02) * invDenom;

  // Check if point is in triangle
  return (u >= 0) && (v >= 0) && (u + v < 1);
}

// Multiplica a matriz m pelo vetor vec
function multMat4Vec4 (m, vec) {
  var tv = [];

  tv[0] = m[0][0] * vec[0] + m[0][1] * vec[1] + m[0][2] * vec[2] + m[0][3] * vec[3];
  tv[1] = m[1][0] * vec[0] + m[1][1] * vec[1] + m[1][2] * vec[2] + m[1][3] * vec[3];
  tv[2] = m[2][0] * vec[0] + m[2][1] * vec[1] + m[2][2] * vec[2] + m[2][3] * vec[3];
  tv[3] = m[3][0] * vec[0] + m[3][1] * vec[1] + m[3][2] * vec[2] + m[3][3] * vec[3];

  return tv;
}

// Dada a coordenada e a matriz de projecao multiplicada pela matriz de modelagem
// devolve a coordenada desse vetor na tela 2D e a sua profundidade com relacao a camera
function unproject (vec, im) {

  var dest = []; //output
  var tv = [];   //transformed vector

  tv = multMat4Vec4(im, vec);
  if(tv[3] == 0.0) { return null; }

  dest[0] = tv[0] / tv[3];
  dest[1] = tv[1] / tv[3];
  dest[2] = tv[2] / tv[3];
  dest[3] = 0.0;

  return dest;
}

// Funcao que é chamada ao tentar selecionar um objeto, primeiramente veremos se o raio
// emitido pelo click do mouse intersecta algum bounding box, (olhando para todos os obj em cena)
// case isso ocorra com um objeto, todos os trinagulos dele serao verificados
// Aquele que tiver a menor profundidade sera o obj a ser selecionado
function intersect(pontoTela, l) {  

  var i, k;
  var mMatrix;
  var pMatrix = ortho(xleft, xright, ybottom, ytop, znear, zfar);
  var im; // > mMatrix * pMatrix;
  var eye = vec3(cradius * Math.sin(ctheta) * Math.cos(cphi), 
             cradius * Math.sin(ctheta) * Math.sin(cphi),
             cradius * Math.cos(ctheta));

  var w = layers[l].canvas.width, h = layers[l].canvas.height;

  var v1,v2,v3;
  var maisProximo = 0;
  var profundidade;

  // para cada objeto, ver se o raio passa pelo bounding box dele
  for(i = 0; i < layers[l].quantidadePontos; ++i) {
    mMatrix = lookAt(eye, at, up);
    mMatrix = mult(mMatrix, translate(layers[l].points[i].translation));

    im = mult(pMatrix, mMatrix);

    // cada face do box, temos dois triangulos
    if(barycentric(unproject (layers[l].points[i].vertices[0], im),
                   unproject (layers[l].points[i].vertices[1], im),
                   unproject (layers[l].points[i].vertices[2], im), pontoTela) ||
       barycentric(unproject (layers[l].points[i].vertices[3], im),
                   unproject (layers[l].points[i].vertices[4], im),
                   unproject (layers[l].points[i].vertices[5], im), pontoTela) ) {
      return i;
    }
  }
  // Apos comparar todos os objetos, vemos quais foram os objetos "selecionados" até então, e se tiver mais que um
  // vamos comparar os triangulos intersectados de cada objeto, aquele que tiver a menor profundidade é então selecionado
  return -1;
}