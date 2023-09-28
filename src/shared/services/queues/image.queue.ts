import { BaseQueue } from '@services/queues/base.queue';
import { imageWorker } from '../../workers/image.worker';
import { IFileImageJobData } from '@images/interfaces/image.interface';

class ImageQueue extends BaseQueue {
  constructor() {
    super('images');
    this.processJob('addImageToDB', 5, imageWorker.addImageToDB);
    this.processJob('removeImageFromDB', 5, imageWorker.removeImageFromDB);
    this.processJob('addUserProfileImageToDB', 5, imageWorker.addUserProfileImageToDB);
    this.processJob('updateBackgroundImageInDB', 5, imageWorker.updateBackgroundImageInDB);
  }

  public addImageJob (name: string, data: IFileImageJobData): void {
    this.addJob(name, data);
  }
}

export const imageQueue: ImageQueue = new ImageQueue();