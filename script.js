const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const letters = [];
const density = 1000;
const pixelRatio = window.devicePixelRatio || 1;

// Physics constants
const gravity = 9.8 * 160;
const restitution = 0.8;
const airResistance = 0.99;
let lastTime;

class Letter {
    constructor() {
        this.char = String.fromCharCode(65 + Math.random() * 26);
        this.size = Math.random() * 30 + 20;
        this.mass = (this.size ** 2) * density / 10000;
        this.x = Math.random() * canvas.width;
        this.y = -this.size;
        this.vx = 0;
        this.vy = 0;
        this.color = `hsl(${Math.random() * 360}, 70%, 70%)`;
    }

    update(deltaTime) {
        this.vy += (gravity * deltaTime) / this.mass;
        this.vx *= airResistance;
        this.vy *= airResistance;

        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        const radius = this.size/2;
        if (this.x < radius) {
            this.x = radius;
            this.vx *= -restitution;
        }
        if (this.x > canvas.width - radius) {
            this.x = canvas.width - radius;
            this.vx *= -restitution;
        }
        if (this.y > canvas.height - radius) {
            this.y = canvas.height - radius;
            this.vy *= -restitution;
            this.vx *= 0.9;
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.char, this.x, this.y);
    }
}

function checkCollisions() {
    // ... keep the same collision code from previous answer ...
}

function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    // Set canvas dimensions
    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    
    ctx.scale(pixelRatio, pixelRatio);
}

function animate(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    letters.forEach(letter => letter.update(deltaTime));
    checkCollisions();
    letters.forEach(letter => letter.draw());

    if (letters.length > 100) letters.shift();
    requestAnimationFrame(animate);
}

// Initialization
window.addEventListener('DOMContentLoaded', () => {
    resize();
    window.addEventListener('resize', resize);
    setInterval(() => letters.push(new Letter()), 500);
    requestAnimationFrame(animate);
});
