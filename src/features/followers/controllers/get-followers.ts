import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { FollowersCache } from '@services/redis/followers.cache';
import { IFollowerData } from '@followers/interfaces/follower.interface';
import { followerService } from '@services/db/follower.service';

const followerCache: FollowersCache = new FollowersCache();

export class Get {
  public async userFollowing(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.currentUser!.userId);
    const cachedFollowees: IFollowerData[] = await followerCache.fetchFollowersFromCache(
      `following:${req.currentUser!.userId}`
    );
    const following: IFollowerData[] = cachedFollowees.length
      ? cachedFollowees
      : await followerService.getFolloweeData(userObjectId);
      
    res.status(HTTP_STATUS.OK).json({ message: 'Fetched users following', following });
  }

  public async userFollowers(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.params!.userId);
    const cachedFollowers: IFollowerData[] = await followerCache.fetchFollowersFromCache(
      `followers:${req.params!.userId}`
    );
    const followers: IFollowerData[] = cachedFollowers.length
      ? cachedFollowers
      : await followerService.getFollowerData(userObjectId);
      
    res.status(HTTP_STATUS.OK).json({ message: 'Fetched users followers', followers });
  }

}
