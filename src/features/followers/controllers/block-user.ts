import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { FollowersCache } from '@services/redis/followers.cache';
import { blockUserQueue } from '@services/queues/blockuser.queue';

const followersCache: FollowersCache = new FollowersCache();

export class User {
  public async block(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;

    User.prototype.updateBlockedUser(followerId, `${req.currentUser?.userId}`, 'block');
    blockUserQueue.addBlockUserJob('addBlockedUsersToDB', {
      keyOne: `${req.currentUser?.userId}`,
      keyTwo: `${followerId}`,
      type: 'block'
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Blocked user successfully' });
  }

  public async unblock(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;

    User.prototype.updateBlockedUser(followerId, `${req.currentUser?.userId}`, 'unblock');
    blockUserQueue.addBlockUserJob('removeBlockedUsersFromDB', {
      keyOne: `${req.currentUser?.userId}`,
      keyTwo: `${followerId}`,
      type: 'unblock'
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Unblocked user successfully' });
  }

  private async updateBlockedUser(
    followerId: string,
    userId: string,
    type: 'block' | 'unblock'
  ): Promise<void> {
    const blocked: Promise<void> = followersCache.updateBlockedUserPropInCache(
      `${userId}`,
      'blocked',
      `${followerId}`,
      type
    );
    const blockedBy: Promise<void> = followersCache.updateBlockedUserPropInCache(
      `${followerId}`,
      'blockedBy',
      `${userId}`,
      type
    );

    await Promise.all([blocked, blockedBy]);
  }
}
