// /js/main.js
import { Centrifuga } from '../bombas/Centrifuga.js';

const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');

// Ajustar el canvas al tamaño de la pantalla
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Instanciar la bomba centrífuga
const bombaActiva = new Centrifuga(canvas.width, canvas.height);

let time = 0;

// El bucle de animación
function animate() {
    // 1. Limpiar el canvas en cada fotograma (Color fondo oscuro)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    time++;
    
    // 2. Renderizar la bomba (pasando RPM=1500 y Viscosidad=10)
    bombaActiva.render(ctx, time, 1500, 10);
    
    // 3. Repetir infinitamente
    requestAnimationFrame(animate);
}

// Iniciar simulador
animate();
