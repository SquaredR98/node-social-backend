import mongoose from 'mongoose';
import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import HTTP_STATUS from 'http-status-codes';

import { UserCache } from '@services/redis/user.cache';
import { socketIOFollowerObject } from '@sockets/followers';
import { followerQueue } from '@services/queues/follower.queue';
import { IUserDocument } from '@user/interfaces/user.interface';
import { FollowersCache } from '@services/redis/followers.cache';
import { IFollowerData } from '@followers/interfaces/follower.interface';

const followersCache: FollowersCache = new FollowersCache();
const userCache: UserCache = new UserCache();

export class Add {
  public async follower(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;

    const followersCount: Promise<void> = followersCache.updateFollowersCountInCache(`${followerId}`, 'followersCount', 1);
    const followeesCount: Promise<void> = followersCache.updateFollowersCountInCache(`${req.currentUser!.userId}`, 'followingCount', 1);
    await Promise.all([followersCount, followeesCount]);

    const cachedFollower: Promise<IUserDocument> = userCache.getUserFromCache(followerId) as Promise<IUserDocument>;
    const cachedFollowee: Promise<IUserDocument> = userCache.getUserFromCache(`${req.currentUser!.userId}`) as Promise<IUserDocument>;

    const response: [IUserDocument, IUserDocument] = await Promise.all([cachedFollower, cachedFollowee]);
    
    const followerObjectId: ObjectId = new ObjectId();
    const addFollowerData: IFollowerData = Add.prototype.userData(response[0]);
    socketIOFollowerObject.emit('add follower', addFollowerData);

    const addFollowerToCache: Promise<void> = followersCache.saveFollowerToCache(`following:${req.currentUser?.userId}`, `${followerId}`);
    const addFolloweeToCache: Promise<void> = followersCache.saveFollowerToCache(`followers:${followerId}`, `${req.currentUser?.userId}`);

    await Promise.all([addFollowerToCache, addFolloweeToCache]);

    followerQueue.addFollowerJob('addFollowerToDB', {
      keyOne: `${req.currentUser?.userId}`,
      keyTwo: `${followerId}`,
      username: req.currentUser?.username,
      followerDocumentId: followerObjectId
    }),

    res.status(HTTP_STATUS.OK).json({ message: 'Following user now'});
  }

  private userData(user: IUserDocument): IFollowerData {
    console.log(user._id)
    return {
      _id: new mongoose.Types.ObjectId(user._id!),
      username: user.username!,
      avatarColor: user.avatarColor!,
      postCount: user.postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,
      uId: user.uId!,
      userProfile: user
    };
  }
}