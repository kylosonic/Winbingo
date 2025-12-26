import React, { useState, useEffect, useMemo } from 'react';
import { generateFairBoard, checkBingoWin } from '../utils';
import { socket } from '../socket';

interface GameRoomProps {
  onLeave: () => void;
  boardNumber: number;
  stake: number;
  balance: number;
  roomId: string;
}

const GameRoom: React.FC<GameRoomProps> = ({ onLeave, boardNumber, roomId }) => {
  const [currentCall, setCurrentCall] = useState<number | null>(null);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [markedNumbers, setMarkedNumbers] = useState<any[]>(['*']);
  const [gameStatus, setGameStatus] = useState<'WAITING' | 'PLAYING' | 'ENDED'>('WAITING');

  const cardMatrix = useMemo(() => generateFairBoard(boardNumber), [boardNumber]);

  useEffect(() => {
    socket.on('game_start', () => setGameStatus('PLAYING'));
    
    socket.on('number_called', (num: number) => {
        setCurrentCall(num);
        setCalledNumbers(prev => [...prev, num]);
    });

    socket.on('game_over', (data: any) => {
        setGameStatus('ENDED');
        if(data.winner) {
            alert(`🏆 WINNER: ${data.winner}\nPrize: ${data.amount} ETB`);
        } else {
            alert("Game Over! No Winner.");
        }
        setTimeout(onLeave, 3000);
    });

    return () => { 
        socket.off('game_start'); 
        socket.off('number_called'); 
        socket.off('game_over'); 
    };
  }, []);

  const handleMark = (num: number | string) => {
    if (gameStatus !== 'PLAYING' || num === '*') return;
    // Allow marking only if called (Strict Mode)
    if (calledNumbers.includes(num as number)) {
      setMarkedNumbers(prev => prev.includes(num) ? prev : [...prev, num]);
    }
  };

  const handleBingo = () => {
    const win = checkBingoWin(cardMatrix, markedNumbers);
    if (win) {
        socket.emit('bingo_claim', { roomId });
    } else {
        alert("Invalid Bingo! Keep playing.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1b23] p-2">
      <div className="bg-white/5 rounded-xl p-3 mb-4 text-center border border-white/5">
        <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Current Call</div>
        <div className="text-4xl font-black text-orange-500">{currentCall || '--'}</div>
        <div className="flex justify-center gap-1 mt-2">
           {calledNumbers.slice(-5).reverse().map((n, i) => (
               <span key={i} className="text-[8px] text-white/30 bg-white/5 px-1 rounded">{n}</span>
           ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
         <div className="grid grid-cols-5 gap-1 w-full max-w-[250px]">
            {cardMatrix.map((row, r) => row.map((val, c) => (
                <button
                    key={`${r}-${c}`}
                    onClick={() => handleMark(val)}
                    className={`aspect-square rounded flex items-center justify-center font-black text-sm transition-all
                        ${markedNumbers.includes(val) ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-white/50'}`}
                >
                    {val === '*' ? '★' : val}
                </button>
            )))}
         </div>
      </div>

      <button 
        onClick={handleBingo}
        disabled={gameStatus !== 'PLAYING'}
        className="w-full py-4 bg-orange-500 text-white font-black text-xl rounded-xl mt-4 disabled:opacity-50"
      >
        BINGO!
      </button>
    </div>
  );
};
export default GameRoom;