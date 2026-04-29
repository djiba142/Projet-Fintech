import { Smartphone, ChevronRight, FileText, ArrowLeftRight, RefreshCw, User, Home } from "lucide-react";

function AccountView() {
  return (
    <div className="relative z-10 w-[300px] aspect-[9/18.5] bg-white rounded-[3.5rem] p-3 shadow-2xl border border-gray-100">
       <div className="w-full h-full bg-gray-50 rounded-[2.8rem] overflow-hidden relative">
          <div className="p-6 pt-12 space-y-6">
             <div className="flex justify-between items-center">
                <div>
                   <p className="text-[11px] text-gray-800 font-bold">Bonjour Kadiatou 👋</p>
                   <p className="text-[9px] text-gray-400 font-medium">Vue consolidée de vos comptes</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400"><Smartphone size={16} /></div>
             </div>
             
             <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50">
                <p className="text-[8px] text-gray-400 font-bold uppercase mb-1">Solde total consolidé</p>
                <p className="text-xl font-black text-gray-900">12 847 500 <span className="text-[10px] text-gray-400 font-normal">GNF</span></p>
                <p className="text-[7px] text-green-500 mt-1 font-bold">Mis à jour : 12/05/2024 - 10:30</p>
             </div>
             
             <div className="bg-kandjou-orange p-5 rounded-3xl text-white shadow-lg shadow-orange-500/10">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-[8px] opacity-70 font-bold uppercase mb-1">Orange Money Guinée</p>
                      <p className="text-lg font-black">8 250 000 <span className="text-[10px] opacity-70 font-normal">GNF</span></p>
                   </div>
                   <img src="/orange.png" className="h-6 opacity-30" alt="" />
                </div>
                <button className="text-[8px] font-bold mt-2 opacity-80 flex items-center gap-1">Voir détails <ChevronRight size={8} /></button>
             </div>

             <div className="bg-kandjou-yellow p-5 rounded-3xl text-gray-900 shadow-lg shadow-yellow-500/10">
                <div className="flex justify-between items-start">
                   <div>
                      <p className="text-[8px] opacity-50 font-bold uppercase mb-1">MTN Mobile Money Guinée</p>
                      <p className="text-lg font-black">4 597 500 <span className="text-[10px] opacity-50 font-normal">GNF</span></p>
                   </div>
                   <img src="/mtn.png" className="h-6 opacity-20" alt="" />
                </div>
                <button className="text-[8px] font-bold mt-2 opacity-60 flex items-center gap-1">Voir détails <ChevronRight size={8} /></button>
             </div>

             <div>
                <p className="text-[10px] font-black text-gray-800 mb-4">Accès rapides</p>
                <div className="grid grid-cols-4 gap-2">
                   {[
                      { icon: FileText, label: "Transactions" },
                      { icon: ArrowLeftRight, label: "Transferts" },
                      { icon: RefreshCw, label: "Score" },
                      { icon: User, label: "Profil" },
                   ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                         <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-gray-50 flex items-center justify-center text-gray-400"><item.icon size={16} /></div>
                         <span className="text-[7px] font-bold text-gray-400">{item.label}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>
          {/* BOTTOM TAB BAR */}
          <div className="absolute bottom-0 w-full h-16 border-t border-gray-100 flex justify-around items-center bg-white/95">
             <div className="flex flex-col items-center gap-1 text-kandjou-green"><Home size={18} /><span className="text-[7px] font-bold">Accueil</span></div>
             <div className="flex flex-col items-center gap-1 text-gray-300"><FileText size={18} /><span className="text-[7px] font-bold">Transactions</span></div>
             <div className="flex flex-col items-center gap-1 text-gray-300"><ArrowLeftRight size={18} /><span className="text-[7px] font-bold">Transferts</span></div>
             <div className="flex flex-col items-center gap-1 text-gray-300"><User size={18} /><span className="text-[7px] font-bold">Profil</span></div>
          </div>
       </div>
    </div>
  );
}

export default AccountView;
