const items = [
  "UPVC PRODUCTS",
  "PVC PRODUCTS",
  "SLIDING CUPBOARDS",
  "CASEMENT SYSTEMS",
  "TILT & TURN",
  "FIXED GLAZING",
  "ENERGY EFFICIENT",
  "10-YEAR WARRANTY",
];

export default function MarqueeBanner() {
  const doubled = [...items, ...items];

  return (
    <div className="border-y border-border bg-foreground overflow-hidden py-4">
      <div className="flex gap-12 whitespace-nowrap animate-marquee">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="text-xs font-bold tracking-widest text-white uppercase flex items-center gap-12"
          >
            {item}
            <span className="w-1 h-1 rounded-full bg-white/40 inline-block" />
          </span>
        ))}
      </div>
    </div>
  );
}
