// /bombas/Centrifuga.js
import { PumpBase, Particle } from './PumpBase.js';

export class Centrifuga extends PumpBase {

    // ============================================================
    // UTILIDADES DE COLOR (interpolación lineal RGB)
    // ============================================================
    _lerpColor(c1, c2, t) {
        const k = Math.max(0, Math.min(1, t));
        const r = Math.round(c1[0] + (c2[0] - c1[0]) * k);
        const g = Math.round(c1[1] + (c2[1] - c1[1]) * k);
        const b = Math.round(c1[2] + (c2[2] - c1[2]) * k);
        return `rgb(${r}, ${g}, ${b})`;
    }

    // Ojo del rodete (cian brillante) -> borde del rodete (azul intenso)
    _colorRodete(t) {
        return this._lerpColor([125, 244, 246], [37, 99, 235], t);
    }

    // Entrada del conducto (azul intenso) -> salida a presión (azul profundo)
    _colorDescarga(t) {
        return this._lerpColor([59, 130, 246], [15, 32, 75], t);
    }

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

                // --- Efecto 1: Rodete ---
                // Nacen en el "ojo" (centro) del impulsor y son arrastradas
                // radialmente por los álabes curvados hacia atrás: además del
                // empuje radial reciben una componente tangencial (la estela
                // que deja un álabe "backward-curved" al girar).
                const r0 = 6 + Math.random() * 6; // muy cerca del ojo del rodete
                const radial = speedBase * (0.9 + Math.random() * 0.3);
                const tangential = speedBase * 0.55;

                const vxR = Math.cos(angle) * radial - Math.sin(angle) * tangential + (Math.random() - 0.5) * 0.4;
                const vyR = Math.sin(angle) * radial + Math.cos(angle) * tangential + (Math.random() - 0.5) * 0.4;

                let p_rodete = new Particle(
                    this.cx + Math.cos(angle) * r0,
                    this.cy + Math.sin(angle) * r0,
                    vxR,
                    vyR,
                    particleSizeBase,
                    this._colorRodete(Math.random()) // color: cian (ojo) -> azul (borde)
                );
                // Compatibilidad: si la clase Particle no acepta color por
                // constructor, lo fijamos igualmente como propiedad.
                p_rodete.color = p_rodete.color || this._colorRodete(Math.random());

                // --- Efecto 2: Conducto de descarga ---
                // Avanzan a presión por el tubo superior derecho; cuanto más
                // cerca de la salida, más oscuro/intenso es el azul.
                const travel = Math.random(); // 0 = entrada del tubo, 1 = boca de salida
                let p_descarga = new Particle(
                    this.cx + travel * 250,
                    this.cy - 75 + (Math.random() * 20 - 10), // Ubicadas en el tubo superior
                    speedBase * (2 + travel * 0.35), // Alta velocidad horizontal hacia la derecha
                    (Math.random() - 0.5) * 0.2, // Poca dispersión vertical
                    particleSizeBase * (1 - travel * 0.15),
                    this._colorDescarga(travel)
                );
                p_descarga.color = p_descarga.color || this._colorDescarga(travel);

