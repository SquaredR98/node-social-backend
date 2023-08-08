import { Server, Socket } from 'socket.io';
import { IFollowers } from '@followers/interfaces/follower.interface';

export let socketIOFollowerObject: Server;


export class SocketIoFollowerHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOFollowerObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('unfollow user', (data: IFollowers) => {
        this.io.emit('remove follower', data);
      });
    });
  }
}