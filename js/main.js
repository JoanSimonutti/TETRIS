// ==========================
// CONSTANTES Y VARIABLES GLOBALES
// ==========================
const MARGEN_TABLERO = 10;
let regulador_velocidad_teclas = 0;
let regulador_de_caida = 0;
let límite_regulador_velocidad_teclas = 100;
let lineas_hechas = 0;
let puntaje = 0;
let puntajeAnimado = 0;  // Animación suave del puntaje
let animacionesFlotantes = [];


let tablero;
let tetrimino;
let tetriminosBase;


let juegoPausado = false;  // <-- Estado de pausa

// ==========================
// SETUP Y DRAW (funciones de p5.js)
// ==========================
function setup() {
    coloresTetriminos = {
        I: color(255, 102, 102),     // Rojo pastel
        O: color(102, 102, 255),     // Azul pastel
        T: color(255, 255, 153),     // Amarillo pastel
        L: color(200, 128, 200),     // Morado pastel
        J: color(240, 240, 240),     // Blanco (ligeramente grisáceo para distinguir)
        S: color(144, 238, 144),     // Verde pastel
        Z: color(153, 255, 255)      // Cian pastel
    };
    crearMapeoBaseTetriminos();
    tablero = new Tablero();
    tetrimino = new Tetrimino();

    createCanvas(
        tablero.ancho + 2 * MARGEN_TABLERO,
        tablero.alto + 2 * MARGEN_TABLERO + 2 * tablero.lado_celda
    );

    setInterval(() => {
        if (juegoPausado) return;
        if (millis() - regulador_de_caida < 300) return;
        regulador_de_caida = millis();
        tetrimino.moverAbajo();
    }, 500);
}

function draw() {
    clear();

    // Animación suave del puntaje
    puntajeAnimado += (puntaje - puntajeAnimado) * 0.02; //Esto suaviza la transición con un factor del 10%. Si querés que sea más lenta, bajá ese 0.1; si querés que sea más rápida, subilo.
    puntajeAnimado = Math.round(puntajeAnimado);

    if (juegoPausado) {
        tablero.dibujar();    // cosas que se muestran cuando el juego esta en "pausa"
        tetrimino.dibujar();
        dibujarPuntaje();
        dibujarAnimacionesFlotantes();


        push();
        textAlign(CENTER, CENTER);
        textSize(55);
        fill('rgba(255, 102, 102, 0.8)');
        stroke('255, 230, 230');
        strokeWeight(4);
        text('P A U S A', width / 2, height / 2);
        pop();

        return;
    }

    dibujarPuntaje();
    tablero.dibujar();
    tetrimino.dibujar();             // cosas que se muestran en pantalla
    keyEventsTetris();
    dibujarAnimacionesFlotantes();
}

// ==========================
// FUNCIONES DE INTERFAZ
// ==========================
function dibujarPuntaje() {
    push();
    textSize(30);

    // Contorno y sombra para dar legibilidad y profundidad
    drawingContext.shadowColor = 'rgba(0,0,0,0.5)';
    drawingContext.shadowBlur = 4;
    drawingContext.shadowOffsetX = 2;
    drawingContext.shadowOffsetY = 2;

    strokeWeight(3);
    stroke(0); // contorno negro
    fill(255); // texto blanco

    const x = tablero.posición.x;
    const y = tablero.posición.y + tablero.alto + tablero.lado_celda;

    text(`Líneas ${lineas_hechas}`, x, y);
    text(`Puntaje ${puntajeAnimado}`, x, y + 32); // 28 píxeles más abajo

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

// ==========================
// FUNCION PARA DETECTAR PULSACION DE TECLAS
// ==========================
function keyPressed() {
    if (key.toLowerCase() === 'p') {
        juegoPausado = !juegoPausado;
    }
}

// ==========================
// FUNCION PARA DIBUJAR EL TEXTO FLOTANTE
// ==========================

function dibujarAnimacionesFlotantes() {
    animacionesFlotantes = animacionesFlotantes.filter(a => millis() - a.inicio < 1000);

    for (let anim of animacionesFlotantes) {
        const progreso = (millis() - anim.inicio) / 1000;
        const yOffset = -progreso * 50; // se mueve hacia arriba
        const alpha = map(1 - progreso, 0, 1, 0, 255); // se desvanece

        push();
        textSize(65);
        fill(255, 255, 0, alpha); // amarillo con alpha
        stroke(0, alpha);
        strokeWeight(3);
        textAlign(CENTER, CENTER);
        text(`+${anim.puntos}`, anim.x, anim.y + yOffset);
        pop();
    }
}
