import HTTP_STATUS from 'http-status-codes';
import { PostCache } from '@services/redis/post.cache';
import { Request, Response } from 'express';
import { socketIOPostObject } from '@sockets/post';
import { postQueue } from '@services/queues/post.queue';
import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { postSchema, postWithImageSchema } from '@post/schemes/post.schemes';
import { IPostDocument } from '@post/interfaces/post.interface';
import { UploadApiResponse } from 'cloudinary';
import { upload } from '../../../shared/globals/helpers/cloudinary-upload';
import { extend } from 'lodash';
import { BadRequestError } from '../../../shared/globals/helpers/error-handler';

const postCache: PostCache = new PostCache();

export class Update {
  @joiValidation(postSchema)
  public async post(req: Request, res: Response): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture } =
      req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      profilePicture
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', {
      key: postId,
      value: updatedPost
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
  }

  @joiValidation(postWithImageSchema)
  public async postWithImage(req: Request, res: Response): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture, image } =
      req.body;
    const { postId } = req.params;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      profilePicture
    } as IPostDocument;

    if (imgId && imgVersion) {
      await Update.prototype.updatePostWithImage(postId, updatedPost);
    } else {
      const result: UploadApiResponse = await Update.prototype.addImageToExistingPost(
        postId,
        extend(updatedPost, image)
      );

      if (!result?.public_id) throw new BadRequestError(result.message);
    }

    res.status(HTTP_STATUS.OK).json({ message: 'Post updated successfully' });
  }

  private async updatePostWithImage(postId: string, data: IPostDocument): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture } = data;
    const updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      profilePicture
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    socketIOPostObject.emit('update post', postUpdated, 'posts');
    postQueue.addPostJob('updatePostInDB', {
      key: postId,
      value: updatedPost
    });
  }

  private async addImageToExistingPost(
    postId: string,
    data: IPostDocument & { image: string }
  ): Promise<UploadApiResponse> {
    const { post, bgColor, feelings, privacy, gifUrl, profilePicture, image } = data;

    const result: UploadApiResponse = (await upload(image)) as UploadApiResponse;

    if (!result?.public_id) {
      return result;
    }

    const updatedPost: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion: result?.version?.toString(),
      imgId: result?.public_id,
      profilePicture
    } as IPostDocument;

    const postUpdated: IPostDocument = await postCache.updatePostInCache(postId, updatedPost);
    console.log(postUpdated);
    socketIOPostObject.emit('update post', postUpdated, 'posts');

    postQueue.addPostJob('updatePostInDB', {
      key: postId,
      value: updatedPost
    });

    return result;
  }
}
