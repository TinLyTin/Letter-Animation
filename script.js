// Falling Letters Physics Simulation using p5.js and Matter.js
// (Works in the p5.js Web Editor if you follow the instructions above)

// Matter.js module aliases
const Engine = Matter.Engine,
      World  = Matter.World,
      Bodies = Matter.Bodies,
      Body   = Matter.Body;

// Global variables
let engine, world;
let letters = [];        // Array to store falling letter objects
let myFont;              // Font to be used for the letters (uploaded to the editor)
let spawnInterval = 1000; // Spawn a new letter every 1000 milliseconds
let lastSpawnTime = 0;

function preload() {
  // Load the font you have uploaded.
  // Make sure the filename matches the file you uploaded.
  myFont = loadFont("SourceSansPro-Regular.otf");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // Create the Matter.js engine and world
  engine = Engine.create();
  world = engine.world;
  
  /* Set gravity:
     Assuming 100 pixels ~ 1 meter, Earth's gravity (9.8 m/s²)
     is scaled to 9.8 * 100 = 980 pixels/s².
  */
  world.gravity.y = 9.8;
  world.gravity.scale = 100;
  
  createBoundaries();
}

function createBoundaries() {
  // Remove existing static bodies (while preserving dynamic ones)
  World.clear(world, false);
  
  // Create ground (positioned slightly below the canvas)
  let ground = Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true });
  // Create left and right walls (placed offscreen to bounce letters back)
  let leftWall = Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true });
  let rightWall = Bodies.rectangle(width + 50, height / 2, 100, height, { isStatic: true });
  
  World.add(world, [ground, leftWall, rightWall]);
  
  // Re-add any existing letter bodies (dynamic bodies)
  for (let letter of letters) {
    World.add(world, letter.body);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  createBoundaries();
}

function draw() {
  background(20); // Dark background
  
  // Update the Matter.js engine with a fixed time step
  Engine.update(engine, 1000 / 60);
  
  // If the font hasn't loaded yet, display a loading message
  if (!myFont) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Loading font...", width / 2, height / 2);
    return;
  }
  
  // Spawn a new letter at intervals
  if (millis() - lastSpawnTime > spawnInterval) {
    spawnLetter();
    lastSpawnTime = millis();
  }
  
  // Draw each letter
  fill(255);
  noStroke();
  for (let letter of letters) {
    drawLetter(letter);
  }
}

function spawnLetter() {
  // Choose a random letter (upper- or lower-case)
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let char = possible.charAt(floor(random(possible.length)));
  // Choose a random size for the letter
  let letterSize = random(30, 80);
  
  // Get the outline of the letter as an array of points
  let pts = myFont.textToPoints(char, 0, 0, letterSize, {
    sampleFactor: 0.2,
    simplifyThreshold: 0
  });
  
  // Ensure there are enough points to form a polygon
  if (pts.length < 3) return;
  
  // Convert the points into an array of vertices
  let vertices = pts.map(pt => ({ x: pt.x, y: pt.y }));
  // Close the polygon if necessary by checking the first and last points
  let first = vertices[0],
      last = vertices[vertices.length - 1];
  if (dist(first.x, first.y, last.x, last.y) > 1) {
    vertices.push({ x: first.x, y: first.y });
  }
  
  // Set a random starting x-position (with margins) and a y-position above the canvas
  let xPos = random(50, width - 50);
  let yPos = -100;
  
  // Create a Matter.js body from the vertices
  // The final parameter "true" enables concave decomposition if needed.
  let letterBody = Bodies.fromVertices(xPos, yPos, vertices, {
    density: 0.001,   // Density similar to water
    friction: 0.1,
    restitution: 0.1,
  }, true);
  
  if (!letterBody) return; // Skip if body creation fails
  
  // Give the body a small random spin
  Body.setAngularVelocity(letterBody, random(-0.05, 0.05));
  
  // Store the letter data for later drawing and physics simulation
  letters.push({
    char: char,
    body: letterBody,
    originalVertices: vertices,
    size: letterSize
  });
  
  // Add the new letter body to the physics world
  World.add(world, letterBody);
}

function drawLetter(letter) {
  let body = letter.body;
  push();
  // Translate and rotate according to the physics simulation
  translate(body.position.x, body.position.y);
  rotate(body.angle);
  noStroke();
  fill(255);
  
  // If the body is compound (from concave decomposition),
  // use its parts (skipping the first element if necessary)
  let parts = (body.parts.length === 1) ? [body] : body.parts.slice(1);
  for (let part of parts) {
    beginShape();
    for (let v of part.vertices) {
      // Since we already translated, subtract the body's position
      vertex(v.x - body.position.x, v.y - body.position.y);
    }
    endShape(CLOSE);
  }
  pop();
}
