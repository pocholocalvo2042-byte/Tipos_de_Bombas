// /js/main.js
import { PumpBase } from '../bombas/PumpBase.js';

const canvas = document.getElementById('simCanvas');
const ctx = canvas.getContext('2d');

// Ajustar el canvas al tamaño de la ventana
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Instanciar la base (solo para probar que importa bien)
const bombaPrueba = new PumpBase(canvas.width, canvas.height);

// Si ves este mensaje en la consola de tu navegador (F12), ¡la estructura está perfecta!
console.log("Sistema inicializado. Instancia creada:", bombaPrueba);
