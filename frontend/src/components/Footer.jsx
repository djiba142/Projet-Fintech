export default function Footer() {
  return (
    <footer className="bg-[#0f7b3f] text-white py-16 px-10 md:px-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
        <div className="flex flex-col items-center md:items-start gap-4">
           <div className="flex items-center gap-3">
              <span className="text-3xl font-black tracking-tighter">KANDJOU</span>
           </div>
           <p className="text-sm font-medium text-green-100/60 max-w-xs text-center md:text-left leading-relaxed">
              L'intelligence financière au service de la Guinée. Plateforme certifiée et sécurisée.
           </p>
        </div>
        
        <div className="flex gap-10 text-sm font-bold text-green-50">
           <a href="#" className="hover:underline">Conditions d'utilisation</a>
           <a href="#" className="hover:underline">Politique de confidentialité</a>
        </div>

        <div className="text-[12px] font-bold uppercase tracking-[0.2em] text-green-100/40">
           © 2026 KANDJOU FINTECH • TOUS DROITS RÉSERVÉS
        </div>
      </div>
    </footer>
  );
}
