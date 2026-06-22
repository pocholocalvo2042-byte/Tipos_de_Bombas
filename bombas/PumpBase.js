// /bombas/PumpBase.js

/**
 * Clase que representa una partícula individual de fluido.
 * Todas las bombas usarán esta misma física para el agua.
 */
export class Particle {
    constructor(x, y, vx, vy, size = 2) {
        this.x = x;
        this.y = y;
        this.vx = vx; // Velocidad en el eje X
        this.vy = vy; // Velocidad en el eje Y
        this.life = 1.0; // Ciclo de vida (1.0 = 100%)
        this.size = Math.random() * 2 + size;
        this.alpha = Math.random() * 0.5 + 0.5; // Transparencia base
    }

    // Actualiza la posición según la velocidad
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.015; // Velocidad de desaparición
    }

    // Verifica si la partícula debe ser eliminada
    isDead(canvasWidth, canvasHeight) {
        return (
            this.life <= 0 || 
            this.x < -50 || 
            this.x > canvasWidth + 50 || 
            this.y < -50 || 
            this.y > canvasHeight + 50
        );
    }

    // Dibuja la partícula en el canvas
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        // El color azul agua se desvanece suavemente al morir
        ctx.fillStyle = `rgba(56, 189, 248, ${this.alpha * this.life})`; 
        ctx.fill();
    }
}

/**
 * Clase Padre de todas las bombas.
 * Centraliza la termodinámica, la telemetría y el sistema de partículas.
 */
export class PumpBase {
    constructor(canvasWidth, canvasHeight) {
        this.width = canvasWidth;
        this.height = canvasHeight;
        this.cx = canvasWidth / 2; // Centro X
        this.cy = canvasHeight / 2; // Centro Y
        
        this.particles = [];
        
        // Variables Termodinámicas y Operativas Base
        this.flowRate = 0;    // Q: Caudal (L/min)
        this.pressure = 0;    // P: Presión de descarga (bar)
        this.efficiency = 0;  // η: Eficiencia mecánica (%)
        this.power = 0;       // W: Potencia consumida (W)
    }

    // --- LÓGICA DE FLUIDOS ---
    
    // Método para ser sobrescrito por la bomba específica
    // Cada bomba genera las partículas en distintas posiciones y ángulos
    generateFluid(rpm, viscosity, time) {
        console.warn("generateFluid() debe ser sobrescrito en la bomba hija.");
    }

    // Gestión automática del ciclo de vida del fluido (común para todas)
    updateFluid(rpm, viscosity, time) {
        this.generateFluid(rpm, viscosity, time);

        // Actualizar y limpiar partículas viejas o fuera de la pantalla
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].isDead(this.width, this.height)) {
                this.particles.splice(i, 1);
            }
        }
    }

    drawFluid(ctx) {
        for (let particle of this.particles) {
            particle.draw(ctx);
        }
    }

    // --- LÓGICA MECÁNICA Y TERMODINÁMICA ---
    
    // Método para ser sobrescrito. Aquí pones las fórmulas exactas de cada bomba.
    calculateTelemetry(rpm, viscosity) {
        // Ejemplo genérico base:
        this.flowRate = rpm * 0.1; 
        this.pressure = viscosity * 0.5;
        this.efficiency = 75; 
        this.power = (this.flowRate * this.pressure) / (this.efficiency / 100);

        return {
            Q: this.flowRate,
            P: this.pressure,
            eff: this.efficiency,
            W: this.power
        };
    }

    // Método de dibujo mecánico a ser sobrescrito
    drawMechanism(ctx, time, rpm) {
        console.warn("drawMechanism() debe ser sobrescrito en la bomba hija.");
    }

    // --- BUCLE PRINCIPAL DE LA BOMBA ---
    
    // Este es el único método que main.js necesita llamar.
    // Orquesta el orden correcto: actualizar física, calcular datos, dibujar mecanismo, dibujar fluido.
    render(ctx, time, rpm, viscosity) {
        this.updateFluid(rpm, viscosity, time);
        this.drawMechanism(ctx, time, rpm);
        this.drawFluid(ctx); // Dibujamos el fluido encima del mecanismo
    }
}
