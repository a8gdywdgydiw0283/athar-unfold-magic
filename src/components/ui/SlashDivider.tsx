import Slash from "./Slash";

type SlashDividerProps = {
  flip?: boolean;
  className?: string;
};

export default function SlashDivider({ flip = false, className = "" }: SlashDividerProps) {
  return (
    <div
      className={`relative flex items-center justify-center py-8 ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-x-0 top-1/2 h-px bg-athar-border -translate-y-1/2" />
      <div className={`relative z-10 ${flip ? "scale-x-[-1]" : ""}`}>
        <Slash width={32} height={70} delay={0.1} />
      </div>
    </div>
  );
}