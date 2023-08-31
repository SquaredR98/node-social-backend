import mongoose, { Query } from 'mongoose';
import { ObjectId, BulkWriteResult } from 'mongodb';
import { FollowerModel } from '@followers/models/follower.schema';
import { UserModel } from '@user/models/user.schema';
import { IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface';
import { IFollowerData, IFollowerDocument } from '@followers/interfaces/follower.interface';


class FollowerService {
  public async addFollowerToDB(userId: string, followeeId: string, username: string, followerDocumentId: string): Promise<void> {
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
    const followerObjectId: ObjectId = new mongoose.Types.ObjectId(userId);

    await FollowerModel.create({
      _id: followerDocumentId,
      followerId: followerObjectId,
      followeeId: followeeObjectId
    });

    const users: Promise<BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: userId },
          update: { $inc: { followingCount: 1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: 1 } }
        }
      },
    ]);

    await Promise.all([users, UserModel.findOne({ _id: followeeId})]);
  }


  public async removeFollowerFromDB(followeeId: string, followerId: string): Promise<void> {
    const followeeObjectId: ObjectId = new mongoose.Types.ObjectId(followeeId);
    const followerObjectId: ObjectId = new mongoose.Types.ObjectId(followerId);

    const unfollow: Query<IQueryComplete & IQueryDeleted, IFollowerDocument> = FollowerModel.deleteOne({
      followerId: followerObjectId,
      followeeId: followeeObjectId
    });

    const users: Promise<BulkWriteResult> = UserModel.bulkWrite([
      {
        updateOne: {
          filter: { _id: followerId },
          update: { $inc: { followingCount: -1 } }
        }
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: { $inc: { followersCount: -1 } }
        }
      },
    ]);

    await Promise.all([unfollow, users]);
  }

  public async getFolloweeData(userObjectId: ObjectId): Promise<IFollowerData[]> {
    const followee: IFollowerData[] = await FollowerModel.aggregate([
      { $match: { followerId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followeeId', foreignField: '_id', as: 'followee' } },
      { $unwind: '$followee' },
      { $lookup: { from: 'Auth', localField: 'followee.authId', foreignField: '_id', as: 'auth' } },
      { $unwind: '$auth' },
      {
        $addFields: {
          _id: '$followee._id',
          username: '$auth.username',
          avatarColor: '$auth.avatarColor',
          uId: '$auth.uId',
          postsCount: '$followee.postsCount',
          followersCount: '$followee.followersCount',
          followingCount: '$followee.followingCount',
          profilePicture: '$followee.profilePicture',
          userProfile: '$followee'
        }
      }, {
        $project: {
          authId: 0,
          followerId: 0,
          followeeId: 0,
          createdAt: 0,
          __v: 0,

        }
      }
    ]);

    return followee;
  }

  public async getFollowerData(userObjectId: ObjectId): Promise<IFollowerData[]> {
    const followers: IFollowerData[] = await FollowerModel.aggregate([
      { $match: { followeeId: userObjectId } },
      { $lookup: { from: 'User', localField: 'followerId', foreignField: '_id', as: 'follower' } },
      { $unwind: '$follower' },
      { $lookup: { from: 'Auth', localField: 'follower.authId', foreignField: '_id', as: 'auth' } },
      { $unwind: '$auth' },
      {
        $addFields: {
          _id: '$follower._id',
          username: '$auth.username',
          avatarColor: '$auth.avatarColor',
          uId: '$auth.uId',
          postsCount: '$follower.postsCount',
          followersCount: '$follower.followersCount',
          followingCount: '$follower.followingCount',
          profilePicture: '$follower.profilePicture',
          userProfile: '$follower'
        }
      }, {
        $project: {
          authId: 0,
          followerId: 0,
          followeeId: 0,
          createdAt: 0,
          __v: 0,

        }
      }
    ]);

    return followers;
  }
}

export const followerService: FollowerService = new FollowerService();