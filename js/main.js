/* 
Explicación principal:

- setup() inicializa variables y canvas.

- draw() es el loop que se repite para actualizar la pantalla.

- Se regula la velocidad con los tiempos (regulador_de_caida y regulador_velocidad_teclas) para que las piezas no se muevan demasiado rápido o lento.

- El teclado mueve la pieza (flechas para moverse o girar, espacio para poner la pieza en el fondo).

*/

const MARGEN_TABLERO = 10;
let regulador_velocidad_teclas = 0;
let regulador_de_caida = 0;
let lineas_hechas = 0;

/* 
  setInterval para que las piezas bajen cada cierto tiempo (gravedad simulada)
  millis() es función de p5 que devuelve ms desde que inició el programa
*/
setInterval(() => {
    if (millis() - regulador_de_caida < 300) return; // no cae si no pasaron 300ms
    regulador_de_caida = millis();
    tetrimino.moverAbajo();
}, 500);

/* setup() se ejecuta una vez al iniciar */
function setup() {
    createCanvas(900, 600); // crea el canvas (área de dibujo)

    // Variables globales SIN let/var/const para que sean accesibles en todo el código
    tablero = new Tablero();
    crearMapeoBaseTetriminos();  // función externa para definir tipos de piezas
    tetrimino = new Tetrimino();

    // Ajusta tamaño del canvas según tamaño real del tablero y márgenes
    resizeCanvas(
        tablero.ancho + 2 * MARGEN_TABLERO,
        tablero.alto + 2 * MARGEN_TABLERO + 2 * tablero.lado_celda
    );
}

/* draw() se ejecuta repetidamente (aprox 60 FPS) */
function draw() {
    clear();             // limpia el canvas para redibujar
    dibuajarPuntaje();   // dibuja líneas hechas
    tablero.dibujar();   // dibuja el tablero y piezas almacenadas
    tetrimino.dibujar(); // dibuja la pieza que cae
    keyEventsTetris();   // chequea y ejecuta eventos del teclado
}

/* Función para dibujar texto de puntaje (líneas) */
function dibuajarPuntaje() {
    push(); // guarda estilos actuales
    textSize(20);
    strokeWeight(2);
    stroke("black");
    fill("white");
    text(
        "Líneas: " + lineas_hechas,
        tablero.posición.x,
        tablero.posición.y - tablero.lado_celda / 2
    );
    pop(); // restaura estilos anteriores
}

let límite_regulador_velocidad_teclas = 100;

/* Detecta teclas presionadas para mover la pieza */
function keyEventsTetris() {
    if (millis() - regulador_velocidad_teclas < límite_regulador_velocidad_teclas) {
        return;
    }
    límite_regulador_velocidad_teclas = 100;
    regulador_velocidad_teclas = millis();

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
    if (keyIsDown(32)) { // tecla espacio
        límite_regulador_velocidad_teclas = 200;
        tetrimino.ponerEnElFondo();
        regulador_de_caida = millis();
    }
}
