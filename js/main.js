// /js/main.js
import { Centrifuga } from '../bombas/Centrifuga.js';
import { Piston } from '../bombas/Piston.js';

const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvasContainer');

// Referencias a la UI
const pumpSelector = document.getElementById('pumpSelector');
const rpmSlider = document.getElementById('rpmSlider');
const visSlider = document.getElementById('visSlider');
const rpmValue = document.getElementById('rpmValue');
const visValue = document.getElementById('visValue');

// Mantiene el canvas ajustado al espacio sobrante del panel lateral
function resizeCanvas() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    
    // Recalcular el centro Y los límites para todas las bombas instanciadas
    Object.values(bombas).forEach(bomba => {
        bomba.width = canvas.width;   // <-- LÍNEA NUEVA: Actualiza el límite de muerte X
        bomba.height = canvas.height; // <-- LÍNEA NUEVA: Actualiza el límite de muerte Y
        bomba.cx = canvas.width / 2;
        bomba.cy = canvas.height / 2;
    });
}
window.addEventListener('resize', resizeCanvas);

// Instanciar todas las bombas disponibles
const bombas = {
    centrifugal: new Centrifuga(100, 100), // Tamaño inicial falso, resizeCanvas lo corrige abajo
    piston: new Piston(100, 100)
};

// Ajustar tamaño real
resizeCanvas();

// Estado inicial
let bombaActiva = bombas['centrifugal'];
let time = 0;

// Listeners: Cuando el usuario interactúa con la página
pumpSelector.addEventListener('change', (e) => {
    bombaActiva = bombas[e.target.value];
    bombaActiva.particles = []; // Limpiar las partículas del agua de la bomba anterior
});

rpmSlider.addEventListener('input', (e) => {
    rpmValue.innerText = e.target.value;
});

visSlider.addEventListener('input', (e) => {
    visValue.innerText = e.target.value;
});

// Bucle de Animación
function animate() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    time++;
    
    // Leer valores de la UI en este fotograma exacto
    const rpm = parseInt(rpmSlider.value);
    const viscosity = parseInt(visSlider.value);

    // Renderizar la bomba que esté seleccionada
    bombaActiva.render(ctx, time, rpm, viscosity);
    
    requestAnimationFrame(animate);
}

// Arrancar simulación
animate();
