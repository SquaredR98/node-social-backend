import { Server, Socket } from 'socket.io';
import { IMessageData } from '@chat/interfaces/chat.interface';

export let socketIOChatObject: Server;


export class SocketIoChatHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOChatObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('join room', (data: IMessageData) => {
        console.log(data);
      });
    });
  }
}