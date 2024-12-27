import React, { useState, useRef } from 'react';
import { getSegmentPath } from '../utils/wheelCalculations';

interface WheelProps {
  names: string[];
  onSelectName: (name: string) => void;
}

export const Wheel: React.FC<WheelProps> = ({ names, onSelectName }) => {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const wheelRef = useRef<SVGSVGElement>(null);
  const spinTimeoutRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const spinWheel = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    const spinDuration = 6000 + Math.random() * 2000;
    const totalSpins = 5 + Math.random() * 5;
    const finalRotation = rotation + (360 * totalSpins) + Math.random() * 360;
    
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      const easeOut = (t: number) => {
        const t1 = Math.pow(1 - t, 4);
        const t2 = Math.pow(1 - t, 2);
        return 1 - (0.7 * t1 + 0.3 * t2);
      };
      
      const currentRotation = rotation + (finalRotation - rotation) * easeOut(progress);
      
      setRotation(currentRotation);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        if (spinTimeoutRef.current) {
          clearTimeout(spinTimeoutRef.current);
        }
        spinTimeoutRef.current = window.setTimeout(() => {
          setIsSpinning(false);
          const selectedIndex = Math.floor(((360 - (currentRotation % 360)) / (360 / names.length)));
          onSelectName(names[selectedIndex]);
        }, 500);
      }
    };
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const colors = ['#FF0000', '#0066FF', '#00AA00', '#FFD700'];

  return (
    <div className="relative w-[600px] h-[600px]">
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-0 h-0 
        border-l-[22px] border-l-transparent
        border-r-[22px] border-r-transparent
        border-t-[37px] border-t-black"
      />
      <svg
        ref={wheelRef}
        viewBox="0 0 400 400"
        className="w-full h-full"
        style={{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? 'none' : 'transform 0.3s ease-out' }}
      >
        {names.map((name, index) => {
          const angle = 360 / names.length;
          const midAngle = index * angle + angle / 2;
          const radius = 140; // Distance from center for text
          const x = 200 + radius * Math.cos((midAngle - 90) * Math.PI / 180);
          const y = 200 + radius * Math.sin((midAngle - 90) * Math.PI / 180);
          
          return (
            <g key={index}>
              <path
                d={getSegmentPath(index, names.length)}
                fill={colors[index % colors.length]}
                stroke="#fff"
                strokeWidth="1"
              />
              <g transform={`translate(${x},${y}) rotate(${midAngle})`}>
                <text
                  x="0"
                  y="0"
                  fill="#fff"
                  fontSize="16"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform="rotate(-90)"
                  className="select-none"
                >
                  {name}
                </text>
              </g>
            </g>
          );
        })}
        <circle
          cx="200"
          cy="200"
          r="50"
          fill="white"
          className="cursor-pointer"
          onClick={spinWheel}
        />
      </svg>
    </div>
  );
};