import { Server, Socket } from 'socket.io';

let socketIoPostObject: Server;


export class SocketIoPostHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIoPostObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      console.log('Socket IO Connection');
      return socket;
    });
  }
}