import React from 'react';

const Wallet: React.FC<{ balance: number }> = ({ balance }) => {
  return (
    <div className="p-6 text-white text-center pt-20">
      <div className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-2">Total Balance</div>
      <div className="text-6xl font-black mb-8">{balance.toFixed(2)} <span className="text-lg text-orange-500">ETB</span></div>
      
      <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
        <i className="fas fa-robot text-4xl mb-4 text-blue-400"></i>
        <p className="text-sm font-bold mb-4">Manage Funds via Bot</p>
        <button 
          onClick={() => (window as any).Telegram?.WebApp?.close()}
          className="bg-blue-500 w-full py-3 rounded-xl font-black text-sm uppercase"
        >
          Return to Telegram
        </button>
      </div>
    </div>
  );
};
export default Wallet;