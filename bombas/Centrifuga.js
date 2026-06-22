// /bombas/Centrifuga.js
import { PumpBase, Particle } from './PumpBase.js';

export class Centrifuga extends PumpBase {
    
    // Sobrescribimos cómo se genera el fluido
    generateFluid(rpm, viscosity, time) {
        const speedBase = rpm / 500;
        
        // Solo generar partículas si la bomba está girando
        if (rpm > 0) {
            for (let i = 0; i < speedBase * 2; i++) {
                let angle = Math.random() * Math.PI * 2;
                
                // Las partículas nacen en el centro y salen disparadas en todas direcciones
                let p = new Particle(
                    this.cx + Math.cos(angle) * 10, 
                    this.cy + Math.sin(angle) * 10, 
                    Math.cos(angle) * speedBase + (Math.random() - 0.5), 
                    Math.sin(angle) * speedBase + (Math.random() - 0.5)
                );
                this.particles.push(p);
            }
        }
    }

    // Sobrescribimos cómo se dibuja el metal
    drawMechanism(ctx, time, rpm) {
        ctx.save();
        ctx.translate(this.cx, this.cy);
        ctx.rotate(time * rpm * 0.005); // Rotación basada en RPM
        
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        
        // Dibujar los 6 álabes del impulsor
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(20, 40, 60, 0);
            ctx.stroke();
            ctx.rotate(Math.PI / 3);
        }
        
        // Centro del eje
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#cbd5e1';
        ctx.fill();
        ctx.restore();
        
        // Voluta exterior (la carcasa estática)
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, 90, 0, Math.PI * 1.5);
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 8;
        ctx.stroke();
    }
}

