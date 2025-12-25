import React from 'react';

interface HeaderProps {
  balance: number;
  bonus: number;
  activeGames: number;
  stake: number;
}

const Header: React.FC<HeaderProps> = ({ balance, bonus, activeGames, stake }) => {
  return (
    <div className="pt-2 pb-1 px-3 bg-[#121212] border-b border-white/5">
      <div className="flex justify-between items-center mb-1.5 px-1">
        <h1 className="text-white font-black text-lg leading-tight tracking-tighter">WIN <span className="text-orange-500">BINGO</span></h1>
        <div className="flex gap-2">
          <div className="flex flex-col items-end">
            <span className="text-[6px] text-white/40 font-bold uppercase">Balance</span>
            <span className="text-[10px] font-black text-white leading-none">{balance.toFixed(0)} ETB</span>
          </div>
          <button className="text-white opacity-20 hover:opacity-100 self-center ml-2">
            <i className="fas fa-cog text-xs"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 mb-1">
        <div className="bg-white/5 border border-white/5 rounded-lg py-1 px-1 flex flex-col items-center justify-center">
          <span className="text-[6px] text-white/40 font-bold uppercase">Bonus</span>
          <span className="text-[9px] font-black text-orange-400 leading-none">{bonus}</span>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-lg py-1 px-1 flex flex-col items-center justify-center">
          <span className="text-[6px] text-white/40 font-bold uppercase">Active</span>
          <span className="text-[9px] font-black text-white leading-none">{activeGames}</span>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-lg py-1 px-1 flex flex-col items-center justify-center">
          <span className="text-[6px] text-white/40 font-bold uppercase">Stake</span>
          <span className="text-[9px] font-black text-white leading-none">{stake}</span>
        </div>
      </div>
    </div>
  );
};

export default Header;