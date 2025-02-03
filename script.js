// Declare variables that will hold Matter.js modules and simulation objects.
let Engine, World, Bodies, Composite; // We'll assign these in setup().
let engine, world;
let boundaries = [];   // To store static boundaries (ground, walls, etc.)
let letters = [];      // To store falling letter bodies.

function setup() {
  // Use a local alias to reference Matter.js from the global window object.
  const M = window.Matter;
  Engine    = M.Engine;
  World     = M.World;
  Bodies    = M.Bodies;
  Composite = M.Composite;
  
  // Create a p5.js canvas.
  createCanvas(windowWidth, windowHeight);
  
  // Create the physics engine and world.
  engine = Engine.create();
  world = engine.world;
  
  // Set gravity (with our chosen scale, 1 approximates Earth's gravity).
  world.gravity.y = 1;
  
  // Create static boundaries.
  createBoundaries();
  
  // Spawn a new letter every 800 milliseconds.
  setInterval(spawnLetter, 800);
}

function draw() {
  background(0);
  
  // Update the physics engine.
  Engine.update(engine);
  
  // Draw each falling letter.
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  
  for (let body of letters) {
    push();
    translate(body.position.x, body.position.y);
    rotate(body.angle);
    textSize(body.fontSize);
    text(body.letter, 0, 0);
    pop();
  }
}

// When the window is resized, update the canvas and boundaries.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // Remove old boundaries from the world.
  for (let b of boundaries) {
    World.remove(world, b);
  }
  boundaries = [];
  createBoundaries();
}

// Create static boundaries: ground, ceiling, left wall, and right wall.
function createBoundaries() {
  const thickness = 50;
  const ground   = Bodies.rectangle(width / 2, height + thickness / 2, width, thickness, { isStatic: true });
  const ceiling  = Bodies.rectangle(width / 2, -thickness / 2, width, thickness, { isStatic: true });
  const leftWall = Bodies.rectangle(-thickness / 2, height / 2, thickness, height, { isStatic: true });
  const rightWall= Bodies.rectangle(width + thickness / 2, height / 2, thickness, height, { isStatic: true });
  
  boundaries.push(ground, ceiling, leftWall, rightWall);
  World.add(world, boundaries);
}

// Spawn a new letter body with a custom shape.
function spawnLetter() {
  // Choose a random letter (A–Z).
  const letter = String.fromCharCode(65 + floor(random(26)));
  // Randomize font size between 30 and 80.
  const fontSize = 30 + random(50);
  // Get vertices approximating the letter’s shape.
  const verts = getLetterVertices(letter, fontSize);
  
  // Position: random horizontal position (with padding) and just above the view.
  const x = random(50, width - 50);
  const y = -fontSize;
  
  // Create the physics body from vertices.
  // The 'true' flag lets Matter.js handle convex decomposition if needed.
  const letterBody = Bodies.fromVertices(x, y, [verts], {
    density: 0.001,       // Density similar to water on our scale.
    friction: 0.1,
    restitution: 0.3
  }, true);
  
  // Store letter info for custom rendering.
  letterBody.letter = letter;
  letterBody.fontSize = fontSize;
  
  letters.push(letterBody);
  World.add(world, letterBody);
}

// Return an array of vertices approximating the shape of the letter.
// For letters without custom shapes, a simple rectangle is returned.
function getLetterVertices(letter, fontSize) {
  const w = fontSize * 0.6;
  const h = fontSize;
  
  // Default: simple rectangle.
  let verts = [
    { x: -w / 2, y: -h / 2 },
    { x:  w / 2, y: -h / 2 },
    { x:  w / 2, y:  h / 2 },
    { x: -w / 2, y:  h / 2 }
  ];
  
  // Custom shape for letter A: pointed top with a crossbar.
  if (letter.toUpperCase() === 'A') {
    verts = [
      { x: -w / 2, y: h / 2 },
      { x: 0,      y: -h / 2 },
      { x: w / 2,  y: h / 2 },
      { x: w * 0.25, y: 0 },
      { x: -w * 0.25, y: 0 }
    ];
  }
  // Custom shape for letter O: approximate with an octagon.
  else if (letter.toUpperCase() === 'O') {
    const r = min(w, h) / 2;
    verts = [];
    const sides = 8;
    for (let i = 0; i < sides; i++) {
      const angle = TWO_PI / sides * i;
      verts.push({ x: r * cos(angle), y: r * sin(angle) });
    }
  }
  // Custom shape for letter M: two pillars with a central V.
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
