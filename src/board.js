export class Board {
    constructor({ columnas = 10, filas = 20, ladoCelda = 30, margen = 10, gameState }) {
        this.columnas = columnas;
        this.filas = filas;
        this.ladoCelda = ladoCelda;
        this.ancho = columnas * ladoCelda;
        this.alto = filas * ladoCelda;
        this.posicion = createVector(margen, margen);
        this.celdas = Array.from({ length: filas }, () => Array(columnas).fill(null));
        this.gameState = gameState; // Estado compartido del juego (puntaje, líneas, animaciones)
    }

    dibujar() {
        for (let fila = 0; fila < this.filas; fila++) {
            for (let col = 0; col < this.columnas; col++) {
                const celda = this.celdas[fila][col];
                const x = this.posicion.x + col * this.ladoCelda;
                const y = this.posicion.y + fila * this.ladoCelda;
                stroke(50);
                fill(celda ? celda : 20);
                rect(x, y, this.ladoCelda, this.ladoCelda);
            }
        }
    }

    fijarTetrimino(tetrimino) {
        for (let bloque of tetrimino.formaActual()) {
            const x = tetrimino.pos.x + bloque[0];
            const y = tetrimino.pos.y + bloque[1];
            if (y >= 0 && y < this.filas && x >= 0 && x < this.columnas) {
                this.celdas[y][x] = tetrimino.color;
            }
        }
        this.eliminarFilasCompletas();
    }

    eliminarFilasCompletas() {
        let nuevasFilas = [];
        let filasEliminadas = 0;

        for (let fila of this.celdas) {
            if (fila.every(celda => celda !== null)) {
                nuevasFilas.unshift(Array(this.columnas).fill(null));
                filasEliminadas++;
            } else {
                nuevasFilas.push(fila);
            }
        }

        this.celdas = nuevasFilas;
        this.gameState.lineasHechas += filasEliminadas;

        // Sistema de puntuación por líneas
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

        if (puntosGanados > 0) {
            this.gameState.puntaje += puntosGanados;
            this.gameState.animacionesFlotantes.push({
                puntos: puntosGanados,
                x: this.posicion.x + this.ancho / 2,
                y: this.posicion.y + this.alto / 2,
                inicio: millis()
            });
        }
    }

    colisiona(tetrimino) {
        for (let bloque of tetrimino.formaActual()) {
            const x = tetrimino.pos.x + bloque[0];
            const y = tetrimino.pos.y + bloque[1];
            if (
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

    reiniciar() {
        this.celdas = Array.from({ length: this.filas }, () => Array(this.columnas).fill(null));
    }
}
