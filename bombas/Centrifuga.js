// /bombas/Centrifuga.js
import { PumpBase, Particle } from './PumpBase.js';

export class Centrifuga extends PumpBase {
    
    generateFluid(rpm, viscosity, time) {
        // FÍSICA DE VISCOSIDAD: Mayor viscosidad = menor velocidad y fluido más espeso
        const visFactor = 20 / (viscosity + 10);
        const speedBase = (rpm / 500) * visFactor;
        const particleSizeBase = 2 + (viscosity / 25); // Más viscoso = partículas más gordas
        
        if (rpm > 0) {
            // Generar partículas afectadas por la velocidad (RPM)
            let limit = Math.floor((rpm / 500) * 2);
            for (let i = 0; i < limit + 1; i++) {
                let angle = Math.random() * Math.PI * 2;
                
                // Efecto 1: Rodete (Giran y salen del centro)
                let p_rodete = new Particle(
                    this.cx + Math.cos(angle) * 15, 
                    this.cy + Math.sin(angle) * 15, 
                    Math.cos(angle) * speedBase + (Math.random() - 0.5), 
                    Math.sin(angle) * speedBase + (Math.random() - 0.5),
                    particleSizeBase
                );
                
                // Efecto 2: Conducto de descarga (Salen a presión por el tubo derecho)
                let p_descarga = new Particle(
                    this.cx + Math.random() * 50, 
                    this.cy - 75 + (Math.random() * 20 - 10), // Ubicadas en el tubo superior
                    speedBase * 2, // Alta velocidad horizontal hacia la derecha
                    (Math.random() - 0.5) * 0.2, // Poca dispersión vertical
                    particleSizeBase
                );

                this.particles.push(p_rodete, p_descarga);
            }
        }
    }

    drawMechanism(ctx, time, rpm) {
        ctx.save();
        
        // --- 1. CONDUCTOS Y CARCASA (Voluta) ---
        ctx.strokeStyle = '#475569'; // Color acero oscuro
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        // Tubo de descarga (hacia la derecha)
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.moveTo(this.cx, this.cy - 75);
        ctx.lineTo(this.cx + 250, this.cy - 75);
        ctx.stroke();

        // Tubo de succión (Axial, lo simulamos con un círculo oscuro en el centro)
        // Representa que el tubo viene de frente hacia la pantalla

        // Voluta exterior
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, 90, 0, Math.PI * 1.5);
        ctx.lineWidth = 12;
        ctx.stroke();

        // --- 2. RODETE GIRATORIO ---
        ctx.translate(this.cx, this.cy);
        ctx.rotate(time * rpm * 0.005); // El metal siempre gira a los RPM reales
        
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        
        // Álabes
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(20, 40, 60, 0);
            ctx.stroke();
            ctx.rotate(Math.PI / 3);
        }
        
        // Eje central
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fillStyle = '#0f172a'; // Centro hueco (tubo succión axial)
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#cbd5e1';
        ctx.stroke();
        
        ctx.restore();
    }
}