                this.particles.push(p_rodete, p_descarga);
            }
        }
    }

    drawMechanism(ctx, time, rpm) {
        ctx.save();

        // ============================================================
        // 1. VOLUTA (CARCASA) — espiral de Arquímedes en acero/hierro fundido
        // ============================================================
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 16;
        ctx.shadowOffsetY = 6;

        const turns = 1.5;   // vueltas antes de abrirse hacia el tubo de descarga
        const rStart = 30;   // radio interno, junto al ojo del rodete
        const rEnd = 100;    // radio donde la voluta se abre hacia la descarga
        const steps = 90;

        // Borde exterior (creciente) ...
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const ang = -Math.PI * 0.5 + t * Math.PI * 2 * turns;
            const rOuter = rStart + (rEnd - rStart) * t + 13;
            const x = this.cx + Math.cos(ang) * rOuter;
            const y = this.cy + Math.sin(ang) * rOuter;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        // ... y borde interior (decreciente) para cerrar la banda de la voluta
        for (let i = steps; i >= 0; i--) {
            const t = i / steps;
            const ang = -Math.PI * 0.5 + t * Math.PI * 2 * turns;
            const rInner = rStart + (rEnd - rStart) * t - 9;
            const x = this.cx + Math.cos(ang) * rInner;
            const y = this.cy + Math.sin(ang) * rInner;
            ctx.lineTo(x, y);
        }
        ctx.closePath();

        const voluteGrad = ctx.createLinearGradient(this.cx - rEnd, this.cy - rEnd, this.cx + rEnd, this.cy + rEnd);
        voluteGrad.addColorStop(0, '#cbd5e1');
        voluteGrad.addColorStop(0.25, '#64748b');
        voluteGrad.addColorStop(0.5, '#334155');
        voluteGrad.addColorStop(0.75, '#475569');
        voluteGrad.addColorStop(1, '#94a3b8');
        ctx.fillStyle = voluteGrad;
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#1e293b';
        ctx.stroke();
        ctx.restore();

        // Brillo especular (sensación de metal pulido)
        ctx.save();
        ctx.globalAlpha = 0.4;
        const sheen = ctx.createLinearGradient(this.cx - rEnd, this.cy - rEnd, this.cx, this.cy);
        sheen.addColorStop(0, 'rgba(255,255,255,0.65)');
        sheen.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, rEnd + 8, Math.PI * 1.05, Math.PI * 1.75);
        ctx.lineWidth = 10;
        ctx.strokeStyle = sheen;
        ctx.stroke();
        ctx.restore();

        // ============================================================
        // 2. TUBO DE DESCARGA — cilindro con sombreado 3D
        // ============================================================
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetY = 4;
        const pipeGrad = ctx.createLinearGradient(0, this.cy - 75 - 14, 0, this.cy - 75 + 14);
        pipeGrad.addColorStop(0, '#cbd5e1');
        pipeGrad.addColorStop(0.45, '#475569');
        pipeGrad.addColorStop(0.55, '#1e293b');
        pipeGrad.addColorStop(1, '#94a3b8');
        ctx.strokeStyle = pipeGrad;
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(this.cx + 8, this.cy - 75);
        ctx.lineTo(this.cx + 250, this.cy - 75);
        ctx.stroke();
        ctx.restore();

        // ============================================================
        // 3. RODETE GIRATORIO — álabes curvados hacia atrás (backward-curved)
        // ============================================================
        ctx.save();
        ctx.translate(this.cx, this.cy);
        ctx.rotate(time * rpm * 0.005); // El metal siempre gira a los RPM reales

        const bladeCount = 6;
        for (let i = 0; i < bladeCount; i++) {
            ctx.save();
            ctx.rotate((Math.PI * 2 / bladeCount) * i);

            // Sombra de profundidad bajo el álabe
            ctx.beginPath();
            ctx.moveTo(2, 2);
            ctx.quadraticCurveTo(26, 10, 58, -14);
            ctx.lineWidth = 9;
            ctx.strokeStyle = 'rgba(0,0,0,0.25)';
            ctx.stroke();

            // Álabe curvado hacia atrás respecto al sentido de giro, con gradiente metálico
            const bladeGrad = ctx.createLinearGradient(0, 0, 60, -16);
            bladeGrad.addColorStop(0, '#f1f5f9');
            bladeGrad.addColorStop(0.5, '#94a3b8');
            bladeGrad.addColorStop(1, '#475569');
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(24, 6, 60, -16);
            ctx.lineWidth = 6;
            ctx.lineCap = 'round';
            ctx.strokeStyle = bladeGrad;
            ctx.stroke();

            ctx.restore();
        }

        // Eje central / ojo del impulsor con relieve 3D
        const hubGrad = ctx.createRadialGradient(-5, -5, 2, 0, 0, 16);
        hubGrad.addColorStop(0, '#f1f5f9');
        hubGrad.addColorStop(0.55, '#475569');
        hubGrad.addColorStop(1, '#0f172a');
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fillStyle = hubGrad;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#cbd5e1';
        ctx.stroke();

        ctx.restore(); // deshace translate/rotate del rodete
        ctx.restore(); // restore final del método
    }
}
