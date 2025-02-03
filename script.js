const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const letters = [];
const density = 1000; // kg/m³
const pixelRatio = window.devicePixelRatio || 1;

// Logical canvas dimensions (in CSS pixels)
let logicalWidth, logicalHeight;

// Physics constants
const gravity = 9.8 * 100; // Adjusted for better visibility
const restitution = 0.6;
const airResistance = 0.98;
let lastTime;

class Letter {
    constructor() {
        // Use an integer for the char code.
        this.char = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        this.size = Math.random() * 30 + 20;
        this.mass = (this.size ** 2) * density / 10000;
        // Use logicalWidth for the random position.
        this.x = Math.random() * logicalWidth;
        this.y = -this.size; // Start above the viewport
        this.vx = 0;
        this.vy = 0;
        this.color = `hsl(${Math.random() * 360}, 70%, 70%)`;
    }

    update(deltaTime) {
        // Apply gravity
        this.vy += gravity * deltaTime;
        
        // Apply air resistance
        this.vx *= airResistance;
        this.vy *= airResistance;

        // Update position
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;

        // Boundary collisions (using half the letter size as radius)
        const radius = this.size / 2;
        if (this.x < radius) {
            this.x = radius;
            this.vx *= -restitution;
        }
        if (this.x > logicalWidth - radius) {
            this.x = logicalWidth - radius;
            this.vx *= -restitution;
        }
        if (this.y > logicalHeight - radius) {
            this.y = logicalHeight - radius;
            this.vy *= -restitution;
            this.vx *= 0.8;
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
    for (let i = 0; i < letters.length; i++) {
        for (let j = i + 1; j < letters.length; j++) {
            const a = letters[i];
            const b = letters[j];
            
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDist = a.size / 2 + b.size / 2;

            if (distance < minDist) {
                // Collision resolution code can be added here.
            }
        }
    }
}

function resize() {
    // Use window.innerWidth/Height as the logical dimensions.
    logicalWidth = window.innerWidth;
    logicalHeight = window.innerHeight;
    
    // Set canvas dimensions with proper scaling
    canvas.width = logicalWidth * pixelRatio;
    canvas.height = logicalHeight * pixelRatio;
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;

    // Reset any existing transforms before applying a new scale.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(pixelRatio, pixelRatio);
}

function animate(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    // Clear canvas with a semi-transparent black background.
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, logicalWidth, logicalHeight);

    letters.forEach(letter => letter.update(deltaTime));
    checkCollisions();
    letters.forEach(letter => letter.draw());

    // Keep the number of letters capped.
    if (letters.length > 100) letters.shift();
    requestAnimationFrame(animate);
}

// Initialize after the DOM loads.
window.addEventListener('DOMContentLoaded', () => {
    resize();
    window.addEventListener('resize', resize);
    
    // Add letters at a fixed interval.
    setInterval(() => {
        if (letters.length < 100) {
            letters.push(new Letter());
        }
    }, 300);
    
    // Start the animation.
    requestAnimationFrame(animate);
});
