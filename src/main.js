// src/Main.js
import { crearMapeoBaseTetriminos } from './tetriminoUtils.js';
import { Board } from './board.js';
import { Piece } from './piece.js';

// ==========================
// ESTADO GLOBAL DEL JUEGO
// ==========================
const gameState = {
    puntaje: 0,
    puntajeAnimado: 0,
    lineasHechas: 0,
    animacionesFlotantes: [],
    juegoPausado: false,
    juegoTerminado: false,
    tiempoMensajeReinicio: 0,
};

const DURACION_MENSAJE_REINICIO = 2000;
const MARGEN_TABLERO = 10;

let board;
let piece;
let coloresTetriminos;
let tetriminosBase;

let regulador_velocidad_teclas = 0;
let regulador_de_caida = 0;
let límite_regulador_velocidad_teclas = 100;

// ==========================
// P5 SETUP
// ==========================
function setup() {
    coloresTetriminos = {
        I: color(255, 102, 102),
        O: color(102, 102, 255),
        T: color(255, 255, 153),
        L: color(200, 128, 200),
        J: color(240, 240, 240),
        S: color(144, 238, 144),
        Z: color(153, 255, 255),
    };

    tetriminosBase = crearMapeoBaseTetriminos();

    board = new Board({ gameState, margen: MARGEN_TABLERO });
    piece = new Piece(tetriminosBase, coloresTetriminos, board);

    createCanvas(
        board.ancho + 2 * MARGEN_TABLERO,
        board.alto + 2 * MARGEN_TABLERO + 2 * board.ladoCelda
    );

    setInterval(() => {
        if (gameState.juegoPausado) return;
        if (millis() - regulador_de_caida < 300) return;
        regulador_de_caida = millis();
        piece.moverAbajo();
    }, 500);
}

function draw() {
    clear();
    gameState.puntajeAnimado += (gameState.puntaje - gameState.puntajeAnimado) * 0.02;
    gameState.puntajeAnimado = Math.round(gameState.puntajeAnimado);

    if (gameState.juegoPausado) {
        board.dibujar();
        piece.dibujar();
        dibujarPuntaje();
        dibujarAnimacionesFlotantes();
        mostrarMensaje('Pause');
        return;
    }

    dibujarPuntaje();
    board.dibujar();
    piece.dibujar();
    keyEventsTetris();
    dibujarAnimacionesFlotantes();

    if (millis() - gameState.tiempoMensajeReinicio < DURACION_MENSAJE_REINICIO) {
        mostrarMensaje('New Game');
    }
}

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

function dibujarAnimacionesFlotantes() {
    gameState.animacionesFlotantes = gameState.animacionesFlotantes.filter(a => millis() - a.inicio < 1000);

    for (let anim of gameState.animacionesFlotantes) {
        const progreso = (millis() - anim.inicio) / 1000;
        const yOffset = -progreso * 50;
        const alpha = map(1 - progreso, 0, 1, 0, 255);

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

function keyEventsTetris() {
    if (millis() - regulador_velocidad_teclas < límite_regulador_velocidad_teclas) return;
    regulador_velocidad_teclas = millis();
    límite_regulador_velocidad_teclas = 100;

    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
        piece.moverDerecha();
        regulador_de_caida = millis();
    }
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
        piece.moverIzquierda();
        regulador_de_caida = millis();
    }
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) {
        piece.moverAbajo();
        regulador_de_caida = millis();
    }
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) {
        límite_regulador_velocidad_teclas = 150;
        piece.girar();
        regulador_de_caida = millis();
    }
    if (keyIsDown(32)) {
        límite_regulador_velocidad_teclas = 200;
        piece.ponerEnElFondo();
        regulador_de_caida = millis();
    }
}

function keyPressed() {
    if (key.toLowerCase() === 'p') {
        gameState.juegoPausado = !gameState.juegoPausado;
    }
    if (key.toLowerCase() === 'n') {
        reiniciarJuego();
    }
}

function reiniciarJuego() {
    board.reiniciar();
    gameState.tiempoMensajeReinicio = millis();
    piece = new Piece(tetriminosBase, coloresTetriminos, board);
    gameState.puntaje = 0;
    gameState.puntajeAnimado = 0;
    gameState.lineasHechas = 0;
    gameState.juegoPausado = false;
    gameState.juegoTerminado = false;
}

window.setup = setup;
window.draw = draw;
window.keyPressed = keyPressed;
