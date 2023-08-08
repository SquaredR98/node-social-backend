import mongoose, { Query } from 'mongoose';
import { ObjectId, BulkWriteResult } from 'mongodb';
import { FollowerModel } from '@followers/models/follower.schema';
import { UserModel } from '@user/models/user.schema';
import { IQueryComplete, IQueryDeleted } from '@post/interfaces/post.interface';
import { IFollowerDocument } from '@followers/interfaces/follower.interface';


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
}

export const followerService: FollowerService = new FollowerService();