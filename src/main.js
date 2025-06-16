//Importamos las funciones y clases necesarias desde sus respectivos módulos
import { crearMapeoBaseTetriminos } from './utils/tetriminoUtils.js';
import { Board } from './board.js';
import { Piece } from './piece.js';

//==========================
//ESTADO GLOBAL DEL JUEGO
//Qué aprendés con esto:
//Cómo se inicializa el juego.
//Cómo se dibuja y actualiza todo en pantalla.
//Cómo se manejan las teclas (incluyendo velocidad y acciones).
//Cómo se reinicia el juego.
//Cómo se calculan las animaciones visuales del puntaje.
//==========================

const gameState = {
    puntaje: 0, // Puntaje actual del jugador
    puntajeAnimado: 0, // Puntaje interpolado (para una animación visual suave)
    lineasHechas: 0, // Cantidad de líneas completadas
    nivel: 1, // Nivel inicial
    velocidadCaida: 500, // Tiempo en ms entre caídas
    animacionesFlotantes: [], // Lista de puntos flotantes que se animan al ganar puntos
    juegoPausado: false, // Estado de pausa
    juegoTerminado: false, // "Game Over"
    tiempoMensajeReinicio: 0, // Marca cuándo se reinició el juego (para mostrar mensaje)
    mensajeNivel: null,  // Texto temporal para mostrar el mensaje de nivel
    tiempoMensajeNivel: 0,  // Cuándo se activó el mensaje
    DURACION_MENSAJE_NIVEL: 1000,  // Duración del mensaje en milisegundos
};

const DURACION_MENSAJE_REINICIO = 2000; // Duración en ms (2000 milisegundos = 2 segundos) del mensaje de "New Game"
const MARGEN_TABLERO = 10; // Espacio de margen alrededor del tablero

let board; // Instancia del tablero
let piece; // Instancia de la pieza actual
let coloresTetriminos; // Diccionario con los colores de las piezas
let tetriminosBase; // Diccionario con las formas base de las piezas

// Variables para regular velocidad de teclas y caída automática
let regulador_velocidad_teclas = 0;
let regulador_de_caida = 0;
let límite_regulador_velocidad_teclas = 100;

// ========================================
// P5 SETUP (se ejecuta una vez al inicio)
// ========================================
function setup() {
    // Asignación de colores a cada tipo de tetrimino
    coloresTetriminos = {
        I: color(255, 102, 102),     // Rojo pastel
        O: color(102, 102, 255),     // Azul pastel
        T: color(255, 255, 153),     // Amarillo pastel
        L: color(200, 128, 200),     // Morado pastel
        J: color(240, 240, 240),     // Gris claro
        S: color(144, 238, 144),     // Verde pastel
        Z: color(153, 255, 255)      // Cian pastel
    };

    // Carga las formas base de cada pieza
    tetriminosBase = crearMapeoBaseTetriminos();

    // Inicializa el tablero y la pieza actual
    board = new Board({ gameState, margen: MARGEN_TABLERO });
    piece = new Piece(tetriminosBase, coloresTetriminos, board);

    // Crea el canvas de p5.js con el tamaño adecuado al tablero
    createCanvas(
        board.ancho + 2 * MARGEN_TABLERO,
        board.alto + 2 * MARGEN_TABLERO + 2 * board.ladoCelda
    );
}

