import { Server } from 'socket.io';

let socketIoImageObject: Server;

export class SocketIoImageHandler {
  public listen(io: Server): void {
    socketIoImageObject = io;
  }
}

export { socketIoImageObject };