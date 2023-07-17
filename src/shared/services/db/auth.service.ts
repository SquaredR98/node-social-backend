import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { Helpers } from '@globals/helpers/helpers';
import { AuthModel } from '@auth/models/auth.schema';

export class AuthService {
  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [
        { username },
        { email: Helpers.lowerCase(email) }
      ]
    };

    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;

    return user;
  }

  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: username }]
    };

    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;

    return user;
  }
}

export const authService: AuthService = new AuthService();
