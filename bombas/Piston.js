// /bombas/Piston.js
import { PumpBase, Particle } from './PumpBase.js';

export class Piston extends PumpBase {
    
    generateFluid(rpm, viscosity, time) {
        const speedBase = rpm / 500;
        
        // Movimiento alternativo: Math.sin da valores entre -1 y 1
        let pistonCycle = Math.sin(time * speedBase * 0.1);

        // Solo expulsa fluido cuando el pistón empuja hacia la derecha (> 0)
        if (pistonCycle > 0 && rpm > 0) {
            for (let i = 0; i < speedBase * 2; i++) {
                let p = new Particle(
                    this.cx + 50, // Nacen en la boca del cilindro
                    this.cy - 20 + Math.random() * 40,
                    speedBase * 3, // Velocidad lineal alta en X
                    0              // Sin dispersión en Y (flujo laminar)
                );
                this.particles.push(p);
            }
        }
    }

    drawMechanism(ctx, time, rpm) {
        let speedBase = rpm / 500;
        // Calculamos la posición del pistón animada
        let pos = Math.sin(time * speedBase * 0.1) * 40; 

        ctx.save();
        
        // Dibujar Cilindro
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 6;
        ctx.strokeRect(this.cx - 50, this.cy - 30, 100, 60);

        // Dibujar Pistón (se mueve con la variable 'pos')
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(this.cx - 45 + pos, this.cy - 25, 20, 50);

        // Dibujar Biela (Rod) que conecta el pistón
        ctx.beginPath();
        ctx.moveTo(this.cx - 35 + pos, this.cy);
        ctx.lineTo(this.cx - 120, this.cy);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#94a3b8';
        ctx.stroke();
        
        ctx.restore();
    }
}
