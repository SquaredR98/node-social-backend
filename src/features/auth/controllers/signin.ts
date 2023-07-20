import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import HTTP_STATUS from 'http-status-codes';

import { config } from '@root/config';
import { loginSchema } from '@auth/schemes/signin';
import { authService } from '@services/db/auth.service';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { BadRequestError } from '@globals/helpers/error-handler';
import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@services/db/user.service';
import { mailTransport } from '../../../shared/services/emails/mail.transport';
import { forgotPasswordTemplate } from '../../../shared/services/emails/templates/forgot-password/forgot-password-template';
import { emailQueue } from '../../../shared/services/queues/email.queue';

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(username);

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials');
    }

    const passwordsMatch: boolean = await existingUser.comparePassword(password);

    if (!passwordsMatch) throw new BadRequestError('Invalid credentails');
    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);
    const userJwt: string = jwt.sign(
      {
        userId: existingUser._id,
        uId: existingUser.uId,
        email: existingUser.email,
        username: existingUser.username,
        avatarColor: existingUser.avatarColor
      },
      config.JWT_TOKEN!
    );

    req.session = { jwt: userJwt };

    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser._id,
      uId: existingUser.uId,
      email: existingUser.email,
      username: existingUser.username,
      avatarColor: existingUser.avatarColor,
      createdAt: existingUser.createdAt
    } as IUserDocument;

    const resetLink = `${config.CLIENT_URL}/reset-password?token=dfsdfbk0239ru0ehsr98394f`;
    const template = forgotPasswordTemplate.forgotTemplate(existingUser.username, resetLink);
    emailQueue.addEmailJob('forgotPassowrdEmail', {
      receiverEmail: 'erich.bergstrom39@ethereal.email',
      subject: 'Reset Your Password',
      template
    });
    await mailTransport.sensEmail(
      ' erich.bergstrom39@ethereal.email',
      'Testing Ethereal Email',
      'Welcome to the proper testing of the ethereal email'
    );

    res.status(HTTP_STATUS.OK).json({ message: 'Login successful', userDocument, token: userJwt });
  }
}
