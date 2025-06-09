// ==========================
// CONSTANTES Y VARIABLES GLOBALES
// ==========================
const MARGEN_TABLERO = 10;
let regulador_velocidad_teclas = 0;
let regulador_de_caida = 0;
let límite_regulador_velocidad_teclas = 100;
let lineas_hechas = 0;

// Variables globales del juego
let tablero;
let tetrimino;
let tetriminosBase;

// ==========================
// SETUP Y DRAW (funciones de p5.js)
// ==========================
function setup() {
    crearMapeoBaseTetriminos();
    tablero = new Tablero();
    tetrimino = new Tetrimino();

    createCanvas(
        tablero.ancho + 2 * MARGEN_TABLERO,
        tablero.alto + 2 * MARGEN_TABLERO + 2 * tablero.lado_celda
    );

    setInterval(() => {
        if (millis() - regulador_de_caida < 300) return;
        regulador_de_caida = millis();
        tetrimino.moverAbajo();
    }, 500);
}

function draw() {
    clear();
    dibujarPuntaje();
    tablero.dibujar();
    tetrimino.dibujar();
    keyEventsTetris();
}

// ==========================
// FUNCIONES DE INTERFAZ
// ==========================
function dibujarPuntaje() {
    push();
    textSize(20);
    strokeWeight(2);
    stroke("black");
    fill("white");
    text(
        `Líneas: ${lineas_hechas}`,
        tablero.posición.x,
        tablero.posición.y - tablero.lado_celda / 2
    );
    pop();
}

function keyEventsTetris() {
    if (millis() - regulador_velocidad_teclas < límite_regulador_velocidad_teclas) return;
    regulador_velocidad_teclas = millis();
    límite_regulador_velocidad_teclas = 100;

    if (keyIsDown(RIGHT_ARROW)) {
        tetrimino.moverDerecha();
        regulador_de_caida = millis();
    }
    if (keyIsDown(LEFT_ARROW)) {
        tetrimino.moverIzquierda();
        regulador_de_caida = millis();
    }
    if (keyIsDown(DOWN_ARROW)) {
        tetrimino.moverAbajo();
        regulador_de_caida = millis();
    }
    if (keyIsDown(UP_ARROW)) {
        límite_regulador_velocidad_teclas = 150;
        tetrimino.girar();
        regulador_de_caida = millis();
    }
    if (keyIsDown(32)) { // Barra espaciadora
        límite_regulador_velocidad_teclas = 200;
        tetrimino.ponerEnElFondo();
        regulador_de_caida = millis();
    }
}

