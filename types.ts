
export enum View {
  LOBBY = 'GAME',
  SCORES = 'SCORES',
  HISTORY = 'HISTORY',
  WALLET = 'WALLET',
  PROFILE = 'PROFILE',
  ACTIVE_GAME = 'ACTIVE_GAME',
  ADMIN = 'ADMIN'
}

export interface Player {
  id: string;
  name: -string;
  selectedNumbers: number[];
}

export interface BingoSquare {
  number: number | 'FREE';
  isMarked: boolean;
}

export interface GameState {
  id: string;
  status: 'waiting' | 'running' | 'finished';
  countdown: number;
  calledNumbers: number[];
  stake: number;
  playersCount: number;
}
