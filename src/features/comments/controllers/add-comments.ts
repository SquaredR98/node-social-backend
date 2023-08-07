import { Request, Response } from 'express';
import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { addCommentSchema } from '@comments/schemes/comment';
import HTTP_STATUS from 'http-status-codes';
import { ObjectId } from 'mongodb';
import { ICommentDocument, ICommentJob } from '../interfaces/comment.interface';
import { CommentsCache } from '@services/redis/comments.cache';
import { commentsQueue } from '../../../shared/services/queues/comments.queue';

const commentCache: CommentsCache = new CommentsCache();


export class Add {
  @joiValidation(addCommentSchema)
  public async comment(req: Request, res: Response): Promise<void> {
    const { userTo, postId, profilePicture, comment,  } = req.body;
    const commentObjectId: ObjectId = new ObjectId();
    const commentsData: ICommentDocument = { 
      _id: commentObjectId,
      postId,
      username: `${req.currentUser?.username}`,
      avatarColor: `${req.currentUser?.avatarColor}`,
      profilePicture,
      comment,
      createdAt: new Date()
    } as ICommentDocument;

    await commentCache.savePostCommentToCache(postId, JSON.stringify(commentsData));

    const databaseCommentData: ICommentJob = {
      postId,
      userTo,
      userFrom: `${req.currentUser?.userId}`,
      username: `${req.currentUser?.username}`,
      comment: commentsData
    };

    commentsQueue.addCommentsJob('addCommentToDB', databaseCommentData);

    res.status(HTTP_STATUS.OK).json({ message: 'Comment created successfully' });
  }
}