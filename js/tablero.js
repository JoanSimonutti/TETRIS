// ==========================
// IMPORTACIÓN DE CLASES
// ==========================
class Tablero {
    constructor() {
        this.columnas = 10;
        this.filas = 20;
        this.lado_celda = 30;
        this.ancho = this.columnas * this.lado_celda;
        this.alto = this.filas * this.lado_celda;
        this.posición = createVector(MARGEN_TABLERO, MARGEN_TABLERO);
        this.celdas = Array.from({ length: this.filas }, () => Array(this.columnas).fill(null));
    }

    dibujar() {
        for (let fila = 0; fila < this.filas; fila++) {
            for (let col = 0; col < this.columnas; col++) {
                const celda = this.celdas[fila][col];
                const x = this.posición.x + col * this.lado_celda;
                const y = this.posición.y + fila * this.lado_celda;
                stroke(50);
                fill(celda ? celda : 20);
                rect(x, y, this.lado_celda, this.lado_celda);
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
        lineas_hechas += filasEliminadas;

        // Asignación de puntos por cantidad de líneas simultáneas

        let puntosGanados = 0;

        switch (filasEliminadas) {
            case 1:
                puntosGanados = int(random(5000, 8000)); // 5000 a 7999
                break;
            case 2:
                puntosGanados = int(random(15000, 20000)); // 15000 a 19999
                break;
            case 3:
                puntosGanados = int(random(43000, 50000)); // 43000 a 49999
                break;
            case 4:
                puntosGanados = int(random(124000, 130000)); // 124000 a 129999
                break;
        }

        if (puntosGanados > 0) {
            console.log("Ganaste puntos:", puntosGanados);
            puntaje += puntosGanados;

            animacionesFlotantes.push({
                puntos: puntosGanados,
                x: tablero.posición.x + tablero.ancho / 2,
                y: tablero.posición.y + tablero.alto / 2,
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
}