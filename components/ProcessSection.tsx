const steps = [
  {
    number: "01",
    title: "Requirement Analysis",
    description:
      "Site visit to assess your space, understand ventilation, durability, and design needs for PVC and UPVC applications.",
  },
  {
    number: "02",
    title: "Material Selection",
    description:
      "Choose from a wide range of PVC and UPVC profiles, finishes, colors, and accessories suited for your project.",
  },
  {
    number: "03",
    title: "Custom Fabrication",
    description:
      "Precision fabrication using high-quality PVC/UPVC materials ensuring strength, weather resistance, and long life.",
  },
  {
    number: "04",
    title: "Installation",
    description:
      "Efficient and clean installation of PVC/UPVC systems by trained professionals with proper sealing and finishing.",
  },
  {
    number: "05",
    title: "Finishing & Support",
    description:
      "Final quality check, clean-up, and guidance on maintenance to ensure long-lasting performance of your PVC/UPVC products.",
  },
];
export default function ProcessSection() {
  return (
    <section className="border-b border-border">
      <div className="px-6 md:px-10 lg:px-16 py-20">
        <div className="mb-16">
          <p className="label-sm mb-4">How It Works</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight text-foreground leading-tight">
            From Idea
            <br />
            <span className="italic font-extralight">To Installation</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 border border-border">
          {steps.map(({ number, title, description }) => (
            <div
              key={number}
              className="
                relative p-8 border-r border-border last:border-r-0
                bg-transparent
                transition-all duration-300 ease-out
                hover:-translate-y-2 hover:scale-[1.02]
                hover:bg-foreground
                hover:shadow-2xl
                group
              "
            >
              {/* glow overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-white transition-opacity duration-300" />

              <p className="text-5xl font-black text-border group-hover:text-background/20 mb-6 transition-colors duration-300">
                {number}
              </p>

              <h3 className="text-base font-black text-foreground group-hover:text-background mb-3 transition-colors duration-300">
                {title}
              </h3>

              <p className="text-xs text-muted-foreground group-hover:text-background/70 leading-relaxed transition-colors duration-300">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
