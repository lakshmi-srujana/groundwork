import React from "react";

export const TerrainBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <svg
        className="w-full h-full opacity-[0.08] stroke-[#F5F0E8]"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        fill="none"
        strokeWidth="1.2"
      >
        <pattern
          id="topography-pattern"
          width="800"
          height="600"
          patternUnits="userSpaceOnUse"
        >
          <path d="M 0,100 Q 200,40 400,120 T 800,80" />
          <path d="M 0,180 Q 250,110 500,200 T 800,160" />
          <path d="M 0,260 Q 150,220 380,300 T 800,240" />
          <path d="M 0,350 Q 300,280 600,380 T 800,320" />
          <path d="M 0,440 Q 200,400 450,480 T 800,420" />
          <path d="M 0,520 Q 350,460 650,560 T 800,500" />
          
          <path d="M 100,0 Q 160,200 80,400 T 120,600" />
          <path d="M 280,0 Q 340,250 260,450 T 300,600" />
          <path d="M 480,0 Q 420,180 520,380 T 460,600" />
          <path d="M 680,0 Q 740,220 640,420 T 700,600" />

          {/* Concentric Terrain Contours */}
          <path d="M 250,250 C 350,180 450,220 400,350 C 350,450 200,380 250,250 Z" />
          <path d="M 270,270 C 330,220 410,240 380,330 C 340,400 230,350 270,270 Z" />
          <path d="M 290,290 C 320,250 370,260 350,310 C 330,350 260,320 290,290 Z" />

          <path d="M 550,100 C 650,50 720,120 680,220 C 620,280 500,200 550,100 Z" />
          <path d="M 570,120 C 630,80 680,130 650,200 C 600,240 520,180 570,120 Z" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#topography-pattern)" />
      </svg>
    </div>
  );
};

export default TerrainBackground;
