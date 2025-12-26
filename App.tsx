import React, { useState, useEffect } from 'react';
import { View } from './types';
import Lobby from './components/Lobby';
import GameRoom from './components/GameRoom';
import Wallet from './components/Wallet';
import Navigation from './components/Navigation';
import Header from './components/Header';
import { socket } from './socket'; // This is correct now

interface ActiveSession {
  roomId: string;
  boardNumber: number;
  stake: number;
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.LOBBY);
  const [walletBalance, setWalletBalance] = useState<number>(0); 
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  useEffect(() => {
    // TELEGRAM AUTH & SOCKET CONNECTION
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      
      const user = tg.initDataUnsafe?.user;
      if (user) {
        socket.auth = { token: tg.initData }; // Send Telegram Auth Token
        socket.connect();
        socket.emit('login', user);
      }
    } else {
        // Fallback for browser testing (remove in production)
        socket.connect();
        socket.emit('login', { id: 'TEST_USER_1', first_name: 'Test', username: 'tester' });
    }

    socket.on('login_success', (data: any) => setWalletBalance(data.balance));
    socket.on('balance_update', (bal: number) => setWalletBalance(bal));
    socket.on('joined_success', (data: any) => setWalletBalance(data.balance));
    
    return () => { socket.off('login_success'); socket.off('balance_update'); };
  }, []);

  const handleJoinGame = (num: number, stake: number, roomId: string) => {
    if (walletBalance < stake) {
      alert("Insufficient balance! Use the bot to deposit.");
      return;
    }
    // Request server to join
    socket.emit('join_game', { roomId, boardNumber: num });
    
    // Optimistically update UI
    setActiveSessions([{ roomId, boardNumber: num, stake }]);
    setCurrentView(View.ACTIVE_GAME);
  };

  const handleLeaveGame = (roomId: string) => {
    setActiveSessions([]);
    setCurrentView(View.LOBBY);
    setSelectedNumber(null);
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
        if (activeSessions.length === 0) return null;
        return (
          <GameRoom 
            onLeave={() => handleLeaveGame(activeSessions[0].roomId)} 
            boardNumber={activeSessions[0].boardNumber}
            stake={activeSessions[0].stake}
            balance={walletBalance}
            roomId={activeSessions[0].roomId}
          />
        );
      case View.WALLET:
        return <Wallet balance={walletBalance} />;
      default:
        return <div className="p-10 text-center text-white">Coming Soon</div>;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-[#1a1b23] overflow-hidden relative">
      {currentView !== View.ACTIVE_GAME && (
        <Header balance={walletBalance} bonus={0} activeGames={0} stake={0} />
      )}
      <main className="flex-1 overflow-y-auto custom-scrollbar">{renderContent()}</main>
      {currentView !== View.ACTIVE_GAME && <Navigation currentView={currentView} setView={setCurrentView} />}
    </div>
  );
};
export default App;