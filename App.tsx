import React, { useState } from 'react';
import { View } from './types';
import Lobby from './components/Lobby';
import GameRoom from './components/GameRoom';
import Wallet from './components/Wallet';
import Navigation from './components/Navigation';
import Header from './components/Header';
import Admin from './components/Admin';
import Leaderboard from './components/Leaderboard';
import History from './components/History';

interface ActiveSession {
  roomId: string;
  boardNumber: number;
  stake: number;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LOBBY);
  const [walletBalance, setWalletBalance] = useState<number>(500.00); 
  const [bonus, setBonus] = useState<number>(10);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [selectedSessionIdx, setSelectedSessionIdx] = useState<number>(0);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  const handleJoinGame = (num: number, stake: number, roomId: string) => {
    if (walletBalance < stake) {
      alert("Insufficient balance! Please deposit in the wallet tab.");
      return;
    }
    
    if (activeSessions.find(s => s.roomId === roomId)) {
      alert("You are already in this room!");
      return;
    }

    setWalletBalance(prev => prev - stake);
    const newSession = { roomId, boardNumber: num, stake };
    const newSessions = [...activeSessions, newSession];
    setActiveSessions(newSessions);
    setSelectedSessionIdx(newSessions.length - 1);
    setCurrentView(View.ACTIVE_GAME);
  };

  const handleLeaveGame = (roomId: string) => {
    const updated = activeSessions.filter(s => s.roomId !== roomId);
    setActiveSessions(updated);
    if (updated.length === 0) {
      setCurrentView(View.LOBBY);
      setSelectedNumber(null);
    } else {
      setSelectedSessionIdx(0);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case View.LOBBY:
        return (
          <Lobby 
            onStartGame={handleJoinGame} 
            selectedNumber={selectedNumber}
            setSelectedNumber={setSelectedNumber}
            activeRoomIds={activeSessions.map(s => s.roomId)}
          />
        );
      case View.ACTIVE_GAME:
        const currentSession = activeSessions[selectedSessionIdx];
        if (!currentSession) return null;
        return (
          <div className="flex flex-col h-full relative">
            {activeSessions.length > 1 && (
              <div className="bg-black/40 p-2 flex gap-2 overflow-x-auto custom-scrollbar border-b border-white/10">
                {activeSessions.map((s, idx) => (
                  <button 
                    key={s.roomId}
                    onClick={() => setSelectedSessionIdx(idx)}
                    className={`px-3 py-1 rounded-full text-[10px] font-black whitespace-nowrap transition-all ${selectedSessionIdx === idx ? 'bg-orange-500 text-white' : 'bg-white/10 text-white/40'}`}
                  >
                    {s.roomId} (#{s.boardNumber})
                  </button>
                ))}
              </div>
            )}
            <GameRoom 
              onLeave={() => handleLeaveGame(currentSession.roomId)} 
              boardNumber={currentSession.boardNumber}
              stake={currentSession.stake}
              balance={walletBalance}
              setBalance={setWalletBalance}
              roomId={currentSession.roomId}
            />
          </div>
        );
      case View.WALLET:
        return <Wallet balance={walletBalance} setBalance={setWalletBalance} />;
      case View.SCORES:
        return <Leaderboard />;
      case View.HISTORY:
        return <History />;
      case View.ADMIN:
        return <Admin />;
      case View.PROFILE:
        return (
          <div className="p-8 text-white text-center animate-fadeIn">
            <div className="w-24 h-24 bg-white/10 rounded-full mx-auto mb-4 flex items-center justify-center border-4 border-white/5">
              <i className="fas fa-user text-4xl"></i>
            </div>
            <h2 className="text-2xl font-black mb-1">Win Player</h2>
            <p className="text-white/40 text-xs mb-6">ID: 99281734</p>
            <div className="bg-white/5 rounded-2xl p-4 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="opacity-60">Total Games</span>
                <span className="font-bold">142</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="opacity-60">Total Won</span>
                <span className="font-bold text-orange-500">1,405 ETB</span>
              </div>
            </div>
            <button 
              onClick={() => setCurrentView(View.HISTORY)}
              className="mt-6 w-full py-3 bg-white/5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5"
            >
              My Game History
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#1a1b23] overflow-hidden shadow-2xl relative">
      {(currentView !== View.ACTIVE_GAME && currentView !== View.ADMIN) && (
        <Header 
          balance={walletBalance} 
          bonus={bonus} 
          activeGames={activeSessions.length} 
          stake={activeSessions.reduce((acc, s) => acc + s.stake, 0)} 
        />
      )}
      
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {renderContent()}
      </main>

      {currentView !== View.ACTIVE_GAME && (
        <Navigation currentView={currentView} setView={setCurrentView} />
      )}
    </div>
  );
};

export default App;