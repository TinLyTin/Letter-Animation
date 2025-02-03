const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const letters = [];

// Setup canvas
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Letter {
    constructor() {
        this.char = String.fromCharCode(65 + Math.random() * 26);
        this.size = Math.random() * 30 + 20;
        this.x = Math.random() * canvas.width;
        this.y = -this.size;
        this.vy = 0;
        this.color = `hsl(${Math.random() * 360}, 70%, 70%)`;
    }

    update() {
        this.vy += 0.5; // Simplified gravity
        this.y += this.vy;
        
        // Bounce off bottom
        if (this.y > canvas.height - this.size) {
            this.y = canvas.height - this.size;
            this.vy *= -0.8;
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

    requestAnimationFrame(animate);
}

// Initialization
resize();
window.addEventListener('resize', resize);

// Create letters
setInterval(() => {
    letters.push(new Letter());
    if (letters.length > 50) letters.shift();
}, 500);

// Start animation
animate();
