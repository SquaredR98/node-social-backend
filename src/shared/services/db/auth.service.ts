import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { Helpers } from '@globals/helpers/helpers';
import { AuthModel } from '@auth/models/auth.schema';

export class AuthService {
  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [
        { username: Helpers.firstLetterUppercase(username) },
        { email: Helpers.lowerCase(email) }
      ]
    };

    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;

    return user;
  }

  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

  public async updatePasswordToken(authId: string, token: string, tokenExpiration: number): Promise<void> {
    await AuthModel.updateOne({ _id: authId}, {
      passwordResetToken: token,
      passwordResetExpires: tokenExpiration
    });
  }

  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: username }]
    };

    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;

    return user;
  }

  public async getUserByEmail(email: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({ email: Helpers.lowerCase(email)}).exec()) as IAuthDocument;

    return user;
  }

  public async getUserByPasswordToken(token: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gte: Date.now() }
    }).exec()) as IAuthDocument;

    return user;
  }
}

export const authService: AuthService = new AuthService();
