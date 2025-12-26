import React, { useState, useMemo, useEffect } from 'react';
import { generateFairBoard } from '../utils';
import { socket } from '../socket';

interface LobbyProps {
  onStartGame: (num: number, stake: number, roomId: string) => void;
  selectedNumber: number | null;
  setSelectedNumber: (num: number | null) => void;
  activeRoomIds: string[];
}

const Lobby: React.FC<LobbyProps> = ({ onStartGame, selectedNumber, setSelectedNumber, activeRoomIds }) => {
  const [activeGames, setActiveGames] = useState<any[]>([]);

  useEffect(() => {
    socket.on('lobby_update', (roomData: any) => {
      setActiveGames(prev => {
        const idx = prev.findIndex(g => g.id === roomData.roomId);
        if (idx >= 0) {
          const newArr = [...prev];
          newArr[idx] = { ...newArr[idx], ...roomData, id: roomData.roomId };
          return newArr;
        } else {
          return [...prev, { id: roomData.roomId, stake: roomData.roomId === 'R1' ? 10 : 50, ...roomData }];
        }
      });
    });
    return () => { socket.off('lobby_update'); };
  }, []);

  // Default display if no server connection yet
  const displayGames = activeGames.length > 0 ? activeGames : [
      { id: 'R1', players: 0, timer: 30, stake: 10, status: 'WAITING' },
      { id: 'R2', players: 0, timer: 60, stake: 50, status: 'WAITING' }
  ];

  const numbers = Array.from({ length: 100 }, (_, i) => i + 1);
  const previewMatrix = useMemo(() => selectedNumber ? generateFairBoard(selectedNumber) : null, [selectedNumber]);

  return (
    <div className="px-2 py-1 flex flex-col h-full bg-[#1a1b23]">
      <div className="grid grid-cols-10 gap-0.5 mb-2 bg-black/30 p-1.5 rounded-xl border border-white/5 shrink-0">
        {numbers.map((num) => (
            <button
              key={num}
              onClick={() => setSelectedNumber(num === selectedNumber ? null : num)}
              className={`aspect-square rounded-[3px] text-[7px] font-black flex items-center justify-center transition-all
                ${selectedNumber === num ? 'bg-orange-500 text-white scale-105' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
            >
              {num}
            </button>
        ))}
      </div>

      <div className="flex flex-1 gap-2 min-h-0 mb-1 overflow-hidden">
        <div className="flex-[1.3] flex flex-col bg-black/20 rounded-xl p-2 border border-white/5">
          <span className="text-[7px] font-black text-white/40 uppercase mb-2">Live Arenas</span>
          {displayGames.map(game => (
            <div 
              key={game.id} 
              onClick={() => selectedNumber && game.status === 'WAITING' && onStartGame(selectedNumber, game.stake, game.id)}
              className={`bg-white/5 rounded-lg p-2 mb-2 flex justify-between items-center border border-white/5 cursor-pointer hover:bg-white/10`}
            >
              <div>
                <div className="text-[9px] font-black text-white">{game.id} • {game.stake} ETB</div>
                <div className="text-[7px] text-white/40">{game.status} • {game.playerCount || 0} Players</div>
              </div>
              <div className="text-orange-500 font-black text-xs">
                {game.status === 'WAITING' ? `00:${game.timer < 10 ? '0'+game.timer : game.timer}` : 'LIVE'}
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 bg-zinc-900/40 p-2 rounded-xl border border-white/5 flex items-center justify-center">
            {selectedNumber && previewMatrix ? (
              <div className="grid grid-cols-5 gap-0.5 w-full">
                {previewMatrix.map((row, r) => row.map((cell, c) => (
                  <div key={`${r}-${c}`} className={`aspect-square flex items-center justify-center text-[6px] font-black rounded border ${cell === '*' ? 'bg-orange-500 text-white' : 'bg-white/5 text-white/40'}`}>{cell === '*' ? '★' : cell}</div>
                )))}
              </div>
            ) : <p className="text-[6px] text-white/20 uppercase">Select Board</p>}
        </div>
      </div>
    </div>
  );
};
export default Lobby;