// /bombas/Piston.js
import { PumpBase, Particle } from './PumpBase.js';

export class Piston extends PumpBase {

    generateFluid(rpm, viscosity, time) {
        // FÍSICA DE VISCOSIDAD
        const visFactor = 20 / (viscosity + 10);
        const speedBase = (rpm / 500) * visFactor;

        // Tamaño reactivo a viscosidad con más rango dinámico
        const particleSizeBase = 1.5 + (viscosity / 18);

        // Ciclo mecánico usa los RPM puros (el metal no se frena visualmente)
        const pureSpeed = rpm / 500;
        let pistonCycle = Math.sin(time * pureSpeed * 0.1);

        if (rpm > 0) {
            let limit = Math.floor(pureSpeed * 2);

            if (pistonCycle > 0) {
                // FASE DE DESCARGA: Empuja fluido por el tubo superior
                for (let i = 0; i < limit + 1; i++) {
                    let p = new Particle(
                        this.cx - 40 + (Math.random() * 20 - 10),
                        this.cy - 30,
                        (Math.random() - 0.5) * 0.4,
                        -speedBase * 2.5,
                        particleSizeBase + Math.random() * 1.0
                    );
                    // Azul más brillante en descarga (alta presión)
                    p._hue = 200 + Math.floor(Math.random() * 15);
                    p._sat = 88 + Math.floor(Math.random() * 10);
                    p._lit = 58 + Math.floor(Math.random() * 15);
                    this.particles.push(p);
                }
            } else {
                // FASE DE SUCCIÓN: Jala fluido por el tubo inferior
                for (let i = 0; i < limit + 1; i++) {
                    let p = new Particle(
                        this.cx - 40 + (Math.random() * 20 - 10),
                        this.cy + 120,
                        (Math.random() - 0.5) * 0.4,
                        -speedBase * 2,
                        particleSizeBase * 0.85
                    );
                    // Azul más tenue en succión (baja presión)
                    p._hue = 205 + Math.floor(Math.random() * 15);
                    p._sat = 70 + Math.floor(Math.random() * 15);
                    p._lit = 45 + Math.floor(Math.random() * 15);
                    p.life = 0.5;
                    this.particles.push(p);
                }
            }
        }
    }

