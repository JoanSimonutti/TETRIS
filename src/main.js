// Importamos las funciones y clases necesarias desde sus respectivos módulos
import { crearMapeoBaseTetriminos } from './utils/tetriminoUtils.js';
import { Board } from './board.js';
import { Piece } from './piece.js';

// ==========================
// ESTADO GLOBAL DEL JUEGO
//Qué aprendés con esto:
//Cómo se inicializa el juego.
//Cómo se dibuja y actualiza todo en pantalla.
//Cómo se manejan las teclas (incluyendo velocidad y acciones).
//Cómo se reinicia el juego.
//Cómo se calculan las animaciones visuales del puntaje.
// ==========================

const gameState = {
    puntaje: 0, // Puntaje actual del jugador
    puntajeAnimado: 0, // Puntaje interpolado (para una animación visual suave)
    lineasHechas: 0, // Cantidad de líneas completadas
    animacionesFlotantes: [], // Lista de puntos flotantes que se animan al ganar puntos
    juegoPausado: false, // Estado de pausa
    juegoTerminado: false, // (no usado todavía, reservado para expansión)
    tiempoMensajeReinicio: 0, // Marca cuándo se reinició el juego (para mostrar mensaje)
};

const DURACION_MENSAJE_REINICIO = 2000; // Duración en ms del mensaje de "New Game"
const MARGEN_TABLERO = 10; // Espacio de margen alrededor del tablero

let board; // Instancia del tablero
let piece; // Instancia de la pieza actual
let coloresTetriminos; // Diccionario con los colores de las piezas
let tetriminosBase; // Diccionario con las formas base de las piezas

// Variables para regular velocidad de teclas y caída automática
let regulador_velocidad_teclas = 0;
let regulador_de_caida = 0;
let límite_regulador_velocidad_teclas = 100;

// ==========================
// P5 SETUP (se ejecuta una vez al inicio)
// ==========================
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

    // Intervalo para mover la pieza hacia abajo automáticamente cada 500ms
    setInterval(() => {
        if (gameState.juegoPausado) return; // Si está pausado, no hace nada
        if (millis() - regulador_de_caida < 300) return; // Espera entre caídas
        regulador_de_caida = millis(); // Reinicia contador
        piece.moverAbajo(); // Mueve pieza hacia abajo
    }, 500);
}

// ==========================
// P5 DRAW (se ejecuta 60 veces por segundo)
// ==========================
function draw() {
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
}

// ==========================
// Dibuja el puntaje y líneas en pantalla
// ==========================
function dibujarPuntaje() {
    push();
    textSize(30);
    drawingContext.shadowColor = 'rgba(0,0,0,0.5)';
    drawingContext.shadowBlur = 4;
    drawingContext.shadowOffsetX = 2;
    drawingContext.shadowOffsetY = 2;

    strokeWeight(3);
    stroke(0);
    fill(255);

    const x = board.posicion.x;
    const y = board.posicion.y + board.alto + board.ladoCelda;

    text(`Lines ${gameState.lineasHechas}`, x, y);
    text(`Score ${gameState.puntajeAnimado}`, x, y + 32);
    pop();
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
    gameState.juegoPausado = false;
    gameState.juegoTerminado = false;
}

// ==========================
// Exporta funciones globales requeridas por p5.js
// ==========================
window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
