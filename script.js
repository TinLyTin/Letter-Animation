// Destructure Matter.js modules for convenience
const { Engine, Render, Runner, World, Bodies, Composite, Events } = Matter;

// Create engine and adjust gravity.
// (For this simulation we assume that a gravity value of 1 roughly corresponds to Earth’s 9.8 m/s²
// when you account for our chosen scale.)
const engine = Engine.create();
engine.world.gravity.y = 1; // Adjust this if you wish to scale the simulation differently.

// Get initial window dimensions
let width = window.innerWidth;
let height = window.innerHeight;

// Create the renderer – we use Matter’s built-in renderer.
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    width: width,
    height: height,
    background: '#000',
    wireframes: false, // Render solid shapes (not wireframes)
  }
});

Render.run(render);

// Create a runner that continuously updates the simulation.
const runner = Runner.create();
Runner.run(runner, engine);

// -------------
// BOUNDARIES
// -------------
// Create static boundaries (ground, ceiling, and side walls) so that letters interact with screen edges.
function createBoundaries() {
  // If boundaries already exist, remove them before adding new ones.
  if (window.boundaries) {
    World.remove(engine.world, window.boundaries);
  }
  const thickness = 50; // Thickness for ground, ceiling, and walls.
  const ground   = Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, {
    isStatic: true,
    render: { fillStyle: '#555' }
  });
  const ceiling  = Bodies.rectangle(width / 2, -thickness / 2, width, thickness, {
    isStatic: true,
    render: { fillStyle: '#555' }
  });
  const leftWall = Bodies.rectangle(-thickness / 2, height / 2, thickness, height, {
    isStatic: true,
    render: { fillStyle: '#555' }
  });
  const rightWall = Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, {
    isStatic: true,
    render: { fillStyle: '#555' }
  });
  window.boundaries = [ground, ceiling, leftWall, rightWall];
  World.add(engine.world, window.boundaries);
}
createBoundaries();

// -------------
// LETTER SHAPE APPROXIMATION
// -------------
// To simulate collision detection based on a letter’s shape, we approximate a few letters
// with custom polygons. For letters we haven’t defined a custom shape, we fall back to a rectangle.
function getLetterVertices(letter, fontSize) {
  const w = fontSize * 0.6; // Approximate width based on font size
  const h = fontSize;       // Height equals font size
  let verts = [
    { x: -w / 2, y: -h / 2 },
    { x:  w / 2, y: -h / 2 },
    { x:  w / 2, y:  h / 2 },
    { x: -w / 2, y:  h / 2 }
  ];
  
  // Custom shape for letter A: a rough “A” with a pointed top and crossbar.
  if (letter.toUpperCase() === 'A') {
    verts = [
      { x: -w / 2, y: h / 2 },
      { x: 0,     y: -h / 2 },
      { x: w / 2, y: h / 2 },
      { x: w * 0.25, y: 0 },
      { x: -w * 0.25, y: 0 }
    ];
  }
  // Custom shape for letter O: approximate with an octagon.
  else if (letter.toUpperCase() === 'O') {
    const r = Math.min(w, h) / 2;
    verts = [];
    const sides = 8;
    for (let i = 0; i < sides; i++) {
      const angle = (2 * Math.PI / sides) * i;
      verts.push({ x: r * Math.cos(angle), y: r * Math.sin(angle) });
    }
  }
  // Custom shape for letter M: a rough “M” with two outer pillars and a central V.
  else if (letter.toUpperCase() === 'M') {
    verts = [
      { x: -w / 2, y: h / 2 },
      { x: -w / 2, y: -h / 2 },
      { x: 0,      y: 0 },
      { x: w / 2,  y: -h / 2 },
      { x: w / 2,  y: h / 2 }
    ];
  }
  return verts;
}

// -------------
// SPAWN LETTERS
// -------------
// Create a new letter body that appears at the top with random size and letter type.
function spawnLetter() {
  // Choose a random letter from A to Z.
  const letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  // Randomize the font size (between 30 and 80 pixels).
  const fontSize = 30 + Math.random() * 50;
  // Get a set of vertices approximating the letter’s shape.
  const verts = getLetterVertices(letter, fontSize);
  // Choose a random x coordinate (with some padding) and position the letter above the view.
  const x = 50 + Math.random() * (width - 100);
  const y = -fontSize;
  
  // Create the physics body from the vertices.
  // Note: Matter.Bodies.fromVertices expects an array of vertex sets.
  const letterBody = Bodies.fromVertices(x, y, [verts], {
    density: 0.001,       // Density similar to water (adjust if needed)
    friction: 0.1,
    restitution: 0.3,
    render: {
      fillStyle: '#fff',
      strokeStyle: '#fff',
      lineWidth: 1
    }
  }, true);
  
  // Save the letter and font size so we can draw the actual character over the body.
  letterBody.letter = letter;
  letterBody.fontSize = fontSize;
  
  World.add(engine.world, letterBody);
}

// Spawn a new letter every 800 milliseconds.
setInterval(spawnLetter, 800);

// -------------
// CUSTOM RENDERING: DRAW LETTERS
// -------------
// After Matter.js renders all bodies, we overlay the actual text character so that it
// visually matches the physics body shape.
Events.on(render, 'afterRender', function() {
  const context = render.context;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = '#fff';
  
  Composite.allBodies(engine.world).forEach(body => {
    if (body.letter) {
      context.save();
      context.translate(body.position.x, body.position.y);
      context.rotate(body.angle);
      context.font = body.fontSize + 'px sans-serif';
      context.fillText(body.letter, 0, 0);
      context.restore();
    }
  });
});

// -------------
// HANDLE WINDOW RESIZE
// -------------
// Dynamically update the renderer and boundaries when the window size changes.
window.addEventListener('resize', function() {
  width = window.innerWidth;
  height = window.innerHeight;
  
  // Update the render canvas dimensions.
  render.canvas.width = width;
  render.canvas.height = height;
  render.options.width = width;
  render.options.height = height;
  
  // Re-create the boundaries.
  createBoundaries();
});
