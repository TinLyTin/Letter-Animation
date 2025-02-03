const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const letters = [];

// Physics parameters
const gravity = 0.8;          // Vertical acceleration
const restitution = 0.7;      // Bounce energy retention
const airResistance = 0.99;   // Air friction
const wallBounce = 0.8;       // Side wall bounce factor

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Letter {
    constructor() {
        this.char = String.fromCharCode(65 + Math.random() * 26);
        this.size = Math.random() * 30 + 20;
        this.x = Math.random() * (canvas.width - this.size) + this.size/2;
        this.y = -this.size;
        this.vx = (Math.random() - 0.5) * 4;  // Initial horizontal velocity
        this.vy = 0;
        this.color = `hsl(${Math.random() * 360}, 70%, 70%)`;
    }

    update() {
        // Apply physics
        this.vy += gravity;
        this.vx *= airResistance;
        this.vy *= airResistance;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Wall collisions
        const halfSize = this.size/2;
        
        // Left wall
        if (this.x < halfSize) {
            this.x = halfSize;
            this.vx *= -wallBounce;
        }
        
        // Right wall
        if (this.x > canvas.width - halfSize) {
            this.x = canvas.width - halfSize;
            this.vx *= -wallBounce;
        }

        // Floor collision
        if (this.y > canvas.height - halfSize) {
            this.y = canvas.height - halfSize;
            this.vy *= -restitution;
            this.vx *= 0.9; // Floor friction
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

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    letters.forEach(letter => {
        letter.update();
        letter.draw();
    });

    // Limit to 50 letters
    if (letters.length > 50) letters.shift();
    
    requestAnimationFrame(animate);
}

// Initialize
resize();
window.addEventListener('resize', resize);

// Add letters continuously
setInterval(() => letters.push(new Letter()), 300);

// Start animation
animate();
