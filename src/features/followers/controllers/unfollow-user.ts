import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { followerQueue } from '@services/queues/follower.queue';
import { FollowersCache } from '@services/redis/followers.cache';

const followersCache: FollowersCache = new FollowersCache();

export class Remove {
  public async follower(req: Request, res: Response): Promise<void> {
    const { followeeId, followerId } = req.params;

    const removeFollowerFromCache: Promise<void> = followersCache.removeFollowerFromCache(`following:${req.currentUser?.userId}`, followeeId);
    const removeFolloweeFromCache: Promise<void> = followersCache.removeFollowerFromCache(`followers:${followeeId}`, followerId);

    const followersCount: Promise<void> = followersCache.updateFollowersCountInCache(`${followeeId}`, 'followersCount', -1);
    const followeesCount: Promise<void> = followersCache.updateFollowersCountInCache(`${followerId}`, 'followingCount', -1);

    await Promise.all([removeFollowerFromCache, removeFolloweeFromCache, followersCount, followeesCount]);

    followerQueue.addFollowerJob('removeFollowerFromDB', {
      keyOne: `${followeeId}`,
      keyTwo: `${followerId}`,
    }),

    res.status(HTTP_STATUS.OK).json({ message: 'Unfollowed user now'});
  }
}