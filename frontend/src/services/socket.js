import { io } from 'socket.io-client';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

let _socket = null;

export function getSocket() {
  if (!_socket) {
    _socket = io(BACKEND_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return _socket;
}

export function connectSocket(boardId = 'board-1') {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
    socket.emit('join_board', { boardId });
  }
  return socket;
}

export function disconnectSocket() {
  if (_socket && _socket.connected) {
    _socket.disconnect();
  }
}
