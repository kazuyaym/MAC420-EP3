// Funções para detectar quando um dos botões do mouse ou do teclado foram clicados
// e tambem localiza em que parte do canvas isso aconteceu para a geração do raio

// eventos do mouse e teclado
var mouseDownLeft  = false, 
    mouseDownRight = false, 
    oldX, 
    oldY, 
    newx, 
    newy,
    shift = false,
    canvasSelecionado = -1;

function elementPos(element) {
  var x = 0, y = 0;
  while(element.offsetParent) {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent;
  }
  return { x: x, y: y };
}

function eventPos(event) {
  return {
    x: event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
    y: event.clientY + document.body.scrollTop + document.documentElement.scrollTop
  };
}

function canvasMousePos(event, i) {
  var mousePos = eventPos(event);
  var canvasPos = elementPos(layers[i].canvas);
  return {
    x: mousePos.x - canvasPos.x,
    y: mousePos.y - canvasPos.y
  };
}

document.onmousedown = function(event) {
  var mouse;

  for(var i = 0; i < 3; i++){
    mouse = canvasMousePos(event, i);

    oldX = (2 * mouse.x / layers[i].canvas.width) - 1;
    oldY = (-1)*((2 * mouse.y / layers[i].canvas.height) - 1);  

    if(mouse.x >= 0 && mouse.x < layers[i].canvas.width && 
       mouse.y >= 0 && mouse.y < layers[i].canvas.height) {


      // clicou dentro do canvas
      if(event.button == 0) {
        mouseDownLeft = true;
        canvasSelecionado = i;

        // se o canvas selecionado for o 0 ou 1, add ou movimenta ponto!
        if(canvasSelecionado != 2) {
          layers[i].pointSelecionado = intersect(vec4(oldX, oldY, 0.0, 0.0), i);
          if(layers[i].pointSelecionado != -1) {
            layers[i].points[layers[i].pointSelecionado].clicouP();
          }
          else {
            // Adiciona novo ponto no canvas caso nao tenha clicado encima de outro
            if(layers[i].quantidadePontos < layers[i].numeroMaxPontos) {
              layers[i].points.push(new Point(oldX, oldY, layers[i].quantidadePontos, i));
              layers[i].segmentoDeReta.adicionaPontoSegmento( vec4( oldX, oldY, 0.0, 1.0));
              layers[i].quantidadePontos++;
              layers[i].fazerSegmentoBSpline(i);

              layers[2].atualizaDesenho3D(true);
            }
          }
        }
      } else if(event.button == 2) 
        mouseDownRight = true;
        canvasSelecionado = i;
      // disable selection because dragging is used for rotating the camera and moving objects
      return false;
    }
  }

  return true;
};

document.onmousemove = function(event) {
  if(canvasSelecionado != -1) {
    var i     = canvasSelecionado;
    var mouse = canvasMousePos(event, i);
    var newx, newy;

    // pega os novos valores do local no canvas em que o mouse esta
    newx =       (2 * mouse.x / layers[i].canvas.width ) - 1;
    newy = (-1)*((2 * mouse.y / layers[i].canvas.height) - 1);

    if(mouse.x >= 0 && mouse.x < layers[i].canvas.width && 
       mouse.y >= 0 && mouse.y < layers[i].canvas.height) {
      
      if(canvasSelecionado == 2 && mouseDownLeft) {
        if(!(newx == oldX && newy == oldY)) {
          layers[2].rotationMatrix = mult( layers[2].rotationMatrix , 
                                           layers[2].classTrackball.rotation(100*newx, 100*newy, oldX, oldY ) );
        }
      }
      if(mouseDownLeft && layers[i].pointSelecionado != -1) {
        //alert(layers[2].rotationMatrix);
        layers[i].points[layers[i].pointSelecionado].translateP(newx-oldX, newy-oldY); 
        layers[i].segmentoDeReta.transladaPontoNoSegmento(layers[i].pointSelecionado, newx-oldX, newy-oldY); 
        layers[i].fazerSegmentoBSpline(i);

        layers[2].atualizaDesenho3D(realTime);
      }
    }

    if(mouseDownRight) {
      // Zoom in and zoom out, se o mouse for mexido
      // para cima ou para o lado direito,
      // os objetos irão se aumentar

      // Neste caso fazemos o zoom aumentando ou diminuindo o angulo de visao da camera 
      // Mas sem deixar inverter toda a imagem, por isso sempre verificamos se fovy continua sendo positivo
      if( fovy - (newx-oldX)*10 > 0 || fovy - (newy-oldY)*10 > 0 ) {
        fovy -= (newx-oldX)*10;
        fovy -= (newy-oldY)*10;
      }
    }

    // guarda os valores do mouse
    // para que se possa calcular a diferenca
    // na proxima iteracao
    oldX = newx
    oldY = newy;
  }
};

document.onmouseup = function(event) {
  mouseDownLeft  = false;
  mouseDownRight = false;

  if(canvasSelecionado != -1) {
    for(var i = 0; i < layers[canvasSelecionado].quantidadePontos; i++)
      layers[canvasSelecionado].points[i].desclicouP();
    layers[canvasSelecionado].pointSelecionado = -1;
    canvasSelecionado = -1;

    layers[2].atualizaDesenho3D(!realTime);
  }
};