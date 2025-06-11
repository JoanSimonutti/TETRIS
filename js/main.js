// ==========================
// CONSTANTES Y VARIABLES GLOBALES
// ==========================
const MARGEN_TABLERO = 10;
let regulador_velocidad_teclas = 0;
let regulador_de_caida = 0;
let límite_regulador_velocidad_teclas = 100;
let lineas_hechas = 0;
let puntaje = 0;
let puntajeAnimado = 0;  // animación suave del puntaje
let animacionesFlotantes = [];
let tiempoMensajeReinicio = 0; // guarda cuándo se reinició el juego
const DURACION_MENSAJE_REINICIO = 2000; // en milisegundos (2 segundos)


let tablero;
let tetrimino;
let tetriminosBase;


let juegoPausado = false;  // <-- Estado de pausa

// =================================
// SETUP Y DRAW (funciones de p5.js)
// =================================

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

// ===========================================
// FUNCIONES DE DRAW, DIBUJAR DENTRO DEL CANVA
// ===========================================

function draw() {
    clear();
    //=================================
    // Animación suave del puntaje en pantalla (se desvanece hacia arriba)
    //=================================
    puntajeAnimado += (puntaje - puntajeAnimado) * 0.02; //Esto suaviza la transición con un factor del 10%. Si querés que sea más lenta, bajá ese 0.1; si querés que sea más rápida, subilo.
    puntajeAnimado = Math.round(puntajeAnimado);

    //=================================
    // Mostrar mensaje PAUSA (si el juego esta pausado)
    //=================================
    if (juegoPausado) {
        tablero.dibujar();    // cosas que se muestran cuando el juego esta en "pausa"
        tetrimino.dibujar();
        dibujarPuntaje();
        dibujarAnimacionesFlotantes();

        //=================================
        // Mensaje de pausa
        //=================================
        push();
        textAlign(CENTER, CENTER);
        textSize(55);

        // Sombra para dar profundidad
        drawingContext.shadowColor = 'rgba(0, 0, 0, 0.5)';
        drawingContext.shadowBlur = 4;
        drawingContext.shadowOffsetX = 2;
        drawingContext.shadowOffsetY = 2;

        // Contorno y relleno
        strokeWeight(3);
        stroke(0);           // contorno negro
        fill(255);           // texto blanco

        text('Pause', width / 2, height / 2);
        pop();
        return;
    }


    dibujarPuntaje();
    tablero.dibujar();
    tetrimino.dibujar();             // cosas que se muestran en pantalla
    keyEventsTetris();
    dibujarAnimacionesFlotantes();

    //=================================
    // Mostrar mensaje temporal de REINICIO
    //=================================
    if (millis() - tiempoMensajeReinicio < DURACION_MENSAJE_REINICIO) {
        push();
        textAlign(CENTER, CENTER);
        textSize(55);

        // Sombra para dar profundidad
        drawingContext.shadowColor = 'rgba(0, 0, 0, 0.5)';
        drawingContext.shadowBlur = 4;
        drawingContext.shadowOffsetX = 2;
        drawingContext.shadowOffsetY = 2;

        // Contorno y relleno
        strokeWeight(3);
        stroke(0);           // contorno negro
        fill(255);           // texto blanco

        text('New Game', width / 2, height / 2);
        pop();
    }
}

// ==========================
// FUNCIONES DE INTERFAZ que se muestra abajo del canva
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

    text(`Lines ${lineas_hechas}`, x, y);
    text(`Score ${puntajeAnimado}`, x, y + 32); // 28 píxeles más abajo

    pop();
}

// =======================================
// FUNCION PARA DIBUJAR EL TEXTO FLOTANTE
// =======================================

function dibujarAnimacionesFlotantes() {
    animacionesFlotantes = animacionesFlotantes.filter(a => millis() - a.inicio < 1000);

    for (let anim of animacionesFlotantes) {
        const progreso = (millis() - anim.inicio) / 1000;
        const yOffset = -progreso * 50; // se mueve hacia arriba
        const alpha = map(1 - progreso, 0, 1, 0, 255); // se desvanece

        push();
        textSize(65);
        textAlign(CENTER, CENTER);

        // Sombra con alpha
        drawingContext.shadowColor = `rgba(0, 0, 0, ${alpha * 0.5})`; // sombra proporcional al alpha
        drawingContext.shadowBlur = 4;
        drawingContext.shadowOffsetX = 2;
        drawingContext.shadowOffsetY = 2;

        // Contorno y relleno
        strokeWeight(3);
        stroke(0, alpha);        // contorno negro con alpha
        fill(255, 255, 255, alpha); // blanco con alpha

        text(`+${anim.puntos}`, anim.x, anim.y + yOffset);
        pop();

        /* 
            push();     Este lo comento, porque estoy probando unificar los estilos de letras
            textSize(65);
            fill(255, 255, 0, alpha); // amarillo con alpha
            stroke(0, alpha);
            strokeWeight(3);
            textAlign(CENTER, CENTER);
            text(`+${anim.puntos}`, anim.x, anim.y + yOffset);
            pop();
        */
    }
}

// ===============================
// FUNCIONES DE CONTROL POR TECLAS
// ===============================

function keyEventsTetris() { // Detecta si una tecla está siendo presionada continuamente
    if (millis() - regulador_velocidad_teclas < límite_regulador_velocidad_teclas) return;
    regulador_velocidad_teclas = millis();
    límite_regulador_velocidad_teclas = 100;

    // Flechas o teclas WASD para mover y girar
    // Movimiento derecha
    if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) { //  Derecha o D
        tetrimino.moverDerecha();
        regulador_de_caida = millis();
    }

    // Movimiento izquierda
    if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) { //  Izquierda o A
        tetrimino.moverIzquierda();
        regulador_de_caida = millis();
    }

    // Movimiento abajo
    if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) { // Abajo o S
        tetrimino.moverAbajo();
        regulador_de_caida = millis();
    }

    // Rotar
    if (keyIsDown(UP_ARROW) || keyIsDown(87)) { // Arriba o W
        límite_regulador_velocidad_teclas = 150;
        tetrimino.girar();
        regulador_de_caida = millis();
    }

    // Caída instantánea
    if (keyIsDown(32)) { // Barra espaciadora
        límite_regulador_velocidad_teclas = 200;
        tetrimino.ponerEnElFondo();
        regulador_de_caida = millis();
    }
}

// =================================
// FUNCION PARA REINICIAR EL JUEGO
// =================================


// Función que crea un nuevo tetrimino
function nuevoTetrimino() {
    return new Tetrimino();
}

// Función para reiniciar todo el estado del juego
function reiniciarJuego() {
    // Vacía la grilla del tablero (lo deja como nuevo)
    tablero.reiniciar();
    tiempoMensajeReinicio = millis(); // activa el mensaje

    // Crea una nueva pieza
    tetrimino = nuevoTetrimino();

    // Reinicia variables de juego
    puntaje = 0;
    puntajeAnimado = 0;
    lineas_hechas = 0;
    juegoPausado = false;
    juegoTerminado = false;
    tiempoInicio = millis(); // Registra el nuevo tiempo de inicio
    tiempoMensajeReinicio = millis(); // Marca el momento del reinicio

}


// ==========================================
// FUNCION PARA DETECTAR PULSACION DE TECLAS
// ==========================================

function keyPressed() {  // Detecta teclas presionadas una vez (como eventos individuales)
    if (key.toLowerCase() === 'p') {
        juegoPausado = !juegoPausado;   // Poner pausa o quitar pausa
    }

    if (key.toLowerCase() === 'n') {
        reiniciarJuego();  // Reinicia todo
    }
}