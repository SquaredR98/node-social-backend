import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { UploadApiResponse } from 'cloudinary';

import { config } from '@root/config';
import { Helpers } from '@globals/helpers/helpers';
import { socketIoImageObject } from '@sockets/image';
import { UserCache } from '@services/redis/user.cache';
import { imageQueue } from '@services/queues/image.queue';
import { upload } from '@globals/helpers/cloudinary-upload';
import { addImageSchema } from '@images/schemes/image.scheme';
import { IUserDocument } from '@user/interfaces/user.interface';
import { BadRequestError } from '@globals/helpers/error-handler';
import { IBgUploadResponse } from '@images/interfaces/image.interface';
import { joiValidation } from '@globals/decorators/joi-validation.decorator';

const userCache: UserCache = new UserCache();

export class Add {
  @joiValidation(addImageSchema)
  public async profileImage(req: Request, res: Response): Promise<void> {
    const { image } = req.body;
    const userId = req.currentUser?.userId;

    const { public_id, version }: UploadApiResponse = (await upload(
      image,
      userId,
      true,
      true
    )) as UploadApiResponse;

    if (!public_id) {
      throw new BadRequestError(
        'File Upload: Something went wrong. Please try again'
      );
    }

    const imageUrl = `https://res.cloudinary.com/${config.NODE_ENV === 'production' ? config.CLOUD_NAME : config.DEV_CLOUD_NAME}/image/upload/v${version}/${public_id}`;

    const cachedUser: IUserDocument | null =
      await userCache.updateSingleUserItemInCache(
        `${userId}`,
        'profilePicture',
        imageUrl
      );

    socketIoImageObject.emit('update user', cachedUser);

    imageQueue.addImageJob('addUserProfileImageToDB', {
      key: `${userId}`,
      value: imageUrl,
      imgId: public_id,
      imgVersion: version.toString()
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Image uploaded successfully' });
  }

  @joiValidation(addImageSchema)
  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const { image } = req.body;
    const userId = req.currentUser?.userId;

    const { publicId, version }: IBgUploadResponse =
      await Add.prototype.backgroundUpload(image);

    const bgImageId: Promise<IUserDocument> =
      userCache.updateSingleUserItemInCache(
        `${userId}`,
        'bgImageId',
        publicId
      ) as Promise<IUserDocument>;

    const bgImageVersion: Promise<IUserDocument> =
      userCache.updateSingleUserItemInCache(
        `${userId}`,
        'bgImageVersion',
        version
      ) as Promise<IUserDocument>;

    const response: [IUserDocument, IUserDocument] = await Promise.all([
      bgImageId,
      bgImageVersion
    ]);

    socketIoImageObject.emit('update user', {
      bgImageId: publicId,
      bgImageVersion: version,
      userId: response[0]
    });

    imageQueue.addImageJob('updateBackgroundImageInDB', {
      key: `${userId}`,
      imgId: publicId,
      imgVersion: version.toString()
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Image uploaded successfully' });
  }

  private async backgroundUpload(image: string): Promise<IBgUploadResponse> {
    const isDataUrl = Helpers.isDataURL(image);
    let imgVersion = '';
    let publicId = '';

    if (isDataUrl) {
      const { public_id, version, message }: UploadApiResponse = (await upload(
        image
      )) as UploadApiResponse;

      if (!public_id) {
        throw new BadRequestError(message);
      } else {
        imgVersion = `${version}`;
        publicId = public_id;
      }
    } else {
      const value = image.split('/');
      imgVersion = value[value.length - 2];
      publicId = value[value.length - 1];
    }

    return { version: imgVersion.replace(/v/g, ''), publicId };
  }
}
