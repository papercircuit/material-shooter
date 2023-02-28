import { useEffect, useRef } from 'react';
import Matter from 'matter-js';

export default function Home() {
  const engineRef = useRef<Matter.Engine | null>(null);
  const worldRef = useRef<Matter.World | null>(null);
  const circleRef = useRef<Matter.Body | null>(null);

  useEffect(() => {
    // Initialize Matter.js
    const engine = Matter.Engine.create();
    const world = engine.world;
    engineRef.current = engine;
    worldRef.current = world;

    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.body.appendChild(canvas);

    const render = Matter.Render.create({
      canvas,
      engine: engineRef.current!,
      options: {
        width: canvas.width,
        height: canvas.height,
        wireframes: false,
      },
    });

    Matter.Render.run(render);
    Matter.Engine.run(engine);

    // Create the circle
    const circle = Matter.Bodies.circle(400, 300, 50, {
      isStatic: true,
      render: {
        fillStyle: '#fff',
      },
    });
    circleRef.current = circle;
    Matter.World.add(world, circle);

    // Move the circle with arrow keys
    const keys = {};
    window.addEventListener('keydown', (event) => {
      keys[event.code] = true;
    });
    window.addEventListener('keyup', (event) => {
      keys[event.code] = false;
    });
    Matter.Events.on(engine, 'beforeUpdate', () => {
      const speed = 5;
      if (keys['ArrowLeft']) {
        Matter.Body.translate(circle, { x: -speed, y: 0 });
      }
      if (keys['ArrowRight']) {
        Matter.Body.translate(circle, { x: speed, y: 0 });
      }
      if (keys['ArrowUp']) {
        Matter.Body.translate(circle, { x: 0, y: -speed });
      }
      if (keys['ArrowDown']) {
        Matter.Body.translate(circle, { x: 0, y: speed });
      }
    });

    // Cleanup
    return () => {
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      Matter.World.clear(world);
      canvas.remove();
    };
  }, []);

  return null;
}
