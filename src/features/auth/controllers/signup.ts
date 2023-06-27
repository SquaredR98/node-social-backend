import { ObjectId } from 'mongodb';
import { Request, Response } from 'express';
import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { signupSchema } from '@auth/schemes/signup';
import { IAuthDocument, ISignUpData } from '@auth/interfaces/auth.interface';
import { authService } from '@services/db/auth.service';
import { BadRequestError } from '@globals/helpers/error-handler';
import { Helpers } from '@globals/helpers/helpers';
import { UploadApiResponse } from 'cloudinary';
import { upload } from '../../../shared/globals/helpers/cloudinary-upload';
import HTTP_STATUS from 'http-status-codes';

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

    const result: UploadApiResponse = await upload(avatarImage, `${userObjectId}`, true, true) as UploadApiResponse;

    if(!result?.public_id) throw new BadRequestError('File Upload: Something went wrong, please try again');
    
    res.status(HTTP_STATUS.CREATED).json({message: 'User created successfully', authData});
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
}