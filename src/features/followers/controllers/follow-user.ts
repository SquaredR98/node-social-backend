import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';
import { FollowersCache } from '@services/redis/followers.cache';
import { UserCache } from '@services/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { IFollowerData } from '@followers/interfaces/follower.interface';
import mongoose from 'mongoose';
import { socketIOFollowerObject } from '@sockets/followers';

const followersCache: FollowersCache = new FollowersCache();
const userCache: UserCache = new UserCache();

export class Add {
  public async follower(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;

    const followersCount: Promise<void> = followersCache.updateFollowersCountInCache(`${followerId}`, 'followersCount', 1);
    const followeesCount: Promise<void> = followersCache.updateFollowersCountInCache(`${req.currentUser?.userId}`, 'followingCount', 1);

    await Promise.all([followersCount, followeesCount]);

    const cachedFollowee: Promise<IUserDocument> = userCache.getUserFromCache(followerId) as Promise<IUserDocument>;
    const cachedFollower: Promise<IUserDocument> = userCache.getUserFromCache(`${req.currentUser?.userId}`) as Promise<IUserDocument>;

    const response: [IUserDocument, IUserDocument] = await Promise.all([cachedFollower, cachedFollowee]);

    const addFollowerData: IFollowerData = Add.prototype.userData(response[0]);
    
    socketIOFollowerObject.emit('add follower', addFollowerData);

    const addFollowerToCache: Promise<void> = followersCache.saveFollowerToCache(`followers:${req.currentUser?.userId}`, `${followerId}`);
    const addFolloweeToCache: Promise<void> = followersCache.saveFollowerToCache(`following:${followerId}`, `${req.currentUser?.userId}`);

    await Promise.all([addFollowerToCache, addFolloweeToCache]);

    res.status(HTTP_STATUS.OK).json({ message: 'Following user now'});
  }

  private userData(user: IUserDocument): IFollowerData {
    return {
      _id: new mongoose.Types.ObjectId(user._id),
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