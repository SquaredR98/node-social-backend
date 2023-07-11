import { omit } from 'lodash';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { UploadApiResponse } from 'cloudinary';

import HTTP_STATUS from 'http-status-codes';

import { config } from '@root/config';
import { Helpers } from '@globals/helpers/helpers';
import { signupSchema } from '@auth/schemes/signup';
import { UserCache } from '@services/redis/user.cache';
import { authService } from '@services/db/auth.service';
import { authQueue } from '@services/queues/auth.queue';
import { userQueue } from '@services/queues/user.queue';
import { upload } from '@globals/helpers/cloudinary-upload';
import { IUserDocument } from '@user/interfaces/user.interface';
import { BadRequestError } from '@globals/helpers/error-handler';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { joiValidation } from '@globals/decorators/joi-validation.decorator';

const userCache: UserCache = new UserCache();

export class SignUp {
  @joiValidation(signupSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { username, email, password, avatarColor, avatarImage } = req.body;

    const checkIfUserExist: IAuthDocument = await authService.getUserByUsernameOrEmail(
      username,
      email
    );

    if (checkIfUserExist) {
      throw new BadRequestError('The username or email already exists. Please login.');
    }

    const authObjectId: ObjectId = new ObjectId();
    const userObjectId: ObjectId = new ObjectId();
    const uId = `${Helpers.generateRandomIntegers(12)}`;

    const authData: IAuthDocument = SignUp.prototype.signUpData({
      _id: authObjectId,
      uId,
      username,
      email,
      password,
      avatarColor
    });

    const result: UploadApiResponse = (await upload(
      avatarImage,
      `${userObjectId}`,
      true,
      true
    )) as UploadApiResponse;

    if (!result?.public_id)
      throw new BadRequestError('File Upload: Something went wrong, please try again');

    const userDataForCache: IUserDocument = SignUp.prototype.userData(authData, userObjectId);
    userDataForCache.profilePicture = `https://res.cloudinary.com/${config.CLOUD_NAME}/image/upload/v${result.version}/${userObjectId}`;

    await userCache.saveUserToCache(`${userObjectId}`, uId, userDataForCache);

    omit(userDataForCache, ['uId', 'username', 'email', 'avatarColor', 'password']);
    authQueue.addAuthUserJob('addAuthUserToDB', { value: authData });
    userQueue.addUserJob('addUserToDB', { value: userDataForCache });

    const userJwt: string = SignUp.prototype.signedToken(authData, userObjectId);

    req.session = { jwt: userJwt };

    res.status(HTTP_STATUS.CREATED).json({ message: 'User created successfully', user: userDataForCache, token: userJwt });
  }

  private signUpData(data: ISignUpData): IAuthDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id,
      uId,
      username: Helpers.lowerCase(username),
      email: Helpers.lowerCase(email),
      password,
      avatarColor,
      createdAt: new Date()
    } as IAuthDocument;
  }

  private userData(data: IAuthDocument, userObjectId: ObjectId): IUserDocument {
    const { _id, username, email, uId, password, avatarColor } = data;
    return {
      _id: userObjectId,
      authId: _id,
      uId,
      username: Helpers.firstLetterUppercase(username),
      email,
      password,
      avatarColor,
      profilePicture: '',
      blocked: [],
      blockedBy: [],
      work: '',
      location: '',
      school: '',
      quote: '',
      bgImageVersion: '',
      bgImageId: '',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
      notifications: {
        messages: true,
        reactions: true,
        comments: true,
        follows: true
      },
      social: {
        facebook: '',
        instagram: '',
        twitter: '',
        youtube: ''
      }
    } as unknown as IUserDocument;
  }

  private signedToken(data: IAuthDocument, userObjectId: ObjectId): string {
    return jwt.sign(
      {
        userId: userObjectId,
        uId: data.uId,
        email: data.email,
        username: data.username,
        avatarColor: data.avatarColor
      },
      config.JWT_TOKEN!
    );
  }
}
