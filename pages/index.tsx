import { useEffect, useRef } from 'react';
import Matter from 'matter-js';

export default function Home() {
  const engineRef = useRef<Matter.Engine | null>(null);
  const worldRef = useRef<Matter.World | null>(null);
  const circleRef = useRef<Matter.Body | null>(null);
  const bulletsRef = useRef<Matter.Body[]>([]);

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
      if (event.code === 'Space') {
        const bullet = Matter.Bodies.circle(circle.position.x, circle.position.y, 10, {
          render: {
            fillStyle: '#f00',
          },
        });
        const speed = 10;
        const dx = keys['ArrowRight'] ? speed : keys['ArrowLeft'] ? -speed : 0;
        const dy = keys['ArrowDown'] ? speed : keys['ArrowUp'] ? -speed : 0;
        Matter.Body.setVelocity(bullet, { x: dx, y: dy });
        bulletsRef.current.push(bullet);
        Matter.World.add(world, bullet);
      }
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

      // Remove bullets that are off-screen
      bulletsRef.current.forEach((bullet) => {
        if (bullet.position.y < 0 || bullet.position.y > 600 || bullet.position.x < 0 || bullet.position.x > 800) {
          Matter.Composite.remove(world, bullet);
        }
      });
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
