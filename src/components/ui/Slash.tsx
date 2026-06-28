import { motion } from "framer-motion";

type SlashProps = {
  className?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
  delay?: number;
  color?: string;
};

const SLASH_LINE = "M 14 95 L 32 5";
const SLASH_FILL = "M 8 92 L 28 8 L 38 8 L 18 92 Z";

export default function Slash({
  className = "",
  width = 46,
  height = 100,
  strokeWidth = 4,
  delay = 0,
  color = "#C8FF00",
}: SlashProps) {
  return (
    <svg
      viewBox="0 0 46 100"
      width={width}
      height={height}
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <motion.path
        d={SLASH_LINE}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay, ease: "easeInOut" }}
      />
      <motion.path
        d={SLASH_FILL}
        fill={color}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.15 }}
        transition={{ duration: 0.4, delay: delay + 0.4 }}
      />
    </svg>
  );
}

export function SlashMotif({ className = "" }: { className?: string }) {
  const slashes = [
    { x: "10%", y: "15%", scale: 2.5, delay: 0, opacity: 0.06 },
    { x: "75%", y: "5%", scale: 3.5, delay: 0.15, opacity: 0.04 },
    { x: "85%", y: "60%", scale: 2, delay: 0.3, opacity: 0.05 },
    { x: "5%", y: "70%", scale: 1.8, delay: 0.2, opacity: 0.04 },
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      {slashes.map((slash, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: slash.x,
            top: slash.y,
            opacity: slash.opacity,
            transform: `scale(${slash.scale})`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: slash.opacity }}
          transition={{ duration: 0.8, delay: slash.delay }}
        >
          <Slash width={46} height={100} delay={slash.delay} strokeWidth={3} />
        </motion.div>
      ))}
    </div>
  );
}