/* global Matter opentype */

// Encapsulate our code in an IIFE to keep the global namespace clean.
(() => {
  // Destructure Matter.js modules for convenience.
  const {
    Engine,
    Render,
    Runner,
    World,
    Bodies,
    Body,
    Composite,
    Vertices,
    Events,
    Svg,
  } = Matter;

  // ── SET UP THE PHYSICS ENGINE ──────────────────────────────
  const engine = Engine.create();
  const world  = engine.world;
  // Set gravity to Earth’s 9.8 m/s² converted to pixels (1 m = 50 px).
  const meterToPixel = 50;
  engine.world.gravity.y = 9.8 * meterToPixel;

  // ── CREATE THE RENDERER ───────────────────────────────────────
  let canvasWidth  = window.innerWidth;
  let canvasHeight = window.innerHeight;
  const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      width: canvasWidth,
      height: canvasHeight,
      background: '#000',
      wireframes: false,
      pixelRatio: window.devicePixelRatio
    }
  });
  Render.run(render);

  const runner = Runner.create();
  Runner.run(runner, engine);

  // ── CREATE STATIC BOUNDARIES ────────────────────────────────
  const thickness = 100;
  const ground    = Bodies.rectangle(canvasWidth / 2, canvasHeight + thickness / 2, canvasWidth, thickness, { isStatic: true });
  const ceiling   = Bodies.rectangle(canvasWidth / 2, -thickness / 2, canvasWidth, thickness, { isStatic: true });
  const leftWall  = Bodies.rectangle(-thickness / 2, canvasHeight / 2, thickness, canvasHeight, { isStatic: true });
  const rightWall = Bodies.rectangle(canvasWidth + thickness / 2, canvasHeight / 2, thickness, canvasHeight, { isStatic: true });
  World.add(world, [ground, ceiling, leftWall, rightWall]);

  // Update boundaries when the window is resized.
  const updateBoundaries = () => {
    canvasWidth  = window.innerWidth;
    canvasHeight = window.innerHeight;
    render.options.width  = canvasWidth;
    render.options.height = canvasHeight;
    render.canvas.width   = canvasWidth;
    render.canvas.height  = canvasHeight;

    Body.setPosition(ground,  { x: canvasWidth / 2, y: canvasHeight + thickness / 2 });
    Body.setPosition(ceiling, { x: canvasWidth / 2, y: -thickness / 2 });
    Body.setPosition(leftWall, { x: -thickness / 2, y: canvasHeight / 2 });
    Body.setPosition(rightWall, { x: canvasWidth + thickness / 2, y: canvasHeight / 2 });

    Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: canvasWidth, y: canvasHeight }
    });
  };
  window.addEventListener('resize', updateBoundaries);

  // ── LOAD A FONT WITH OpenType.js ─────────────────────────────
  let font;
  opentype.load('https://raw.githubusercontent.com/opentypejs/opentype.js/master/test/fonts/Roboto-Black.ttf', (err, loadedFont) => {
    if (err) {
      console.error('Font could not be loaded:', err);
    } else {
      font = loadedFont;
      // Start spawning letters every second once the font is ready.
      setInterval(spawnLetter, 1000);
    }
  });

  // ── SPAWN FALLING LETTERS ─────────────────────────────────────
  const spawnLetter = () => {
    if (!font) return;

    // Choose a random letter from A–Z.
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letter = letters.charAt(Math.floor(Math.random() * letters.length));
    // Random font size between 30 and 80 pixels.
    const fontSize = Math.random() * (80 - 30) + 30;

    // Get the SVG path for the letter.
    const path = font.getPath(letter, 0, 0, fontSize);
    const svgPathData = path.toPathData(2);

    // Create a temporary SVG <path> element for conversion.
    const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tempPath.setAttribute("d", svgPathData);

    // Convert the SVG path into vertices (with a sampling precision of 5).
    const vertices = Svg.pathToVertices(tempPath, 5);
    if (!vertices || vertices.length === 0) return;

    // Re-center the vertices so that (0,0) corresponds to the shape’s centroid.
    const centroid = Vertices.centre(vertices);
    const translatedVertices = vertices.map(v => ({ x: v.x - centroid.x, y: v.y - centroid.y }));

    // Spawn the letter at a random horizontal position just above the screen.
    const x = Math.random() * canvasWidth;
    const y = -50;

    // Create the physics body from the letter’s vertices.
    const letterBody = Bodies.fromVertices(x, y, translatedVertices, {
      restitution: 0.1,
      friction: 0.1,
      frictionAir: 0.01,
      density: 0.001,
      render: { visible: false } // We draw the letter shape manually.
    }, true);

    if (letterBody) {
      // Store extra data for custom drawing.
      letterBody.letter     = letter;
      letterBody.letterPath = svgPathData;
      letterBody.centroid   = centroid;
      World.add(world, letterBody);
    }
  };

  // ── CUSTOM RENDERING OF LETTER SHAPES ─────────────────────────
  // Instead of using Matter’s default rendering, we use the afterRender event
  // to draw the actual letter shapes (using their SVG paths) with the Canvas 2D API.
  Events.on(render, 'afterRender', () => {
    const context = render.context;
    const bodies  = Composite.allBodies(world);

    context.save();
    context.fillStyle = "#fff";

    bodies.forEach(body => {
      if (body.letter && body.letterPath && body.centroid) {
        context.save();
        // Move into the body’s coordinate system.
        context.translate(body.position.x, body.position.y);
        context.rotate(body.angle);
        // Shift so that the drawing’s (0,0) is at the letter’s centroid.
        context.translate(-body.centroid.x, -body.centroid.y);
        // Create a Path2D from the stored SVG path and fill it.
        const path2d = new Path2D(body.letterPath);
        context.fill(path2d);
        context.restore();
      }
    });

    context.restore();
  });
})();
