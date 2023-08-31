import { Server, Socket } from 'socket.io';
import { IReactionDocument } from '@reactions/interfaces/reaction.interface';
import { ICommentDocument } from '@comments/interfaces/comment.interface';

export let socketIOPostObject: Server;


export class SocketIoPostHandler {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
    socketIOPostObject = io;
  }

  public listen(): void {
    this.io.on('connection', (socket: Socket) => {
      socket.on('reaction', (reaction: IReactionDocument) => {
        this.io.emit('update like', reaction);
      });
      socket.on('comment', (comment: ICommentDocument) => {
        this.io.emit('update comment', comment);
      });
    });
  }
}