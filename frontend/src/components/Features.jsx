import { motion } from "framer-motion";
import { PieChart, ArrowLeftRight, Zap } from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Vue consolidée",
      desc: "Tous vos comptes en un seul endroit. Visualisez vos soldes Orange et MTN instantanément.",
      icon: <PieChart className="text-[#0f7b3f]" size={32} />
    },
    {
      title: "Transferts faciles",
      desc: "Envoyez de l’argent entre réseaux. Fini les barrières entre les différents opérateurs.",
      icon: <ArrowLeftRight className="text-[#0f7b3f]" size={32} />
    },
    {
      title: "Analyse intelligente",
      desc: "Score de solvabilité automatique. Accédez au micro-crédit grâce à votre historique.",
      icon: <Zap className="text-[#0f7b3f]" size={32} />
    },
  ];

  return (
    <section className="flex flex-wrap justify-center gap-10 px-10 md:px-20 py-24 bg-gray-50/50 border-y border-gray-100">
      {features.map((f, i) => (
        <motion.div 
          key={i} 
          whileHover={{ y: -10 }}
          className="bg-white p-10 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-50 flex-1 min-w-[300px] max-w-[400px] group transition-all"
        >
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#0f7b3f] group-hover:text-white transition-all">
            {f.icon}
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-[#0f7b3f] transition-colors">{f.title}</h3>
          <p className="text-gray-500 leading-relaxed">{f.desc}</p>
        </motion.div>
      ))}
    </section>
  );
}
