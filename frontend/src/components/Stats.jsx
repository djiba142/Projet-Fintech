export default function Stats() {
  const stats = [
    { value: "7000+", label: "Utilisateurs", desc: "font confiance à Kandjou" },
    { value: "2", label: "Opérateurs", desc: "Orange et MTN" },
    { value: "98%", label: "Disponibilité", desc: "Service ininterrompu" },
    { value: "< 5 min", label: "Score crédit", desc: "Analyse instantanée" },
  ];

  return (
    <section className="flex flex-wrap justify-around items-center px-10 md:px-20 py-20 bg-[#e9f5ee]/40">
      {stats.map((s, i) => (
        <div key={i} className="text-center p-8 transition-transform hover:scale-105">
          <h3 className="text-5xl font-black text-[#0f7b3f] mb-3">{s.value}</h3>
          <p className="text-lg font-bold text-gray-800 uppercase tracking-widest text-[14px]">{s.label}</p>
          <p className="text-sm text-gray-400 font-medium mt-1">{s.desc}</p>
        </div>
      ))}
    </section>
  );
}