// ==========================
// P5 DRAW (se ejecuta 60 veces por segundo)
// ==========================
function draw() {

    if (gameState.juegoTerminado) {
        clear(); // Limpia el canvas
        board.dibujar(); // Dibuja el tablero
        piece.dibujar(); // Última pieza fija
        dibujarPuntaje(); // Puntaje, líneas, nivel
        dibujarAnimacionesFlotantes(); // Animaciones de puntaje

        // 🟥 Fondo rojo unificado con transparencia, centrado sobre el tablero
        push(); // Guardamos el estilo de dibujo

        const centroX = width / 2;           // Centro horizontal del canvas
        const centroY = height / 2;          // Centro vertical del canvas

        const anchoRect = board.ancho;       // Igual al ancho del tablero
        const altoRect = 100;                // Alto suficiente para contener ambos textos
        const xRect = board.posicion.x + anchoRect / 2; // Centro X del rectángulo
        const yRect = centroY;               // Lo centramos verticalmente en el canvas

        // Fondo con transparencia
        rectMode(CENTER);
        //fill(200, 30, 30, 180);   // Rojo oscuro con transparencia
        fill(30, 30, 30, 180);    // Negro grisáceo con transparencia
        //fill(30, 30, 200, 180);   // Azul oscuro con transparencia
        //fill(30, 200, 30, 180);   // Verde fuerte con transparencia
        //fill(255, 165, 0, 180);   // Naranja (como fuego) con transparencia
        //fill(200, 0, 200, 180);   // Violeta con transparencia
        //fill(255, 255, 0, 180);   // Amarillo intenso con transparencia
        //fill(255, 255, 255, 180); // Blanco suave (transparente)
        //fill(0, 255, 255, 180);   // Cian brillante con transparencia
        //fill(255, 105, 180, 180); // Rosa fuerte (Hot Pink) con transparencia

        noStroke();
        rect(xRect, yRect, anchoRect, altoRect); // Fondo único

        // ✏️ Texto "Game Over"
        textAlign(CENTER, CENTER);
        textSize(48);
        fill(255);        // Blanco
        stroke(0);        // Contorno negro
        strokeWeight(3);
        text('GAME OVER', centroX, centroY - 16); // Primer texto, un poco más arriba

        // ✏️ Texto "Try again? Press N"
        textSize(26);
        text('TRY AGAIN PRESS N', centroX, centroY + 24); // Segundo texto, más abajo

        pop(); // Restauramos estilos gráficos anteriores

        return; // Cortamos el dibujo aquí
    }


    clear(); // Limpia el canvas

    // Animación suave del puntaje (interpolación hacia el valor real)
    gameState.puntajeAnimado += (gameState.puntaje - gameState.puntajeAnimado) * 0.02;
    gameState.puntajeAnimado = Math.round(gameState.puntajeAnimado);

    // Si el juego está pausado, muestra los elementos fijos y un mensaje
    if (gameState.juegoPausado) {
        board.dibujar();
        piece.dibujar();
        dibujarPuntaje();
        dibujarAnimacionesFlotantes();
        mostrarMensaje('Pause');
        return;
    }

    // Lógica normal del juego cuando está activo
    dibujarPuntaje(); // Dibuja líneas y puntaje
    board.dibujar(); // Dibuja el tablero
    piece.dibujar(); // Dibuja la pieza actual
    keyEventsTetris(); // Detecta teclas presionadas
    dibujarAnimacionesFlotantes(); // Dibuja puntos animados

    // Si está en tiempo de mostrar mensaje de reinicio
    if (millis() - gameState.tiempoMensajeReinicio < DURACION_MENSAJE_REINICIO) {
        mostrarMensaje('New Game');
    }

    // Mostrar mensaje de subida de nivel si está activo
    if (
        gameState.mensajeNivel &&
        millis() - gameState.tiempoMensajeNivel < gameState.DURACION_MENSAJE_NIVEL
    ) {
        mostrarMensaje(gameState.mensajeNivel);
    } else {
        gameState.mensajeNivel = null; // Limpiar mensaje pasado el tiempo
    }


    // =========================================
    // CAÍDA AUTOMÁTICA DE LA PIEZA SEGÚN NIVEL
    // =========================================

    /*  Este bloque reemplaza el setInterval original.
        Acá decidimos si ya pasó suficiente tiempo desde la última caída
        usando la variable `gameState.velocidadCaida`, que cambia al subir de nivel.
    */
    if (!gameState.juegoPausado) { //Solo cae automáticamente si el juego no está en pausa.
        // ¿Pasó el tiempo suficiente desde la última vez que cayó?
        const tiempoActual = millis(); // Tiempo actual en milisegundos

        if (tiempoActual - regulador_de_caida >= gameState.velocidadCaida) {  //Si pasó más tiempo del que indica la velocidad actual de caída, es hora de bajar la pieza. Ejemplo: si estamos en nivel 1, velocidadCaida = 500; si en nivel 2, será 375ms; etc.
            piece.moverAbajo(); // Baja la pieza una posición
            regulador_de_caida = tiempoActual; // Actualizamos el momento de la última caída
        }
    }

}

// ==========================
// Dibuja el puntaje y líneas en pantalla
// ==========================
function dibujarPuntaje() {
    push(); // Guarda el estado actual del dibujo (colores, estilos, etc.)

    textSize(32); // Tamaño de fuente
    drawingContext.shadowColor = 'rgba(0,0,0,0.5)'; // Sombra suave
    drawingContext.shadowBlur = 4;
    drawingContext.shadowOffsetX = 2;
    drawingContext.shadowOffsetY = 2;

    strokeWeight(3); // Grosor del contorno de letra
    stroke(0);       // Color de contorno negro
    fill(255);       // Color de relleno blanco

    // Posiciones base de dibujo
    const x = board.posicion.x; // Margen izquierdo del tablero
    const y = board.posicion.y + board.alto + board.ladoCelda; // Justo debajo del tablero

    // 🆕 Primero dibujamos el Score en la primera línea
    text(`Score ${gameState.puntajeAnimado}`, x, y); // Primera línea

    // 🆕 En la segunda línea, colocamos líneas y nivel
    text(`Lines ${gameState.lineasHechas}`, x, y + 32); // Línea de abajo

    const distanciaEntreTextos = 170; // Separación entre "Lines" y "Level"
    text(`Level ${gameState.nivel}`, x + distanciaEntreTextos, y + 32); // Línea de abajo, más a la derecha

    pop(); // Restaura el estilo gráfico anterior
}



