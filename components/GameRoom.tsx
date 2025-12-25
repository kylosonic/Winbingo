import React, { useState, useEffect, useMemo } from 'react';
import { generateFairBoard, checkBingoWin } from '../utils';

interface GameRoomProps {
  onLeave: () => void;
  boardNumber: number;
  stake: number;
  balance: number;
  setBalance: (bal: number) => void;
  roomId: string;
}

const GameRoom: React.FC<GameRoomProps> = ({ onLeave, boardNumber, stake, balance, setBalance, roomId }) => {
  const [countdown, setCountdown] = useState(30); 
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [currentCall, setCurrentCall] = useState<number | null>(null);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [markedNumbers, setMarkedNumbers] = useState<number[]>(['*' as any]);
  const [gameEnded, setGameEnded] = useState(false);
  const [winInfo, setWinInfo] = useState<{type: string, index: number} | null>(null);

  const HOUSE_CUT = 0.20;
  const ESTIMATED_PLAYERS = 25; 
  const DERASH = (stake * ESTIMATED_PLAYERS) * (1 - HOUSE_CUT);

  const cardMatrix = useMemo(() => generateFairBoard(boardNumber), [boardNumber]);

  useEffect(() => {
    if (countdown > 0 && !isGameRunning) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isGameRunning) {
      setIsGameRunning(true);
    }
  }, [countdown, isGameRunning]);

  useEffect(() => {
    if (isGameRunning && !gameEnded) {
      const interval = setInterval(() => {
        if (calledNumbers.length >= 75) {
          clearInterval(interval);
          setGameEnded(true);
          return;
        }
        let nextNum: number;
        do {
          nextNum = Math.floor(Math.random() * 75) + 1;
        } while (calledNumbers.includes(nextNum));

        setCurrentCall(nextNum);
        setCalledNumbers(prev => [...prev, nextNum]);
      }, 5000); 
      return () => clearInterval(interval);
    }
  }, [isGameRunning, calledNumbers, gameEnded]);

  const handleMark = (num: number | string) => {
    if (!isGameRunning || gameEnded || num === '*') return;
    if (calledNumbers.includes(num as number)) {
      setMarkedNumbers(prev => prev.includes(num as any) ? prev : [...prev, num as any]);
    }
  };

  const handleBingoClick = () => {
    const win = checkBingoWin(cardMatrix, markedNumbers);
    if (win) {
      setBalance(balance + DERASH);
      setWinInfo(win);
      setGameEnded(true);
    } else {
      alert("No valid Bingo pattern detected!");
    }
  };

  const leftBoardCols = [
    { letter: 'B', accent: 'border-amber-500', range: [1, 15] },
    { letter: 'I', accent: 'border-blue-500', range: [16, 30] },
    { letter: 'N', accent: 'border-purple-500', range: [31, 45] },
    { letter: 'G', accent: 'border-red-500', range: [46, 60] },
    { letter: 'O', accent: 'border-green-500', range: [61, 75] },
  ];

  const isWinPatternCell = (rIdx: number, cIdx: number) => {
    if (!winInfo) return false;
    if (winInfo.type === 'ROW' && winInfo.index === rIdx) return true;
    if (winInfo.type === 'COL' && winInfo.index === cIdx) return true;
    if (winInfo.type === 'DIAG' && winInfo.index === 1 && rIdx === cIdx) return true;
    if (winInfo.type === 'DIAG' && winInfo.index === 2 && rIdx === 4 - cIdx) return true;
    if (winInfo.type === 'CORNER' && (
      (rIdx === 0 && cIdx === 0) || (rIdx === 0 && cIdx === 4) || 
      (rIdx === 4 && cIdx === 0) || (rIdx === 4 && cIdx === 4)
    )) return true;
    return false;
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1b23] overflow-hidden animate-fadeIn">
      {/* Header Taskbar */}
      <div className="grid grid-cols-6 gap-0.5 px-2 py-2 text-[7px] font-black text-white/40 border-b border-white/5 bg-black/10">
        <div className="bg-white/5 p-1.5 rounded-lg text-center border border-white/5">
          <span className="text-orange-500 uppercase block text-[5px] mb-0.5 tracking-widest">ARENA</span>
          <span className="truncate text-white font-black">{roomId}</span>
        </div>
        <div className="bg-white/5 p-1.5 rounded-lg text-center border border-white/5">
          <span className="text-orange-500 uppercase block text-[5px] mb-0.5 tracking-widest">POT</span>
          <span className="text-white font-black">{DERASH.toFixed(0)}</span>
        </div>
        <div className="bg-white/5 p-1.5 rounded-lg text-center border border-white/5">
          <span className="text-orange-500 uppercase block text-[5px] mb-0.5 tracking-widest">USERS</span>
          <span className="text-white font-black">{ESTIMATED_PLAYERS}</span>
        </div>
        <div className="bg-white/5 p-1.5 rounded-lg text-center border border-white/5">
          <span className="text-orange-500 uppercase block text-[5px] mb-0.5 tracking-widest">CARD</span>
          <span className="text-white font-black">#{boardNumber}</span>
        </div>
        <div className="bg-white/5 p-1.5 rounded-lg text-center border border-white/5">
          <span className="text-orange-500 uppercase block text-[5px] mb-0.5 tracking-widest">BALLS</span>
          <span className="text-white font-black">{calledNumbers.length}</span>
        </div>
        <div className="bg-white/5 p-1.5 rounded-lg text-center border border-white/5 flex flex-col items-center justify-center">
          <span className="text-green-500 uppercase block text-[5px] mb-0.5 tracking-widest">SSL</span>
          <i className="fas fa-shield-check text-green-500 text-[7px]"></i>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden px-2 pt-2 gap-2">
        {/* Caller Board - Wider and Optimized for No-Scroll */}
        <div className="w-[160px] flex flex-col bg-black/30 rounded-xl overflow-hidden border border-white/5 p-1 shrink-0">
          <div className="grid grid-cols-5 gap-0.5 mb-1 bg-white/5 rounded-t-lg">
            {leftBoardCols.map(col => (
              <div key={col.letter} className={`text-white text-[8px] font-black text-center py-1.5 rounded-sm border-b-2 ${col.accent}`}>
                {col.letter}
              </div>
            ))}
          </div>
          <div className="flex-1 min-h-0">
             <div className="grid grid-cols-5 gap-0.5 h-full">
               {Array.from({length: 15}).map((_, rowIndex) => (
                 leftBoardCols.map((col, colIdx) => {
                   const num = col.range[0] + rowIndex;
                   const isCalled = calledNumbers.includes(num);
                   return (
                     <div key={`${colIdx}-${rowIndex}`} className={`
                       text-center text-[9px] font-black flex items-center justify-center rounded transition-all h-full min-h-[16px]
                       ${isCalled ? 'bg-orange-500 text-white shadow-sm scale-95' : 'text-white/10'}
                     `}>
                       {num}
                     </div>
                   );
                 })
               ))}
             </div>
          </div>
        </div>

        {/* Main Interaction Area */}
        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
          {!isGameRunning ? (
            <div className="bg-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center h-[100px] border border-white/5 shrink-0">
              <div className="text-3xl font-black text-orange-500 mb-0.5 leading-none">{countdown}</div>
              <p className="text-[7px] font-black text-white/30 uppercase tracking-widest">Awaiting Players</p>
              <div className="w-full h-1 bg-white/5 rounded-full mt-3 overflow-hidden max-w-[80px]">
                <div 
                  className="h-full bg-orange-500 transition-all duration-1000" 
                  style={{ width: `${(countdown/30)*100}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 rounded-2xl p-2.5 flex flex-col items-center relative border border-white/10 shadow-lg shrink-0">
              <span className="text-orange-500/50 text-[6px] font-black absolute top-1 left-3 uppercase tracking-widest">Call</span>
              <div className="w-11 h-11 bg-zinc-900 rounded-full flex items-center justify-center text-white font-black text-xl shadow-xl border border-orange-500/30 mt-0.5">
                {currentCall || '--'}
              </div>
              <div className="mt-1.5 flex gap-1">
                 {calledNumbers.slice(-3).reverse().map((n, i) => (
                   <div key={i} className={`w-4 h-4 rounded-sm bg-white/5 flex items-center justify-center text-[7px] text-white/20 font-black border border-white/5 ${i === 0 ? 'opacity-0' : 'opacity-100'}`}>
                     {n}
                   </div>
                 ))}
              </div>
            </div>
          )}

          {/* Player Card - More Compact */}
          <div className="bg-black/20 rounded-2xl p-3 shadow-2xl border border-white/5 flex flex-col items-center justify-center flex-1 min-h-0 overflow-hidden">
             <div className="grid grid-cols-5 gap-1 mb-1.5 w-full max-w-[180px]">
               {['B','I','N','G','O'].map(l => (
                 <div key={l} className="text-white/20 text-[8px] font-black text-center">{l}</div>
               ))}
             </div>
             <div className="grid grid-cols-5 gap-1 w-full max-w-[180px] aspect-square">
                {cardMatrix.map((row, rIdx) => (
                  row.map((val, cIdx) => {
                    const isMarked = markedNumbers.includes(val as any);
                    const isWinningCell = isWinPatternCell(rIdx, cIdx);

                    return (
                      <button
                        key={`${cIdx}-${rIdx}`}
                        onClick={() => handleMark(val)}
                        disabled={val === '*' || gameEnded}
                        className={`
                          aspect-square flex items-center justify-center rounded-lg font-black text-sm transition-all
                          ${val === '*' ? 'bg-orange-600 text-white' : 
                            isWinningCell ? 'bg-yellow-400 text-black animate-pulse shadow-lg z-10' :
                            isMarked ? 'bg-orange-500 text-white shadow-md' : 
                            'bg-zinc-800 text-white/70 border border-white/5 hover:bg-zinc-700'}
                          active:scale-90
                        `}
                      >
                        {val === '*' ? '★' : val}
                      </button>
                    );
                  })
                ))}
             </div>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-2 shrink-0 bg-black/5 border-t border-white/5">
        <button 
          onClick={handleBingoClick}
          disabled={gameEnded || !isGameRunning}
          className={`
            w-full py-3.5 rounded-xl font-black text-lg shadow-xl transition-all transform active:scale-95 uppercase tracking-tighter
            ${gameEnded || !isGameRunning ? 'bg-zinc-800 text-white/5 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600 ring-2 ring-orange-500/20'}
          `}
        >
          BINGO
        </button>
        <button onClick={onLeave} className="w-full py-1 text-white/10 font-black text-[6px] uppercase tracking-widest hover:text-white/30 transition-colors">
          {gameEnded ? 'Close Arena' : 'Terminate Session'}
        </button>
      </div>

      {gameEnded && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#1f2029] rounded-[2rem] p-5 text-center shadow-2xl max-w-[280px] w-full animate-fadeIn border border-white/10">
            {winInfo ? (
              <>
                <div className="w-12 h-12 bg-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center shadow-2xl">
                  <i className="fas fa-trophy text-white text-xl"></i>
                </div>
                <h2 className="text-xl font-black text-white mb-0.5 tracking-tight uppercase">JACKPOT!</h2>
                <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-3">Awarded {DERASH.toFixed(0)} ETB</p>
                
                <div className="bg-black/50 p-3 rounded-2xl border border-white/5 mb-4">
                   <p className="text-[6px] font-black text-white/20 uppercase mb-2 tracking-widest">Verification Result</p>
                   <div className="grid grid-cols-5 gap-0.5 mx-auto max-w-[100px]">
                      {cardMatrix.map((row, rIdx) => row.map((val, cIdx) => {
                         const isPattern = isWinPatternCell(rIdx, cIdx);
                         return (
                           <div key={`${rIdx}-${cIdx}`} className={`aspect-square rounded-[1px] flex items-center justify-center text-[6px] font-black ${
                             isPattern ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/10'
                           }`}>
                             {val === '*' ? '★' : val}
                           </div>
                         );
                      }))}
                   </div>
                   <p className="text-[7px] text-yellow-400 font-black uppercase mt-2 tracking-widest">
                     Pattern: {winInfo.type}
                   </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-zinc-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <i className="fas fa-times text-white/20 text-xl"></i>
                </div>
                <h2 className="text-xl font-black text-white mb-4 uppercase tracking-tight">Arena Over</h2>
                <div className="bg-black/50 p-3 rounded-2xl border border-white/5 mb-4">
                   <div className="grid grid-cols-5 gap-0.5 mx-auto max-w-[100px]">
                      {cardMatrix.map((row, rIdx) => row.map((val, cIdx) => (
                        <div key={`${rIdx}-${cIdx}`} className={`aspect-square rounded-[1px] flex items-center justify-center text-[6px] font-black ${markedNumbers.includes(val as any) ? 'bg-white/10 text-white/30' : 'bg-white/5 text-white/10'}`}>
                           {val === '*' ? '★' : val}
                        </div>
                      )))}
                   </div>
                </div>
              </>
            )}
            <button onClick={onLeave} className="w-full py-3.5 bg-orange-500 text-white rounded-xl font-black shadow-lg uppercase transition-all active:scale-95 tracking-widest text-[8px]">
              Leave Room
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameRoom;