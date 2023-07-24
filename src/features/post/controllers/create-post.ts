import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { postSchema, postWithImageSchema } from '@post/schemes/post.schemes';
import { ObjectId } from 'mongodb';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostCache } from '@services/redis/post.cache';
import { postQueue } from '@services/queues/post.queue';
import { UploadApiResponse } from 'cloudinary';
import { upload } from '@globals/helpers/cloudinary-upload';
import { BadRequestError } from '@globals/helpers/error-handler';

const postCache: PostCache = new PostCache();

export class Create {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings } = req.body;

    const postObjectId: ObjectId = new ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      gifUrl,
      privacy,
      commentsCount: 0,
      imgVersion: '',
      imgId: '',
      createdAt: new Date(),
      reactions: {
        like: 0,
        love: 0,
        haha: 0,
        sad: 0,
        wow: 0,
        angry: 0
      }
    } as IPostDocument;

    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`,
      createdPost
    });

    postQueue.addPostJob('addPostToDB', {
      key: req.currentUser?.userId,
      value: createdPost
    });

    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully' });
  }

  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } = req.body;

    const result: UploadApiResponse = (await upload(image)) as UploadApiResponse;

    if (!result?.public_id) throw new BadRequestError(result.message);

    const postObjectId: ObjectId = new ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      feelings,
      gifUrl,
      privacy,
      commentsCount: 0,
      imgVersion: result.version.toString(),
      imgId: result.public_id,
      createdAt: new Date(),
      reactions: {
        like: 0,
        love: 0,
        haha: 0,
        sad: 0,
        wow: 0,
        angry: 0
      }
    } as IPostDocument;

    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser!.userId}`,
      uId: `${req.currentUser!.uId}`,
      createdPost
    });

    postQueue.addPostJob('addPostToDB', {
      key: req.currentUser?.userId,
      value: createdPost
    });

    // Call image queue to add to mongodb

    res.status(HTTP_STATUS.CREATED).json({ message: 'Post created successfully' });
  }
}
