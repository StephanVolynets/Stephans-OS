"use client";

import { useCallback, useEffect } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";

export function Background() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const particleCount = isMobile ? 300 : 800;

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fpsLimit: isMobile ? 30 : 60,
        particles: {
          number: {
            value: particleCount,
            density: {
              enable: true,
              area: 800,
            },
          },
          color: {
            value: ["#ffffff"],
          },
          shape: {
            type: "circle",
          },
          opacity: {
            value: 0.8,
          },
          size: {
            value: 2,
            random: {
              enable: true,
              minimumValue: 0.5,
            },
          },
          move: {
            enable: true,
            speed: 0.2,
            direction: "none",
            random: false,
            straight: false,
            outModes: {
              default: "out",
            },
            warp: false,
            trail: {
              enable: false,
            },
          },
        },
        interactivity: {
          detectsOn: "canvas",
          events: {
            onClick: {
              enable: true,
              mode: "push",
            },
            resize: true,
          },
          modes: {
            push: {
              quantity: 4,
            },
          },
        },
        detectRetina: true,
        background: {
          color: "#0B0C10",
        },
      }}
      className="fixed inset-0 -z-10"
    />
  );
}
