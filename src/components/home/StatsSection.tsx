const stats = [
  { value: "2M+", label: "Happy Users" },
  { value: "500+", label: "Parking Lots" },
  { value: "15+", label: "Cities Covered" },
  { value: "4.9", label: "App Store Rating" },
];

const StatsSection = () => {
  return (
    <section className="bg-[hsl(var(--stats-bg))] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl md:text-5xl font-extrabold text-white">{s.value}</p>
              <p className="text-sm text-gray-400 mt-2">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
