import React from 'react';
import { View } from '../types';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const tabs = [
    { id: View.LOBBY, label: 'Game', icon: 'fa-gamepad' },
    { id: View.SCORES, label: 'Ranks', icon: 'fa-trophy' },
    { id: View.WALLET, label: 'Funds', icon: 'fa-wallet' },
    { id: View.PROFILE, label: 'User', icon: 'fa-user' },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/5 flex justify-around items-center py-2.5 px-1 z-40">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setView(tab.id)}
          className={`flex flex-col items-center flex-1 transition-all active:scale-90 ${
            currentView === tab.id ? 'text-orange-500' : 'text-white/20'
          }`}
        >
          <i className={`fas ${tab.icon} text-base mb-1`}></i>
          <span className="text-[8px] font-black uppercase tracking-tighter">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default Navigation;