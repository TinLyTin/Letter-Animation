const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const letters = [];

// Physics parameters
const gravity = 0.8;
const restitution = 0.7;
const airResistance = 0.99;
const wallBounce = 0.8;
const Chars = ['Li', 'Ting']; // Li Ting characters

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Letter {
    constructor() {
        // 20% chance for Chinese characters, 80% for English
        if (Math.random() < 0.2) {
            this.char = chineseChars[Math.floor(Math.random() * chineseChars.length)];
        } else {
            this.char = String.fromCharCode(65 + Math.random() * 26);
        }
        
        // Size properties
        this.startSize = 30; // Initial small size
        this.size = this.startSize;
        this.maxSize = Math.random() * 50 + 30; // Random maximum size
        this.growthRate = 0.5; // Size increase per frame

        this.x = Math.random() * (canvas.width - this.maxSize) + this.maxSize/2;
        this.y = -this.maxSize;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = 0;
        this.color = `hsl(${Math.random() * 360}, 70%, 70%)`;
    }

    update() {
        // Grow until reaching max size
        if (this.size < this.maxSize) {
            this.size = Math.min(this.size + this.growthRate, this.maxSize);
        }

        // Apply physics
        this.vy += gravity;
        this.vx *= airResistance;
        this.vy *= airResistance;

        this.x += this.vx;
        this.y += this.vy;

        const halfSize = this.size/2;
        
        if (this.x < halfSize) {
            this.x = halfSize;
            this.vx *= -wallBounce;
        }
        if (this.x > canvas.width - halfSize) {
            this.x = canvas.width - halfSize;
            this.vx *= -wallBounce;
        }

        if (this.y > canvas.height - halfSize) {
            this.y = canvas.height - halfSize;
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

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    letters.forEach(letter => {
        letter.update();
        letter.draw();
    });

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
