import React, { useState, useRef } from 'react';
import { getSegmentPath, getTextPath } from '../utils/wheelCalculations';

export interface WheelProps {
  names: string[];
  onSelectName: (name: string) => void;
  size?: number;
  colors?: string[];
}

export const Wheel: React.FC<WheelProps> = ({ 
  names, 
  onSelectName,
  size = 600,
  colors = ['#FF0000', '#0066FF', '#00AA00', '#FFD700']
}) => {
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

  const pointerSize = size * 0.037; // Scale pointer with wheel size

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-0 h-0"
        style={{
          borderLeft: `${pointerSize}px solid transparent`,
          borderRight: `${pointerSize}px solid transparent`,
          borderTop: `${pointerSize * 1.7}px solid black`
        }}
      />
      <svg
        ref={wheelRef}
        viewBox="0 0 400 400"
        className="w-full h-full"
        style={{ transform: `rotate(${rotation}deg)`, transition: isSpinning ? 'none' : 'transform 0.3s ease-out' }}
      >
        {names.map((name, index) => {
          const angle = (360 / names.length);
          const midAngle = index * angle + angle / 2;
          return (
            <g key={index}>
              <path
                d={getSegmentPath(index, names.length)}
                fill={colors[index % colors.length]}
                stroke="#fff"
                strokeWidth="1"
              />
              <path
                id={`text-path-${index}`}
                d={getTextPath(index, names.length)}
                fill="none"
                className="hidden"
              />
              <text
                fill="#fff"
                fontSize="16"
                fontWeight="bold"
                className="select-none"
              >
                <textPath
                  href={`#text-path-${index}`}
                  startOffset="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {name}
                </textPath>
              </text>
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