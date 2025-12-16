// export function Logo({ width = 200 }) {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 200 200"
//       width="200"
//       height="200"
//       className={`w-${width} max-w-30 h-auto`}
//     >
//       <defs>
//         {/* <!-- Blue gradient --> */}h
//         <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//           <stop offset="0%" style={{ stopColor: "#0066cc", stopOpacity: 1 }} />
//           <stop
//             offset="100%"
//             style={{ stopColor: "#0099ff", stopOpacity: 1 }}
//           />
//         </linearGradient>
//         {/* <!-- Cyan accent gradient --> */}
//         <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
//           <stop offset="0%" style={{ stopColor: "#00ccff", stopOpacity: 1 }} />
//           <stop
//             offset="100%"
//             style={{ stopColor: "#0099ff", stopOpacity: 1 }}
//           />
//         </linearGradient>
//       </defs>

import Link from "next/link";

//       {/* <!-- Outer ring (achievement circle) --> */}
//       <circle
//         cx="100"
//         cy="100"
//         r="90"
//         fill="none"
//         stroke="#e6f2ff"
//         strokeWidth="3"
//       />

//       {/* <!-- Progress arc (top-right) --> */}
//       <path
//         d="M 100 20 A 80 80 0 0 1 156.57 43.43"
//         fill="none"
//         stroke="url(#blueGradient)"
//         strokeWidth="4"
//         strokeLinecap="round"
//       />

//       {/* <!-- Central hexagon (data/results symbol) --> */}
//       <g transform="translate(100, 100)">
//         {/* <!-- Outer hexagon --> */}
//         <polygon
//           points="0,-45 39,-22.5 39,22.5 0,45 -39,22.5 -39,-22.5"
//           fill="none"
//           stroke="url(#blueGradient)"
//           strokeWidth="2.5"
//         />

//         {/* <!-- Inner hexagon --> */}
//         <polygon
//           points="0,-28 24,-14 24,14 0,28 -24,14 -24,-14"
//           fill="#f0f7ff"
//           stroke="#0066cc"
//           strokeWidth="1.5"
//         />

//         {/* <!-- Center data points (3 dots forming upward trend) --> */}
//         <circle cx="-8" cy="8" r="3.5" fill="#0099ff" />
//         <circle cx="0" cy="-2" r="3.5" fill="#0066cc" />
//         <circle cx="8" cy="-12" r="3.5" fill="url(#cyanGradient)" />

//         {/* <!-- Connecting lines (trend) --> */}
//         <line
//           x1="-8"
//           y1="8"
//           x2="0"
//           y2="-2"
//           stroke="#0066cc"
//           strokeWidth="1.5"
//           opacity="0.6"
//         />
//         <line
//           x1="0"
//           y1="-2"
//           x2="8"
//           y2="-12"
//           stroke="#0099ff"
//           strokeWidth="1.5"
//           opacity="0.6"
//         />
//       </g>

//       {/* <!-- Accent dots (corners) --> */}
//       <circle cx="30" cy="30" r="4" fill="#00ccff" opacity="0.7" />
//       <circle cx="170" cy="170" r="4" fill="#0066cc" opacity="0.7" />
//       <circle cx="170" cy="30" r="3" fill="#0099ff" opacity="0.5" />
//       <circle cx="30" cy="170" r="3" fill="#0099ff" opacity="0.5" />
//     </svg>
//   );
// }

//Logo 1
export function Logo({ width = 200 }) {
  return (
    <Link href="/">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        width="200"
        height="200"
        className={`w-${width} max-w-30 h-auto`}
      >
        {/* <!-- Background circle --> */}
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="#f0f7ff"
          stroke="#0066cc"
          strokeWidth="2"
        />

        {/* <!-- Main logo group --> */}
        <g transform="translate(100, 100)">
          {/* <!-- Graduation cap top --> */}
          <path
            d="M -35 -15 L 0 -35 L 35 -15 Z"
            fill="#0066cc"
            stroke="#004499"
            strokeWidth="1.5"
          />

          {/* <!-- Graduation cap board --> */}
          <rect
            x="-38"
            y="-12"
            width="76"
            height="8"
            fill="#0052a3"
            stroke="#003d7a"
            strokeWidth="1.5"
            rx="2"
          />

          {/* <!-- Tassel --> */}
          <line x1="0" y1="0" x2="0" y2="25" stroke="#0066cc" strokeWidth="2" />
          <circle cx="0" cy="28" r="3" fill="#0066cc" />

          {/* <!-- Chart bars (results visualization) --> */}
          <g transform="translate(-20, 5)">
            {/* <!-- Bar 1 --> */}
            <rect
              x="0"
              y="8"
              width="8"
              height="20"
              fill="#0099ff"
              stroke="#0066cc"
              strokeWidth="1"
              rx="1"
            />

            {/* <!-- Bar 2 --> */}
            <rect
              x="12"
              y="2"
              width="8"
              height="26"
              fill="#0066cc"
              stroke="#004499"
              strokeWidth="1"
              rx="1"
            />

            {/* <!-- Bar 3 --> */}
            <rect
              x="24"
              y="5"
              width="8"
              height="23"
              fill="#00ccff"
              stroke="#0066cc"
              strokeWidth="1"
              rx="1"
            />
          </g>

          {/* <!-- Upward arrow (achievement/progress) --> */}
          <g transform="translate(15, -5)">
            <path
              d="M 0 15 L 0 0 M -5 5 L 0 0 L 5 5"
              stroke="#00cc66"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </g>

        {/* <!-- Platform name arc (optional - can be removed) --> */}
        <defs>
          <path id="topArc" d="M 30,100 A 70,70 0 0,1 170,100" fill="none" />
        </defs>
        <text
          fontFamily="Arial, sans-serif"
          fontSize="14"
          fontWeight="bold"
          fill="#0066cc"
          letterSpacing="2"
        >
          <textPath href="#topArc" startOffset="50%" textAnchor="middle">
            FUTO RESULTS
          </textPath>
        </text>
      </svg>
    </Link>
  );
}

export function LogoWithName({ isLight = false }: { isLight: boolean }) {
  return (
    <div className=" flex gap-12 items-center">
      <Logo width={40} />
      <span
        className={`text-20  font-[600] ${
          isLight ? "text-white" : "text-[#111827]"
        }`}
      >
        Student Result Portal
      </span>
    </div>
  );
}
