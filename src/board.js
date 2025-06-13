//==========================================================================================
//Este archivo contiene la clase Board, que representa el tablero del Tetris.
//==========================================================================================
export class Board {  //Exportamos la clase para poder importarla en otros archivos con import { Board } from './board.js'.                     
    constructor({ columnas = 10, filas = 20, ladoCelda = 30, margen = 10, gameState }) {  //El constructor recibe un objeto con configuraciones del tablero.
        this.columnas = columnas;                                                         //Todas tienen valores por defecto, excepto gameState, que es obligatorio. 
        this.filas = filas;        //Definimos el tamaño del tablero: cantidad de columnas y filas, y el tamaño de cada celda (cuadro cuadrado).
        this.ladoCelda = ladoCelda;
        this.ancho = columnas * ladoCelda;  //Calculamos el ancho y el alto del tablero en píxeles.
        this.alto = filas * ladoCelda;
        this.posicion = createVector(margen, margen);  //Usamos p5.js para definir la posición inicial del tablero en pantalla (arriba a la izquierda con margen).
        this.celdas = Array.from({ length: filas }, () => Array(columnas).fill(null));  //Creamos una matriz (array bidimensional) de null, que representa un tablero vacío.
        this.gameState = gameState; // Estado compartido del juego (puntaje, líneas, animaciones)
    }     //Guardamos una referencia al estado del juego (puntaje, líneas, etc.).

    //==========================================================================================
    //Método dibujar() 
    //==========================================================================================
    dibujar() {  //Este método dibuja cada celda del tablero.
        for (let fila = 0; fila < this.filas; fila++) {
            for (let col = 0; col < this.columnas; col++) {
                const celda = this.celdas[fila][col];
                const x = this.posicion.x + col * this.ladoCelda;
                const y = this.posicion.y + fila * this.ladoCelda;
                stroke(50);
                fill(celda ? celda : 20);  //Si la celda tiene color, la pinta con ese color. Si no, usa un gris oscuro (20).
                rect(x, y, this.ladoCelda, this.ladoCelda);  //Dibuja un rectángulo en la posición correspondiente con rect().
            }
        }
    }

    //==========================================================================================
    //Método fijarTetrimino(tetrimino)
    //==========================================================================================
    fijarTetrimino(tetrimino) {   //Este método “pega” el tetrimino en el tablero cuando toca el fondo o choca.
        for (let bloque of tetrimino.formaActual()) {
            const x = tetrimino.pos.x + bloque[0];  //Para cada bloque, calcula su posición dentro del tablero y asigna su color.
            const y = tetrimino.pos.y + bloque[1];
            if (y >= 0 && y < this.filas && x >= 0 && x < this.columnas) {
                this.celdas[y][x] = tetrimino.color;
            }
        }
        this.eliminarFilasCompletas();  //Aquí llama a eliminarFilasCompletas().
    }

    //==========================================================================================
    //Método eliminarFilasCompletas()
    //==========================================================================================
    eliminarFilasCompletas() {
        let nuevasFilas = [];
        let filasEliminadas = 0;

        for (let fila of this.celdas) {  //Busca líneas completas. Si una línea está llena (.every(...)), se elimina y se agrega una nueva fila vacía al principio.
            if (fila.every(celda => celda !== null)) {
                nuevasFilas.unshift(Array(this.columnas).fill(null));
                filasEliminadas++;
            } else {
                nuevasFilas.push(fila);
            }
        }

        this.celdas = nuevasFilas;  //Se lleva la cuenta de cuántas se eliminaron y actualiza lineasHechas.
        this.gameState.lineasHechas += filasEliminadas;


        //==========================================================================================
        // Sistema de puntuación por líneas
        //==========================================================================================
        let puntosGanados = 0;
        switch (filasEliminadas) {
            case 1:
                puntosGanados = int(random(5500, 8500));  //Calcula los puntos (random) ganados según la cantidad de líneas eliminadas.
                break;
            case 2:
                puntosGanados = int(random(15500, 20000));
                break;
            case 3:
                puntosGanados = int(random(43500, 50000));
                break;
            case 4:
                puntosGanados = int(random(124500, 130000));
                break;
        }

        if (puntosGanados > 0) {
            this.gameState.puntaje += puntosGanados;    //Si se ganaron puntos, los suma al puntaje 
            this.gameState.animacionesFlotantes.push({  //y agrega una animación flotante (que se dibuja luego en main.js).
                puntos: puntosGanados,
                x: this.posicion.x + this.ancho / 2,
                y: this.posicion.y + this.alto / 2,
                inicio: millis()
            });
        }
    }

    //==========================================================================================
    // Método colisiona(tetrimino)
    //==========================================================================================
    colisiona(tetrimino) {
        for (let bloque of tetrimino.formaActual()) {
            const x = tetrimino.pos.x + bloque[0];
            const y = tetrimino.pos.y + bloque[1];
            if (                                    //Verifica si un tetrimino colisiona con los bordes o con otras piezas del tablero.
                x < 0 ||
                x >= this.columnas ||
                y >= this.filas ||
                (y >= 0 && this.celdas[y][x])
            ) {
                return true;
            }
        }
        return false;
    }

    //==========================================================================================
    // Método reiniciar()
    //==========================================================================================
    reiniciar() {
        this.celdas = Array.from({ length: this.filas }, () => Array(this.columnas).fill(null));
    }
}
