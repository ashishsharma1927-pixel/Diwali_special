import React from 'react';

interface PeacockRangoliProps {
  className?: string;
}

export const PeacockRangoli: React.FC<PeacockRangoliProps> = ({ className = '' }) => {
  return (
    <div className={`peacock-rangoli-container ${className}`}>
      <svg
        viewBox="0 0 600 600"
        className="peacock-rangoli-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radial Gradients for rich powdered rangoli hues */}
          <radialGradient id="centerMagentaGlow" cx="45%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#d946ef" />
            <stop offset="55%" stopColor="#c026d3" />
            <stop offset="90%" stopColor="#86198f" />
            <stop offset="100%" stopColor="#581c87" />
          </radialGradient>

          <radialGradient id="peacockBlueGrad" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="35%" stopColor="#0284c7" />
            <stop offset="85%" stopColor="#075985" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </radialGradient>

          <linearGradient id="goldFeatherWing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#facc15" />
            <stop offset="80%" stopColor="#d97706" />
            <stop offset="100%" stopColor="#92400e" />
          </linearGradient>

          <linearGradient id="emeraldTailGrad" x1="0%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="45%" stopColor="#059669" />
            <stop offset="85%" stopColor="#065f46" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>

          <linearGradient id="crestArchGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" />
            <stop offset="35%" stopColor="#f59e0b" />
            <stop offset="70%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          {/* Diya Oil & Flame Glow Filters */}
          <filter id="diyaGlowFilter" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="softRangoliShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="12" stdDeviation="15" floodColor="#000000" floodOpacity="0.65" />
          </filter>
        </defs>

        {/* Outer Shadow Filter Group */}
        <g filter="url(#softRangoliShadow)">

          {/* 1. OUTER SCALLOPED RANGOLI PETALS BORDER (Right Arc & Floral Garland) */}
          <g className="rangoli-outer-garland">
            {/* Multi-layered scalloped cyan & royal blue outer rim */}
            <path
              d="M 330 90 A 210 210 0 0 1 500 370 A 210 210 0 0 1 430 460"
              fill="none"
              stroke="#0284c7"
              strokeWidth="24"
              strokeLinecap="round"
              strokeDasharray="4 2"
            />
            <path
              d="M 345 105 A 190 190 0 0 1 480 365"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="16"
              strokeLinecap="round"
            />

            {/* Scalloped textured dot ripples on right wing border */}
            {[
              { cx: 375, cy: 115, r: 8, col: '#facc15' },
              { cx: 410, cy: 140, r: 9, col: '#34d399' },
              { cx: 445, cy: 175, r: 9, col: '#facc15' },
              { cx: 472, cy: 220, r: 9, col: '#34d399' },
              { cx: 485, cy: 270, r: 10, col: '#facc15' },
              { cx: 480, cy: 325, r: 10, col: '#34d399' },
              { cx: 460, cy: 375, r: 9, col: '#facc15' },
              { cx: 425, cy: 420, r: 9, col: '#34d399' },
            ].map((dot, idx) => (
              <circle key={idx} cx={dot.cx} cy={dot.cy} r={dot.r} fill={dot.col} stroke="#ffffff" strokeWidth="2.5" />
            ))}
          </g>

          {/* 2. LEFT FLORAL BORDER (Flowers with sculpted petals matching photo) */}
          <g className="rangoli-flower-border">
            {/* Flower 1: Pink Lotus at Top Left */}
            <g transform="translate(190, 85) scale(0.75)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
                <ellipse key={ang} cx="0" cy="-22" rx="10" ry="16" fill="#ec4899" transform={`rotate(${ang})`} stroke="#be185d" strokeWidth="1.5" />
              ))}
              <circle cx="0" cy="0" r="14" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
            </g>

            {/* Flower 2: Orange Marigold */}
            <g transform="translate(140, 125) scale(0.75)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
                <ellipse key={ang} cx="0" cy="-22" rx="10" ry="16" fill="#f97316" transform={`rotate(${ang})`} stroke="#c2410c" strokeWidth="1.5" />
              ))}
              <circle cx="0" cy="0" r="13" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
            </g>

            {/* Flower 3: Blue Dahlia */}
            <g transform="translate(100, 185) scale(0.78)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
                <ellipse key={ang} cx="0" cy="-22" rx="10" ry="16" fill="#0ea5e9" transform={`rotate(${ang})`} stroke="#0369a1" strokeWidth="1.5" />
              ))}
              <circle cx="0" cy="0" r="13" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
            </g>

            {/* Flower 4: Crimson Red Hibiscus */}
            <g transform="translate(85, 260) scale(0.8)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
                <ellipse key={ang} cx="0" cy="-22" rx="10" ry="16" fill="#ef4444" transform={`rotate(${ang})`} stroke="#991b1b" strokeWidth="1.5" />
              ))}
              <circle cx="0" cy="0" r="14" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
            </g>

            {/* Flower 5: Vibrant Magenta Pink */}
            <g transform="translate(90, 340) scale(0.8)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
                <ellipse key={ang} cx="0" cy="-22" rx="10" ry="16" fill="#d946ef" transform={`rotate(${ang})`} stroke="#a21caf" strokeWidth="1.5" />
              ))}
              <circle cx="0" cy="0" r="14" fill="#f97316" stroke="#ea580c" strokeWidth="2" />
            </g>

            {/* Flower 6: Orange Marigold */}
            <g transform="translate(120, 415) scale(0.82)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
                <ellipse key={ang} cx="0" cy="-22" rx="10" ry="16" fill="#f97316" transform={`rotate(${ang})`} stroke="#c2410c" strokeWidth="1.5" />
              ))}
              <circle cx="0" cy="0" r="14" fill="#0284c7" stroke="#0369a1" strokeWidth="2" />
            </g>

            {/* Flower 7: Yellow Sunflower */}
            <g transform="translate(170, 480) scale(0.84)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
                <ellipse key={ang} cx="0" cy="-22" rx="10" ry="16" fill="#fde047" transform={`rotate(${ang})`} stroke="#ca8a04" strokeWidth="1.5" />
              ))}
              <circle cx="0" cy="0" r="15" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2" />
            </g>

            {/* Flower 8: Red Rose at Base */}
            <g transform="translate(240, 520) scale(0.8)">
              {[0, 45, 90, 135, 180, 225, 270, 315].map((ang) => (
                <ellipse key={ang} cx="0" cy="-22" rx="10" ry="16" fill="#dc2626" transform={`rotate(${ang})`} stroke="#991b1b" strokeWidth="1.5" />
              ))}
              <circle cx="0" cy="0" r="14" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
            </g>
          </g>

          {/* 3. CENTRAL MAGENTA RANGOLI BASE DISC */}
          <circle
            cx="290"
            cy="270"
            r="165"
            fill="url(#centerMagentaGlow)"
            stroke="#facc15"
            strokeWidth="5"
            strokeDasharray="14 6"
          />

          {/* Inner subtle decorative sand wave in magenta core */}
          <circle cx="290" cy="270" r="145" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />

          {/* 4. THE PROUD PEACOCK (MAYUR) ARTWORK */}
          <g className="peacock-body-group">

            {/* A. Arched Upper Crest / Wing Fan (Layered wavy saffron/white brushstrokes) */}
            <path
              d="M 270 200 C 270 120, 360 90, 420 140 C 460 170, 450 250, 360 270 Z"
              fill="url(#crestArchGrad)"
              stroke="#b45309"
              strokeWidth="2.5"
            />
            {/* Wavy white sand scallop details on the arched crest */}
            {[
              "M 290 190 Q 330 145 375 160",
              "M 305 180 Q 350 135 395 150",
              "M 320 170 Q 370 130 410 160",
              "M 335 175 Q 385 145 425 180",
              "M 345 190 Q 395 165 430 205",
              "M 350 210 Q 390 195 425 230",
              "M 340 230 Q 375 220 405 250",
            ].map((p, i) => (
              <path key={i} d={p} fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
            ))}

            {/* B. Flowing Green Peacock Tail Train curving downwards */}
            <path
              d="M 330 330 C 370 380, 410 460, 480 500 C 460 550, 350 560, 320 470 C 300 420, 290 360, 330 330 Z"
              fill="url(#emeraldTailGrad)"
              stroke="#047857"
              strokeWidth="3"
            />

            {/* Additional sweeping peacock tail feathers */}
            <path
              d="M 360 410 C 420 470, 440 540, 520 545 C 500 590, 400 590, 370 510 Z"
              fill="#059669"
              stroke="#065f46"
              strokeWidth="2.5"
            />

            {/* Peacock Tail "Eyes" (Chandrika / Mor-Pankh Eyes with concentric jewel rings) */}
            {[
              { cx: 340, cy: 370, sc: 0.9 },
              { cx: 380, cy: 415, sc: 1.0 },
              { cx: 330, cy: 435, sc: 0.9 },
              { cx: 420, cy: 460, sc: 1.1 },
              { cx: 375, cy: 480, sc: 1.0 },
              { cx: 440, cy: 520, sc: 1.1 },
              { cx: 485, cy: 535, sc: 1.0 },
              { cx: 350, cy: 520, sc: 0.85 },
            ].map((eye, i) => (
              <g key={i} transform={`translate(${eye.cx}, ${eye.cy}) scale(${eye.sc})`}>
                {/* Outer teal lobe */}
                <ellipse cx="0" cy="0" rx="18" ry="24" fill="#0d9488" stroke="#14b8a6" strokeWidth="2" />
                {/* Golden orange ring */}
                <ellipse cx="0" cy="2" rx="14" ry="18" fill="#f59e0b" />
                {/* Royal blue ring */}
                <ellipse cx="0" cy="4" rx="10" ry="13" fill="#1d4ed8" />
                {/* Inner iridescent purple pupil */}
                <circle cx="0" cy="5" r="6" fill="#7e22ce" />
                {/* Bright white specular highlight */}
                <circle cx="-2" cy="3" r="2" fill="#ffffff" />
              </g>
            ))}

            {/* C. Golden Wing Feather Details on Body */}
            <g className="peacock-wing-gold">
              <path
                d="M 285 300 C 310 270, 370 280, 360 340 C 340 375, 290 365, 285 300 Z"
                fill="url(#goldFeatherWing)"
                stroke="#ca8a04"
                strokeWidth="2.5"
              />
              {/* Scalloped wing feather texture */}
              {[
                "M 300 295 Q 330 300 345 320",
                "M 295 315 Q 325 320 345 340",
                "M 295 335 Q 320 340 335 355",
              ].map((p, idx) => (
                <path key={idx} d={p} fill="none" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" />
              ))}
            </g>

            {/* D. Royal Blue Peacock Neck & Head (S-shaped graceful posture) */}
            <path
              d="M 285 315 C 275 270, 240 250, 245 200 C 248 165, 275 145, 260 145 C 240 145, 225 170, 230 220 C 235 270, 265 315, 285 315 Z"
              fill="url(#peacockBlueGrad)"
              stroke="#0369a1"
              strokeWidth="3"
            />

            {/* Peacock Head with proud beak */}
            <ellipse cx="250" cy="155" rx="14" ry="12" fill="#0284c7" />

            {/* Yellow / Golden Beak */}
            <polygon points="238,154 220,160 238,165" fill="#facc15" stroke="#b45309" strokeWidth="1" />

            {/* Peacock Eye with white surround and black pupil */}
            <ellipse cx="246" cy="153" rx="4" ry="3.5" fill="#ffffff" />
            <circle cx="245" cy="153" r="2" fill="#0f172a" />
            <circle cx="244.5" cy="152" r="0.75" fill="#ffffff" />

            {/* Majestic Crown Crest Feathers (Kalgi) on Head */}
            {[
              { x2: 242, y2: 122 },
              { x2: 248, y2: 118 },
              { x2: 255, y2: 122 },
            ].map((crest, i) => (
              <g key={i}>
                <line x1="250" y1="145" x2={crest.x2} y2={crest.y2} stroke="#ffffff" strokeWidth="2.5" />
                <circle cx={crest.x2} cy={crest.y2} r="4" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            ))}
          </g>

          {/* 5. ARC OF GLOWING DIYAS AROUND THE RANGOLI (Authentic Tea-Light Lamps) */}
          <g className="rangoli-diya-arc" filter="url(#diyaGlowFilter)">
            {[
              { cx: 340, cy: 115, ang: 20 },
              { cx: 285, cy: 110, ang: 0 },
              { cx: 235, cy: 125, ang: -25 },
              { cx: 195, cy: 155, ang: -45 },
              { cx: 165, cy: 200, ang: -65 },
              { cx: 150, cy: 255, ang: -85 },
              { cx: 155, cy: 310, ang: -105 },
              { cx: 175, cy: 365, ang: -125 },
              { cx: 215, cy: 415, ang: -145 },
              { cx: 270, cy: 445, ang: -170 },
              { cx: 330, cy: 450, ang: 170 },
            ].map((diya, i) => (
              <g key={i} transform={`translate(${diya.cx}, ${diya.cy})`}>
                {/* Diya Clay Pot Base (Terracotta / Brass Golden cup) */}
                <ellipse cx="0" cy="5" rx="14" ry="10" fill="#78350f" stroke="#d97706" strokeWidth="1.5" />
                <ellipse cx="0" cy="3" rx="12" ry="7" fill="#fde047" />

                {/* Animated Teardrop Warm Flame */}
                <path
                  d="M 0 -16 C -5 -8, -5 2, 0 3 C 5 2, 5 -8, 0 -16 Z"
                  fill="#ea580c"
                  className="rangoli-tealight-flame"
                  style={{ animationDelay: `${(i % 5) * 0.25}s` }}
                />
                <path
                  d="M 0 -12 C -3 -6, -3 0, 0 1 C 3 0, 3 -6, 0 -12 Z"
                  fill="#fef08a"
                  className="rangoli-tealight-inner"
                  style={{ animationDelay: `${(i % 5) * 0.25}s` }}
                />
              </g>
            ))}
          </g>

        </g>
      </svg>
    </div>
  );
};
