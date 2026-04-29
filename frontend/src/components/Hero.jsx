import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AccountView from "./AccountView";

export default function Hero() {
  const texts = [
    "Vue consolidée des comptes",
    "Transferts Orange ↔ MTN",
    "Score de solvabilité instantané",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="flex flex-col md:flex-row justify-between items-center px-10 md:px-20 py-20 bg-white">
      <div className="max-w-2xl">
        <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-8 text-gray-900">
          Tous vos comptes <br />
          <span className="text-[#0f7b3f]">Mobile Money</span>, <br />
          un seul endroit.
        </h2>
        <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
          Kandjou vous permet de consulter, gérer et analyser vos comptes Orange Money et MTN Mobile Money depuis une interface unique et sécurisée.
        </p>
        <div className="flex gap-5">
          <button className="bg-[#0f7b3f] text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-[#0c6232] shadow-xl shadow-green-900/20 transition-all active:scale-95">
            Commencer
          </button>
          <button className="border-2 border-gray-100 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all active:scale-95 text-gray-700">
            Voir démo
          </button>
        </div>
        <p className="mt-6 text-sm text-gray-400 font-medium flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Vos données sont sécurisées et chiffrées par la technologie Kandjou.
        </p>
      </div>

      <div className="mt-16 md:mt-0 relative">
        {/* THE DYNAMIC INTERFACE BOX */}
        <div className="bg-[#0f7b3f] text-white p-1 rounded-3xl shadow-2xl overflow-hidden w-[320px] aspect-[9/18.5]">
          <div className="bg-gray-50 h-full w-full rounded-[1.8rem] overflow-hidden relative">
             <div className="absolute top-0 left-0 w-full bg-[#0f7b3f] py-4 px-6 text-center shadow-lg">
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-[12px] font-bold tracking-wide uppercase"
                  >
                    {texts[index]}
                  </motion.p>
                </AnimatePresence>
             </div>
             
             {/* SIMULATED CONTENT OF THE APP */}
             <div className="p-6 pt-16">
                <AccountView />
             </div>
          </div>
          
          {/* FLOATING DECORATIONS */}
          <div className="absolute -right-6 -top-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 animate-bounce delay-700">
             <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-[#0f7b3f] font-bold">K</div>
          </div>
        </div>
      </div>
    </section>
  );
}