    // Sobrescribe draw de partículas para usar color HSL variable
    drawFluid(ctx) {
        for (let p of this.particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            const h = p._hue ?? 205;
            const s = p._sat ?? 85;
            const l = p._lit ?? 60;
            ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${p.alpha * p.life})`;
            ctx.fill();
        }
    }

    drawMechanism(ctx, time, rpm) {
        let speedBase    = rpm / 500;
        let pos          = Math.sin(time * speedBase * 0.1) * 40;
        let pistonCycle  = Math.sin(time * speedBase * 0.1);

        ctx.save();

        // ─── HELPERS DE GRADIENTE ────────────────────────────────────────────────

        /** Gradiente metálico vertical para tuberías */
        const pipeGradV = (x, y0, y1) => {
            const g = ctx.createLinearGradient(x - 7, y0, x + 7, y0);
            g.addColorStop(0.00, '#0f172a');
            g.addColorStop(0.25, '#334155');
            g.addColorStop(0.50, '#94a3b8');  // brillo central
            g.addColorStop(0.75, '#475569');
            g.addColorStop(1.00, '#1e293b');
            return g;
        };

        /** Gradiente metálico horizontal para cilindro / pistón */
        const metalGradH = (y, h) => {
            const g = ctx.createLinearGradient(0, y, 0, y + h);
            g.addColorStop(0.00, '#94a3b8');
            g.addColorStop(0.15, '#cbd5e1');  // highlight superior
            g.addColorStop(0.50, '#475569');
            g.addColorStop(0.85, '#1e293b');
            g.addColorStop(1.00, '#0f172a');
            return g;
        };

        /** Gradiente radial para válvulas */
        const valveGrad = (x, y, w, h, open) => {
            const g = ctx.createLinearGradient(x, y, x, y + h);
            if (open) {
                g.addColorStop(0.0, '#4ade80');
                g.addColorStop(0.5, '#22c55e');
                g.addColorStop(1.0, '#15803d');
            } else {
                g.addColorStop(0.0, '#f87171');
                g.addColorStop(0.5, '#ef4444');
                g.addColorStop(1.0, '#b91c1c');
            }
            return g;
        };

        // ─── 1. CONDUCTOS VERTICALES ──────────────────────────────────────────

        ctx.shadowColor   = 'rgba(0,0,0,0.55)';
        ctx.shadowBlur    = 14;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        ctx.lineWidth   = 20;
        ctx.lineCap     = 'round';

        // Descarga (arriba)
        ctx.strokeStyle = pipeGradV(this.cx - 40, this.cy - 30, this.cy - 120);
        ctx.beginPath();
        ctx.moveTo(this.cx - 40, this.cy - 30);
        ctx.lineTo(this.cx - 40, this.cy - 120);
        ctx.stroke();

        // Succión (abajo)
        ctx.strokeStyle = pipeGradV(this.cx - 40, this.cy + 30, this.cy + 120);
        ctx.beginPath();
        ctx.moveTo(this.cx - 40, this.cy + 30);
        ctx.lineTo(this.cx - 40, this.cy + 120);
        ctx.stroke();

        // Líneas especulares de brillo en tuberías
        ctx.shadowBlur  = 0;
        ctx.lineWidth   = 1.5;
        ctx.strokeStyle = 'rgba(203,213,225,0.3)';
        ctx.beginPath();
        ctx.moveTo(this.cx - 44, this.cy - 32);
        ctx.lineTo(this.cx - 44, this.cy - 118);
        ctx.moveTo(this.cx - 44, this.cy + 32);
        ctx.lineTo(this.cx - 44, this.cy + 118);
        ctx.stroke();

        // ─── 2. CILINDRO ──────────────────────────────────────────────────────

        ctx.shadowColor   = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur    = 16;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4;

        // Relleno del cilindro
        ctx.fillStyle = metalGradH(this.cy - 30, 60);
        ctx.fillRect(this.cx - 50, this.cy - 30, 100, 60);

        // Borde del cilindro
        ctx.shadowBlur  = 0;
        ctx.lineWidth   = 5;
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(this.cx - 50, this.cy - 30, 100, 60);

        // Línea de brillo superior del cilindro
        ctx.lineWidth   = 1.5;
        ctx.strokeStyle = 'rgba(203,213,225,0.4)';
        ctx.beginPath();
        ctx.moveTo(this.cx - 48, this.cy - 28);
        ctx.lineTo(this.cx + 48, this.cy - 28);
        ctx.stroke();

        // ─── 3. VÁLVULAS CON GLOW ─────────────────────────────────────────────

        const valveOpen_D = pistonCycle > 0;
        const valveOpen_S = pistonCycle <= 0;

        // Halo de válvula (glow ambiental)
        ctx.shadowBlur  = 14;
        ctx.shadowColor = valveOpen_D ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.4)';
        ctx.fillStyle   = valveGrad(this.cx - 50, this.cy - 34, 20, 6, valveOpen_D);
        ctx.fillRect(this.cx - 50, this.cy - 34, 20, 6);

        ctx.shadowColor = valveOpen_S ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.4)';
        ctx.fillStyle   = valveGrad(this.cx - 50, this.cy + 28, 20, 6, valveOpen_S);
        ctx.fillRect(this.cx - 50, this.cy + 28, 20, 6);

        // ─── 4. PISTÓN ────────────────────────────────────────────────────────

        ctx.shadowBlur    = 12;
        ctx.shadowColor   = 'rgba(0,0,0,0.5)';
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Cuerpo del pistón con gradiente metálico brillante
        const pistonGrad = ctx.createLinearGradient(
            0, this.cy - 25, 0, this.cy + 25
        );
        pistonGrad.addColorStop(0.00, '#e2e8f0');   // highlight
        pistonGrad.addColorStop(0.20, '#94a3b8');
        pistonGrad.addColorStop(0.55, '#475569');
        pistonGrad.addColorStop(1.00, '#1e293b');

        ctx.fillStyle = pistonGrad;
        ctx.fillRect(this.cx - 45 + pos, this.cy - 25, 20, 50);

        // Borde del pistón
        ctx.shadowBlur  = 0;
        ctx.lineWidth   = 2;
        ctx.strokeStyle = '#0f172a';
        ctx.strokeRect(this.cx - 45 + pos, this.cy - 25, 20, 50);

        // Ranura de segmento (detalle realista)
        ctx.lineWidth   = 2;
        ctx.strokeStyle = 'rgba(15,23,42,0.7)';
        ctx.beginPath();
        ctx.moveTo(this.cx - 45 + pos, this.cy - 8);
        ctx.lineTo(this.cx - 25 + pos, this.cy - 8);
        ctx.moveTo(this.cx - 45 + pos, this.cy + 8);
        ctx.lineTo(this.cx - 25 + pos, this.cy + 8);
        ctx.stroke();

        // ─── 5. BIELA / VÁSTAGO ───────────────────────────────────────────────

        const rodGrad = ctx.createLinearGradient(
            this.cx - 35 + pos, this.cy - 4,
            this.cx - 35 + pos, this.cy + 4
        );
        rodGrad.addColorStop(0.0, '#94a3b8');
        rodGrad.addColorStop(0.4, '#cbd5e1');
        rodGrad.addColorStop(1.0, '#334155');

        ctx.lineWidth   = 9;
        ctx.strokeStyle = rodGrad;
        ctx.lineCap     = 'round';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur  = 8;

        ctx.beginPath();
        ctx.moveTo(this.cx - 35 + pos, this.cy);
        ctx.lineTo(this.cx - 150, this.cy);
        ctx.stroke();

        // Punto de articulación (pin)
        ctx.shadowBlur  = 6;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.beginPath();
        ctx.arc(this.cx - 150, this.cy, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#94a3b8';
        ctx.fill();
        ctx.lineWidth   = 2;
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();

        ctx.restore();
    }
}
