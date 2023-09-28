import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { socketIoImageObject } from '@sockets/image';
import { UserCache } from '@services/redis/user.cache';
import { imageQueue } from '@services/queues/image.queue';
import { imageService } from '@services/db/image.service';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IFileImageDocument } from '@images/interfaces/image.interface';

const userCache: UserCache = new UserCache();

export class Delete {
  public async image(req: Request, res: Response): Promise<void> {
    const { imageId } = req.params;
    socketIoImageObject.emit('delete image', { imageId });

    imageQueue.addImageJob('removeImageFromDB', { imageId });

    res
      .status(HTTP_STATUS.OK)
      .json({ message: 'Resource deleted successfully' });
  }

  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const image: IFileImageDocument = await imageService.getImageByBackgroundId(
      req.params.bgImageId
    );

    socketIoImageObject.emit('delete image', image._id);

    const bgImageId: Promise<IUserDocument | null> =
      userCache.updateSingleUserItemInCache(
        `${req.currentUser?.userId}`,
        'bgImageId',
        ''
      );
    const bgImageVersion: Promise<IUserDocument | null> =
      userCache.updateSingleUserItemInCache(
        `${req.currentUser?.userId}`,
        'bgImageVersion',
        ''
      );

    const response: [IUserDocument | null, IUserDocument | null] =
      await Promise.all([bgImageId, bgImageVersion]);

    imageQueue.addImageJob('removeImageFromDB', {
      imageId: image?._id
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Resource deleted successfully' });
  }
}
