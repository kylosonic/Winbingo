import React, { useState, useMemo, useEffect } from 'react';
import { generateFairBoard } from '../utils';

interface LobbyProps {
  onStartGame: (num: number, stake: number, roomId: string) => void;
  selectedNumber: number | null;
  setSelectedNumber: (num: number | null) => void;
  activeRoomIds: string[];
}

const Lobby: React.FC<LobbyProps> = ({ onStartGame, selectedNumber, setSelectedNumber, activeRoomIds }) => {
  const [activeGames, setActiveGames] = useState([
    { id: 'R1', players: 24, timer: 30, stake: 10 },
    { id: 'R2', players: 18, timer: 15, stake: 10 },
    { id: 'R3', players: 12, timer: 22, stake: 10 },
    { id: 'R4', players: 8, timer: 10, stake: 10 },
  ]);

  const [otherPlayersNumbers, setOtherPlayersNumbers] = useState<number[]>([]);

  useEffect(() => {
    const updateOthers = () => {
      const set = new Set<number>();
      for (let i = 0; i < 22; i++) {
        set.add(Math.floor(Math.random() * 100) + 1);
      }
      setOtherPlayersNumbers(Array.from(set));
    };
    updateOthers();
    const interval = setInterval(updateOthers, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveGames(prev => prev.map(g => ({
        ...g,
        timer: g.timer <= 0 ? 30 : g.timer - 1,
        players: g.timer <= 0 ? Math.floor(Math.random() * 20) + 5 : g.players + (Math.random() > 0.8 ? 1 : 0)
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const numbers = Array.from({ length: 100 }, (_, i) => i + 1);
  const previewMatrix = useMemo(() => selectedNumber ? generateFairBoard(selectedNumber) : null, [selectedNumber]);

  return (
    <div className="px-2 py-1 flex flex-col h-full overflow-hidden animate-fadeIn bg-[#1a1b23]">
      {/* 1-100 Grid Section - Ultra small buttons */}
      <div className="grid grid-cols-10 gap-0.5 mb-2 bg-black/30 p-1.5 rounded-xl border border-white/5 shrink-0">
        {numbers.map((num) => {
          const isSelected = selectedNumber === num;
          const isOther = otherPlayersNumbers.includes(num);
          return (
            <button
              key={num}
              onClick={() => !isOther && setSelectedNumber(num === selectedNumber ? null : num)}
              className={`aspect-square rounded-[3px] text-[7px] font-black flex items-center justify-center transition-all
                ${isSelected ? 'bg-orange-500 text-white scale-105 z-10 shadow-lg ring-1 ring-white/20' : 
                  isOther ? 'bg-orange-900/30 text-orange-200/40 cursor-not-allowed border border-orange-500/10' : 
                  'bg-white/5 text-white/30 hover:bg-white/10'}`}
            >
              {num}
            </button>
          );
        })}
      </div>

      {/* Split Section: Arenas (Left) | Preview (Right) - side by side and tiny */}
      <div className="flex flex-1 gap-2 min-h-0 mb-1 overflow-hidden">
        {/* Active Rooms - Left Column */}
        <div className="flex-[1.3] flex flex-col bg-black/20 rounded-xl p-2 border border-white/5 overflow-hidden">
          <div className="flex justify-between items-center mb-1.5 px-1">
            <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">Arenas</span>
            <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1">
            {activeGames.map(game => {
              const isJoined = activeRoomIds.includes(game.id);
              return (
                <div 
                  key={game.id} 
                  onClick={() => !isJoined && selectedNumber && onStartGame(selectedNumber, game.stake, game.id)}
                  className={`bg-white/5 rounded-lg p-1.5 flex justify-between items-center border transition-all cursor-pointer active:scale-95
                    ${isJoined ? 'opacity-30 cursor-not-allowed' : 
                      selectedNumber ? 'border-white/5 hover:border-orange-500/30 hover:bg-white/10' : 'border-white/5 opacity-60'}`}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 bg-orange-500/10 rounded flex items-center justify-center border border-orange-500/10 shrink-0">
                      <span className="text-orange-500 font-black text-[8px]">{game.id}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-[8px] font-black text-white leading-none">10 ETB</div>
                      <div className="text-[6px] text-white/30 font-bold uppercase truncate">{game.players}P</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {isJoined ? (
                      <span className="text-[6px] font-black text-green-400">OK</span>
                    ) : (
                      <div className="text-[9px] font-black text-orange-500 leading-none">:{game.timer < 10 ? `0${game.timer}` : game.timer}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Preview - Right Column */}
        <div className="flex-1 flex flex-col bg-zinc-900/40 p-2 rounded-xl border border-white/5 overflow-hidden">
          <div className="text-[7px] text-white/30 font-black uppercase mb-1.5 flex justify-between w-full px-1">
            <span>{selectedNumber ? `#${selectedNumber}` : '---'}</span>
            <span className="text-orange-500">Card</span>
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            {selectedNumber && previewMatrix ? (
              <div className="grid grid-cols-5 gap-0.5 w-full">
                {previewMatrix.map((row, rIdx) => row.map((cell, cIdx) => (
                  <div key={`${rIdx}-${cIdx}`} className={`aspect-square flex items-center justify-center text-[7px] font-black rounded-[2px] border ${cell === '*' ? 'bg-orange-500 border-white/10 text-white' : 'bg-white/5 border-white/5 text-white/40'}`}>
                    {cell === '*' ? '★' : cell}
                  </div>
                )))}
              </div>
            ) : (
              <div className="text-center opacity-10 px-2">
                <i className="fas fa-hand-pointer text-base mb-0.5"></i>
                <p className="text-[6px] font-black uppercase tracking-tighter">Pick No.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Info Bar - Minimal */}
      <div className="h-5 flex items-center justify-center bg-orange-500/5 rounded-lg border border-orange-500/10 mb-1 shrink-0">
        <p className="text-orange-500/60 text-[6px] font-black uppercase tracking-[0.2em] animate-pulse">
          {selectedNumber ? 'SELECT ARENA TO JOIN' : 'SELECT BOARD NUMBER ABOVE'}
        </p>
      </div>
    </div>
  );
};

export default Lobby;