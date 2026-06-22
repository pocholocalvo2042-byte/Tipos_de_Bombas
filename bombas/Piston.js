// /bombas/Piston.js
import { PumpBase, Particle } from './PumpBase.js';

export class Piston extends PumpBase {
    
    generateFluid(rpm, viscosity, time) {
        // FÍSICA DE VISCOSIDAD
        const visFactor = 20 / (viscosity + 10);
        const speedBase = (rpm / 500) * visFactor;
        const particleSizeBase = 2 + (viscosity / 25);
        
        // Ciclo mecánico usa los RPM puros (el metal no se frena visualmente)
        const pureSpeed = rpm / 500;
        let pistonCycle = Math.sin(time * pureSpeed * 0.1);

        if (rpm > 0) {
            let limit = Math.floor(pureSpeed * 2);
            if (pistonCycle > 0) {
                // FASE DE DESCARGA: Empuja fluido por el tubo superior
                for (let i = 0; i < limit + 1; i++) {
                    let p = new Particle(
                        this.cx - 40 + (Math.random() * 20 - 10), // Base del tubo superior
                        this.cy - 30, 
                        (Math.random() - 0.5) * 0.5, 
                        -speedBase * 2.5, // Sube rápido
                        particleSizeBase
                    );
                    this.particles.push(p);
                }
            } else {
                // FASE DE SUCCIÓN: Jala fluido por el tubo inferior
                for (let i = 0; i < limit + 1; i++) {
                    let p = new Particle(
                        this.cx - 40 + (Math.random() * 20 - 10), 
                        this.cy + 120, // Nace muy abajo en el conducto
                        (Math.random() - 0.5) * 0.5, 
                        -speedBase * 2, // Sube hacia el cilindro
                        particleSizeBase
                    );
                    p.life = 0.5; // Mueren al entrar al cilindro (simula que se llenó)
                    this.particles.push(p);
                }
            }
        }
    }

    drawMechanism(ctx, time, rpm) {
        let speedBase = rpm / 500;
        let pos = Math.sin(time * speedBase * 0.1) * 40; 
        let pistonCycle = Math.sin(time * speedBase * 0.1);

        ctx.save();
        
        // --- 1. CONDUCTOS (Tuberías de entrada y salida) ---
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 14;

        // Conducto de Descarga (Arriba)
        ctx.beginPath();
        ctx.moveTo(this.cx - 40, this.cy - 30);
        ctx.lineTo(this.cx - 40, this.cy - 120);
        ctx.stroke();

        // Conducto de Succión (Abajo)
        ctx.beginPath();
        ctx.moveTo(this.cx - 40, this.cy + 30);
        ctx.lineTo(this.cx - 40, this.cy + 120);
        ctx.stroke();

        // --- 2. CILINDRO Y VÁLVULAS ---
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 6;
        ctx.strokeRect(this.cx - 50, this.cy - 30, 100, 60); // Cilindro
        
        // Válvula Descarga (Arriba - Se abre en fase de descarga)
        ctx.fillStyle = pistonCycle > 0 ? '#22c55e' : '#ef4444'; // Verde = Abierto, Rojo = Cerrado
        ctx.fillRect(this.cx - 50, this.cy - 34, 20, 6);
        
        // Válvula Succión (Abajo - Se abre en fase de succión)
        ctx.fillStyle = pistonCycle <= 0 ? '#22c55e' : '#ef4444';
        ctx.fillRect(this.cx - 50, this.cy + 28, 20, 6);

        // --- 3. PISTÓN Y BIELA ---
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(this.cx - 45 + pos, this.cy - 25, 20, 50);

        ctx.beginPath();
        ctx.moveTo(this.cx - 35 + pos, this.cy);
        ctx.lineTo(this.cx - 150, this.cy);
        ctx.lineWidth = 8;
        ctx.strokeStyle = '#94a3b8';
        ctx.stroke();
        
        ctx.restore();
    }
}
