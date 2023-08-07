import HTTP_STATUS from 'http-status-codes';
import { CommentsCache } from '@services/redis/comments.cache';
import { Request, Response } from 'express';
import { ICommentDocument, ICommentNameList } from '../interfaces/comment.interface';
import { commentService } from '../../../shared/services/db/comments.service';
import mongoose from 'mongoose';

const commentCache: CommentsCache = new CommentsCache();

export class Get {
  public async comments(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedComments: ICommentDocument[] = await commentCache.getCommentsFromCache(postId);
    const comments: ICommentDocument[] = cachedComments.length
      ? cachedComments
      : await commentService.getPostComments(
          { postId: new mongoose.Types.ObjectId(postId) },
          { createdAt: -1 }
        );

    res.status(HTTP_STATUS.OK).json({ message: 'Comments fetched successfully', commentsData: comments });
  }

  public async commentNames(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedCommentNames: ICommentNameList[] = await commentCache.getCommentsNameFromCache(postId);
    const commentNames: ICommentNameList[] = cachedCommentNames.length
      ? cachedCommentNames
      : await commentService.getPostCommentNames(
          { postId: new mongoose.Types.ObjectId(postId) },
          { createdAt: -1 }
        );

    res.status(HTTP_STATUS.OK).json({ message: 'Comment names fetched successfully', commentNames: commentNames[0] });
  }

  public async singleComment(req: Request, res: Response): Promise<void> {
    const { postId, commentId } = req.params;
    const cachedSingleComment: ICommentDocument[] = await commentCache.getSingleCommentFromCache(postId, commentId);
    const singleComment: ICommentDocument[] = cachedSingleComment.length
      ? cachedSingleComment
      : await commentService.getPostComments(
          { _id: new mongoose.Types.ObjectId(commentId) },
          { createdAt: -1 }
        );

    res.status(HTTP_STATUS.OK).json({ message: 'Comment fetched successfully', singleComment: singleComment[0] });
  }
}
