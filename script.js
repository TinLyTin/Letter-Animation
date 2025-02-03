// -------------------------
// SETUP THE PHYSICS ENGINE
// -------------------------
const Engine   = Matter.Engine,
      Render   = Matter.Render,
      World    = Matter.World,
      Bodies   = Matter.Bodies,
      Composite= Matter.Composite,
      Events   = Matter.Events;

// Create engine and set gravity (1 unit roughly corresponds to Earth’s gravity in this scale)
const engine = Engine.create();
engine.world.gravity.y = 1;

// Get current window dimensions
let width = window.innerWidth,
    height = window.innerHeight;

// Create the renderer using Matter's built-in renderer
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: width,
    height: height,
    background: '#000',
    wireframes: false // Display solid shapes
  }
});

Render.run(render);
Engine.run(engine);

// -------------------------
// BOUNDARIES (Ground & Walls)
// -------------------------
function createBoundaries() {
  // Remove previous boundaries if they exist
  if (window.boundaries) {
    World.remove(engine.world, window.boundaries);
  }
  const thickness = 50;
  const ground   = Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, { isStatic: true, render: { fillStyle: '#555' } });
  const ceiling  = Bodies.rectangle(width / 2, -thickness / 2, width, thickness, { isStatic: true, render: { fillStyle: '#555' } });
  const leftWall = Bodies.rectangle(-thickness / 2, height / 2, thickness, height, { isStatic: true, render: { fillStyle: '#555' } });
  const rightWall= Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, { isStatic: true, render: { fillStyle: '#555' } });
  
  window.boundaries = [ground, ceiling, leftWall, rightWall];
  World.add(engine.world, window.boundaries);
}
createBoundaries();

// -------------------------
// LETTER-SHAPE APPROXIMATION
// -------------------------
// To approximate collision detection based on actual letter shapes, we use custom polygon shapes.
// (For production use, consider using a library like opentype.js to extract real glyph outlines.)
function getLetterVertices(letter, fontSize) {
  const w = fontSize * 0.6;
  const h = fontSize;
  let verts = [
    { x: -w / 2, y: -h / 2 },
    { x:  w / 2, y: -h / 2 },
    { x:  w / 2, y:  h / 2 },
    { x: -w / 2, y:  h / 2 }
  ];
  
  // Custom shapes for a few letters
  if (letter.toUpperCase() === 'A') {
    // Rough "A" shape: pointed top with a crossbar notch.
    verts = [
      { x: -w / 2, y: h / 2 },
      { x: -w * 0.1, y: -h / 2 },
      { x:  w * 0.1, y: -h / 2 },
      { x:  w / 2, y: h / 2 },
      { x:  0, y: h * 0.1 }
    ];
  } else if (letter.toUpperCase() === 'O') {
    // Approximate an "O" with an octagon.
    let r = Math.min(w, h) / 2;
    verts = [];
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      verts.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
    }
  } else if (letter.toUpperCase() === 'M') {
    // Rough "M": two outer sides with a central V.
    verts = [
      { x: -w / 2, y: h / 2 },
      { x: -w / 2, y: -h / 2 },
      { x:  0, y: 0 },
      { x:  w / 2, y: -h / 2 },
      { x:  w / 2, y: h / 2 }
    ];
  }
  
  return verts;
}

// -------------------------
// SPAWN LETTERS
// -------------------------
function spawnLetter() {
  // Choose a random letter (A–Z)
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  // Random font size between 30 and 80 pixels
  const fontSize = 30 + Math.random() * 50;
  // Get vertices approximating the letter’s shape
  const verts = getLetterVertices(letter, fontSize);
  // Random x position (with padding) and y above view
  const x = 50 + Math.random() * (width - 100);
  const y = -fontSize;
  // Create a physics body using the vertices
  const letterBody = Bodies.fromVertices(x, y, [verts], {
    density: 0.001,      // Similar to water density on this scale
    friction: 0.1,
    restitution: 0.3,
    render: { fillStyle: '#fff', strokeStyle: '#fff', lineWidth: 1 }
  }, true);
  
  // Store letter info for custom rendering
  letterBody.labelChar = letter;
  letterBody.fontSize = fontSize;
  
  World.add(engine.world, letterBody);
}

// Spawn a new letter every 800ms
setInterval(spawnLetter, 800);

// -------------------------
// CUSTOM RENDERING: DRAW LETTERS
// -------------------------
// Overlay the actual letter character on top of each physics body.
Events.on(render, 'afterRender', function() {
  const context = render.context;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#fff';
  
  Composite.allBodies(engine.world).forEach(body => {
    if (body.labelChar) {
      context.save();
      context.translate(body.position.x, body.position.y);
      context.rotate(body.angle);
      context.font = body.fontSize + 'px sans-serif';
      context.fillText(body.labelChar, 0, 0);
      context.restore();
    }
  });
});

// -------------------------
// HANDLE WINDOW RESIZE
// -------------------------
window.addEventListener('resize', () => {
  width = window.innerWidth;
  height = window.innerHeight;
  render.canvas.width = width;
  render.canvas.height = height;
  render.options.width = width;
  render.options.height = height;
  createBoundaries();
});
