// "use client";

// import { useEffect, useRef, useState } from 'react';
// import * as THREE from 'three';

// interface VantaBackgroundProps {
//   className?: string;
// }

// export function VantaBackground({ className }: VantaBackgroundProps) {
//   const vantaRef = useRef<HTMLDivElement>(null);
//   const [vantaEffect, setVantaEffect] = useState<any>(null);

//   useEffect(() => {
//     let effect: any = null;
    
//     const loadVanta = async () => {
//       try {
//         const TOPOLOGY = (await import('vanta/dist/vanta.topology.min')).default;
//         if (!vantaEffect && vantaRef.current) {
//           effect = TOPOLOGY({
//             el: vantaRef.current,
//             THREE,
//             mouseControls: true,
//             touchControls: true,
//             gyroControls: false,
//             minHeight: 200.00,
//             minWidth: 200.00,
//             scale: 1.00,
//             scaleMobile: 1.00,
//             color: 0x3066BE,
//             backgroundColor: 0x0B0C10,
//             points: 12.00,
//             maxDistance: 25.00,
//             spacing: 17.00,
//             showDots: true
//           });
//           setVantaEffect(effect);
//         }
//       } catch (error) {
//         console.error('Failed to initialize Vanta effect:', error);
//       }
//     };

//     // Wait for the DOM to be ready
//     if (typeof window !== 'undefined') {
//       loadVanta();
//     }

//     return () => {
//       if (effect) {
//         effect.destroy();
//       }
//     };
//   }, []);

//   return (
//     <div 
//       ref={vantaRef}
//       className={`fixed inset-0 -z-10 ${className || ''}`}
//       aria-hidden="true"
//     />
//   );
// }