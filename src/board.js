//=====================================================
//Esta clase representa el tablero de juego del Tetris
//Qué vas a poder hacer con esto:
//Entender cómo se pinta el tablero en pantalla.
//Comprender cómo se fijan las piezas cuando chocan.
//Ver cómo se detectan y eliminan líneas completas.
//Saber cómo se suman puntos y se actualiza el estado general del juego.
//Volver más adelante y modificar o ampliar esta clase sin miedo.
//=====================================================
export class Board {
    // Constructor: recibe la configuración del tablero y el estado global del juego
    constructor({ columnas = 10, filas = 20, ladoCelda = 30, margen = 10, gameState }) {
        this.columnas = columnas; // Cantidad de columnas en el tablero (por defecto 10)
        this.filas = filas; // Cantidad de filas en el tablero (por defecto 20)
        this.ladoCelda = ladoCelda; // Tamaño de cada celda (cuadrado) en píxeles
        this.ancho = columnas * ladoCelda; // Ancho total del tablero en píxeles
        this.alto = filas * ladoCelda; // Alto total del tablero en píxeles

        // Posición donde se dibuja el tablero (offset desde la esquina superior izquierda)
        this.posicion = createVector(margen, margen);

        // Matriz bidimensional que representa el estado de cada celda (null = vacía)
        this.celdas = Array.from({ length: filas }, () => Array(columnas).fill(null));

        this.gameState = gameState; // Estado del juego (puntaje, líneas hechas, animaciones)
    }

    // Método para dibujar el tablero
    dibujar() {
        for (let fila = 0; fila < this.filas; fila++) {
            for (let col = 0; col < this.columnas; col++) {
                const celda = this.celdas[fila][col]; // Obtiene el contenido de la celda
                const x = this.posicion.x + col * this.ladoCelda; // Coordenada X en píxeles
                const y = this.posicion.y + fila * this.ladoCelda; // Coordenada Y en píxeles

                stroke(50); // Borde gris oscuro
                fill(celda ? celda : 20); // Si hay color, lo pinta; si no, usa gris oscuro
                rect(x, y, this.ladoCelda, this.ladoCelda); // Dibuja la celda
            }
        }
    }

    // Método para fijar (pegar) una pieza en el tablero una vez que colisiona
    fijarTetrimino(tetrimino) {
        let tocaArriba = false; // Para detectar si se fijó en la fila 0

        for (let bloque of tetrimino.formaActual()) {
            const x = tetrimino.pos.x + bloque[0]; // Posición X del bloque en el tablero
            const y = tetrimino.pos.y + bloque[1]; // Posición Y del bloque en el tablero

            // Solo si está dentro del área visible del tablero
            if (y >= 0 && y < this.filas && x >= 0 && x < this.columnas) {
                this.celdas[y][x] = tetrimino.color; // Fijar la pieza

                if (y === 0) {
                    tocaArriba = true; // Si tocó la fila de arriba, marcamos
                }
            }
        }

        // Si algún bloque se fijó en la fila 0 → GAME OVER
        if (tocaArriba) {
            this.gameState.juegoTerminado = true;
            return; // No seguimos procesando líneas ni nada
        }

        this.eliminarFilasCompletas(); // Luego intenta eliminar filas completas
    }


    // Elimina las filas completas del tablero y otorga puntaje
    eliminarFilasCompletas() {
        let nuevasFilas = []; // Acumula las nuevas filas después de eliminar
        let filasEliminadas = 0; // Contador de filas eliminadas

        for (let fila of this.celdas) {
            if (fila.every(celda => celda !== null)) { // Si la fila está completamente llena...
                nuevasFilas.unshift(Array(this.columnas).fill(null)); // Agrega una nueva fila vacía arriba
                filasEliminadas++; // Suma una línea eliminada
            } else {
                nuevasFilas.push(fila); // Conserva la fila si no estaba llena
            }
        }

        this.celdas = nuevasFilas; // Actualiza el tablero con las filas resultantes
        this.gameState.lineasHechas += filasEliminadas; // Suma al contador global de líneas

        // Después de actualizar gameState.lineasHechas
        const lineasPrevias = Math.floor((this.gameState.lineasHechas - filasEliminadas) / 6);
        const lineasActuales = Math.floor(this.gameState.lineasHechas / 6);
        const nivelesSubidos = lineasActuales - lineasPrevias;

        if (nivelesSubidos > 0) {
            this.gameState.nivel += nivelesSubidos;

            // Reducimos la velocidad un 10% por nivel subido
            this.gameState.velocidadCaida *= Math.pow(0.93, nivelesSubidos); //Para reducir o aumentar la velocidad de caida modificar "0.93"

            // Aseguramos un mínimo para que no se vuelva imposible
            this.gameState.velocidadCaida = max(this.gameState.velocidadCaida, 100); //Este es el minimo de velocidad de caida "100 ms" 

            // Mostrar mensaje de nivel
            this.gameState.mensajeNivel = 'LEVEL UP!';
            this.gameState.tiempoMensajeNivel = millis(); // Tiempo actual
        }

        // Asigna puntaje según cantidad de líneas eliminadas simultáneamente
        let puntosGanados = 0;
        switch (filasEliminadas) {
            case 1:
                puntosGanados = int(random(5500, 8500));
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

        // Si se ganaron puntos, los suma y agrega animación flotante de puntaje
        if (puntosGanados > 0) {
            this.gameState.puntaje += puntosGanados;
            this.gameState.animacionesFlotantes.push({
                puntos: puntosGanados, // Cantidad de puntos a mostrar
                x: this.posicion.x + this.ancho / 2, // X centrado en el tablero
                y: this.posicion.y + this.alto / 2 - 60, // Subimos 100 píxeles desde el centro del tablero
                inicio: millis() // Tiempo de inicio de la animación
            });

            // Activamos la sacudida de pantalla
            if (typeof activarSacudida === 'function') {
                activarSacudida();
            }

        }
    }

    // Verifica si un tetrimino colisiona con el borde o con otras piezas
    colisiona(tetrimino) {
        for (let bloque of tetrimino.formaActual()) {
            const x = tetrimino.pos.x + bloque[0]; // Posición X absoluta
            const y = tetrimino.pos.y + bloque[1]; // Posición Y absoluta

            if (
                x < 0 || // Fuera del tablero a la izquierda
                x >= this.columnas || // Fuera del tablero a la derecha
                y >= this.filas || // Fuera del tablero por debajo
                (y >= 0 && this.celdas[y][x]) // Celda ocupada dentro del tablero
            ) {
                return true; // Hay colisión
            }
        }
        return false; // Si ningún bloque colisiona, devuelve false
    }

    // Reinicia el tablero a su estado vacío original
    reiniciar() {
        this.celdas = Array.from({ length: this.filas }, () => Array(this.columnas).fill(null));
    }
}
