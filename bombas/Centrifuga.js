// /bombas/Centrifuga.js
import { PumpBase, Particle } from './PumpBase.js';

export class Centrifuga extends PumpBase {

    generateFluid(rpm, viscosity, time) {
        // FÍSICA DE VISCOSIDAD: Mayor viscosidad = menor velocidad y fluido más espeso
        const visFactor = 20 / (viscosity + 10);
        const speedBase = (rpm / 500) * visFactor;

        // Tamaño reactivo a viscosidad con más rango dinámico
        const particleSizeBase = 1.5 + (viscosity / 18);

        if (rpm > 0) {
            let limit = Math.floor((rpm / 500) * 2);
            for (let i = 0; i < limit + 1; i++) {
                let angle = Math.random() * Math.PI * 2;

                // Efecto 1: Rodete — salen del centro con leve dispersión turbulenta
                let p_rodete = new Particle(
                    this.cx + Math.cos(angle) * 15,
                    this.cy + Math.sin(angle) * 15,
                    Math.cos(angle) * speedBase + (Math.random() - 0.5) * 0.8,
                    Math.sin(angle) * speedBase + (Math.random() - 0.5) * 0.8,
                    particleSizeBase + Math.random() * 1.2  // variación por partícula
                );

                // Variación sutil de color azul-cian para dar volumen al agua
                p_rodete._hue = 195 + Math.floor(Math.random() * 20);   // 195–215
                p_rodete._sat = 75 + Math.floor(Math.random() * 20);     // 75–95%
                p_rodete._lit = 55 + Math.floor(Math.random() * 20);     // 55–75%

                // Efecto 2: Conducto de descarga — alta presión, poca dispersión
                let p_descarga = new Particle(
                    this.cx + Math.random() * 50,
                    this.cy - 75 + (Math.random() * 16 - 8),
                    speedBase * 2.2,
                    (Math.random() - 0.5) * 0.15,
                    particleSizeBase * 0.9
                );
                p_descarga._hue = 200 + Math.floor(Math.random() * 15);
                p_descarga._sat = 85 + Math.floor(Math.random() * 10);
                p_descarga._lit = 60 + Math.floor(Math.random() * 15);

                this.particles.push(p_rodete, p_descarga);
            }
        }
    }

    // Sobrescribe draw de partículas para usar color HSL variable
    drawFluid(ctx) {
        for (let p of this.particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            const h = p._hue  ?? 205;
            const s = p._sat  ?? 85;
            const l = p._lit  ?? 65;
            ctx.fillStyle = `hsla(${h}, ${s}%, ${l}%, ${p.alpha * p.life})`;
            ctx.fill();
        }
    }

    drawMechanism(ctx, time, rpm) {
        ctx.save();

        // ─── HELPERS DE GRADIENTE ────────────────────────────────────────────────

        /** Gradiente metálico para tuberías horizontales */
        const pipeGradH = (x0, y0, x1, y1) => {
            const g = ctx.createLinearGradient(x0, y0, x1, y1);
            g.addColorStop(0.00, '#1e293b');
            g.addColorStop(0.25, '#475569');
            g.addColorStop(0.50, '#94a3b8');  // brillo central
            g.addColorStop(0.75, '#334155');
            g.addColorStop(1.00, '#0f172a');
            return g;
        };

        /** Gradiente metálico radial para piezas circulares */
        const radialMetal = (cx, cy, r0, r1) => {
            const g = ctx.createRadialGradient(cx - r1 * 0.3, cy - r1 * 0.3, r0, cx, cy, r1);
            g.addColorStop(0.0,  '#94a3b8');
            g.addColorStop(0.4,  '#475569');
            g.addColorStop(0.75, '#1e293b');
            g.addColorStop(1.0,  '#0f172a');
            return g;
        };

        // ─── 1. TUBO DE DESCARGA (horizontal, hacia la derecha) ────────────────

        // Sombra del tubo
        ctx.shadowColor   = 'rgba(0,0,0,0.55)';
        ctx.shadowBlur    = 12;
        ctx.shadowOffsetY = 4;

        ctx.lineWidth   = 20;
        ctx.lineCap     = 'round';
        ctx.strokeStyle = pipeGradH(this.cx, this.cy - 82, this.cx, this.cy - 68);
        ctx.beginPath();
        ctx.moveTo(this.cx, this.cy - 75);
        ctx.lineTo(this.cx + 250, this.cy - 75);
        ctx.stroke();

        // Línea especular (brillo)
        ctx.shadowBlur  = 0;
        ctx.lineWidth   = 2;
        ctx.strokeStyle = 'rgba(203,213,225,0.35)';
        ctx.beginPath();
        ctx.moveTo(this.cx + 4, this.cy - 80);
        ctx.lineTo(this.cx + 245, this.cy - 80);
        ctx.stroke();

        // ─── 2. VOLUTA (carcasa exterior) ──────────────────────────────────────

        ctx.shadowColor   = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur    = 18;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 5;

        // Relleno de la carcasa
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, 96, 0, Math.PI * 2);
        ctx.fillStyle = radialMetal(this.cx, this.cy, 10, 96);
        ctx.fill();

        // Borde exterior de la voluta
        ctx.lineWidth   = 12;
        ctx.strokeStyle = '#334155';
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, 90, 0, Math.PI * 1.5);
        ctx.stroke();

        // Anillo interior (profundidad)
        ctx.shadowBlur  = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.lineWidth   = 3;
        ctx.strokeStyle = 'rgba(148,163,184,0.2)';
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, 78, 0, Math.PI * 2);
        ctx.stroke();

        // ─── 3. RODETE GIRATORIO ───────────────────────────────────────────────

        ctx.translate(this.cx, this.cy);
        ctx.rotate(time * rpm * 0.005);

        // Álabes con gradiente metálico individual
        for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.rotate((Math.PI / 3) * i);

            // Gradiente por álabe (de base oscura a punta brillante)
            const bladeGrad = ctx.createLinearGradient(0, 0, 62, 0);
            bladeGrad.addColorStop(0.0, '#1e293b');
            bladeGrad.addColorStop(0.5, '#94a3b8');
            bladeGrad.addColorStop(1.0, '#475569');

            ctx.lineWidth   = 5;
            ctx.strokeStyle = bladeGrad;
            ctx.shadowColor = 'rgba(0,0,0,0.4)';
            ctx.shadowBlur  = 6;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(20, 40, 62, 0);
            ctx.stroke();

            ctx.restore();
        }

        // Hub central (disco de fijación del rodete)
        ctx.shadowBlur  = 10;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';

        ctx.beginPath();
        ctx.arc(0, 0, 17, 0, Math.PI * 2);
        ctx.fillStyle = radialMetal(0, 0, 0, 17);
        ctx.fill();

        // Eje (orificio de succión axial)
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#020617';
        ctx.fill();

        // Anillo cromado del eje
        ctx.lineWidth   = 2.5;
        ctx.strokeStyle = '#94a3b8';
        ctx.shadowBlur  = 4;
        ctx.shadowColor = 'rgba(148,163,184,0.5)';
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.stroke();

        ctx.restore();
    }
}
