import { io } from 'socket.io-client';

// Use localhost for testing
const URL = 'http://localhost:3001'; 

export const socket = io(URL, {
  autoConnect: false
});