// ==========================
// Dibuja los puntajes flotantes animados
// ==========================
function dibujarAnimacionesFlotantes() {
    // Elimina animaciones ya vencidas (después de 1 segundo)
    gameState.animacionesFlotantes = gameState.animacionesFlotantes.filter(a => millis() - a.inicio < 1000);

    for (let anim of gameState.animacionesFlotantes) {
        const progreso = (millis() - anim.inicio) / 1000; // 0 a 1
        const yOffset = -progreso * 50; // Se eleva
        const alpha = map(1 - progreso, 0, 1, 0, 255); // Se desvanece

        push();
        textSize(65);
        textAlign(CENTER, CENTER);
        drawingContext.shadowColor = `rgba(0, 0, 0, ${alpha * 0.5})`;
        drawingContext.shadowBlur = 4;
        drawingContext.shadowOffsetX = 2;
        drawingContext.shadowOffsetY = 2;

        strokeWeight(3);
        stroke(0, alpha);
        fill(255, 255, 255, alpha);

        text(`+${anim.puntos}`, anim.x, anim.y + yOffset);
        pop();
    }
}

// ==========================
// Dibuja un mensaje en pantalla (como "Pause" o "New Game")
// ==========================
function mostrarMensaje(texto) {
    push();
    textAlign(CENTER, CENTER);
    textSize(55);
    drawingContext.shadowColor = 'rgba(0, 0, 0, 0.5)';
    drawingContext.shadowBlur = 4;
    drawingContext.shadowOffsetX = 2;
    drawingContext.shadowOffsetY = 2;
    strokeWeight(3);
    stroke(0);
    fill(255);
    text(texto, width / 2, height / 2);
    pop();
}

// ==========================
// Manejo de teclas mantenidas presionadas (keyIsDown)
// ==========================
function keyEventsTetris() {
    if (millis() - regulador_velocidad_teclas < límite_regulador_velocidad_teclas) return;
    regulador_velocidad_teclas = millis();
    límite_regulador_velocidad_teclas = 100;

    // Movimiento hacia la derecha (→ o D)
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
        piece.moverDerecha();
        regulador_de_caida = millis();
    }
    // Movimiento hacia la izquierda (← o A)
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
        piece.moverIzquierda();
        regulador_de_caida = millis();
    }
    // Movimiento hacia abajo (↓ o S)
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
        piece.moverAbajo();
        regulador_de_caida = millis();
    }
    // Rotar la pieza (↑ o W)
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
        límite_regulador_velocidad_teclas = 150;
        piece.girar();
        regulador_de_caida = millis();
    }
    // Caída instantánea (barra espaciadora)
    if (keyIsDown(32)) {
        límite_regulador_velocidad_teclas = 200;
        piece.ponerEnElFondo();
        regulador_de_caida = millis();
    }
}

// ==========================
// Manejo de teclas presionadas una sola vez
// ==========================
function keyPressed() {
    if (key.toLowerCase() === 'p') {
        gameState.juegoPausado = !gameState.juegoPausado; // Alterna pausa
    }
    if (key.toLowerCase() === 'n') {
        reiniciarJuego(); // Reinicia el juego
    }
}

// ==========================
// Reinicia todo el estado del juego
// ==========================
function reiniciarJuego() {
    board.reiniciar(); // Limpia el tablero
    gameState.tiempoMensajeReinicio = millis(); // Marca reinicio
    piece = new Piece(tetriminosBase, coloresTetriminos, board); // Nueva pieza

    // Resetea los valores de juego
    gameState.puntaje = 0;
    gameState.puntajeAnimado = 0;
    gameState.lineasHechas = 0;
    gameState.nivel = 1; // Reinicia nivel
    gameState.velocidadCaida = 500; // Reinicia velocidad
    gameState.juegoPausado = false;
    gameState.juegoTerminado = false;
}

// ==========================
// Exporta funciones globales requeridas por p5.js
// ==========================
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
