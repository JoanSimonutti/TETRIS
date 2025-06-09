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
        for (let fila of this.celdas) {
            if (fila.every(celda => celda !== null)) {
                nuevasFilas.unshift(Array(this.columnas).fill(null));
                lineas_hechas++;
            } else {
                nuevasFilas.push(fila);
            }
        }
        this.celdas = nuevasFilas;
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