import crypto from 'crypto';
import HTTP_STATUS from 'http-status-codes';
import { Request, Response } from 'express';
import moment from 'moment';
import publicip from 'ip';

import { config } from '@root/config';
import { authService } from '@services/db/auth.service';
import { emailQueue } from '@services/queues/email.queue';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { BadRequestError } from '@globals/helpers/error-handler';
import { emailSchema, passwordSchema } from '@auth/schemes/password';
import { joiValidation } from '@globals/decorators/joi-validation.decorator';
import { forgotPasswordTemplate } from '@services/emails/templates/forgot-password/forgot-password-template';
import { IResetPasswordParams } from '../../user/interfaces/user.interface';
import { resetPasswordTemplate } from '../../../shared/services/emails/templates/reset-password/reset-password-template';

export class Password {
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const existingUser: IAuthDocument = await authService.getUserByEmail(email);

    if (!existingUser) throw new BadRequestError('Email doesnot exist');

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(100));
    const randomCharacters: string = randomBytes.toString('hex');

    await authService.updatePasswordToken(
      `${existingUser._id}`,
      randomCharacters,
      Date.now() * 60 * 60 * 1000
    );

    const resetLink = `${config.CLIENT_URL}/resetPassword?token=${randomCharacters}`;
    const template: string = forgotPasswordTemplate.forgotTemplate(
      existingUser.username,
      resetLink
    );

    emailQueue.addEmailJob('forgotPasswordEmail', {
      template,
      receiverEmail: email,
      subject: 'Reset Your Password'
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Password Reset Email Sent' });
  }
  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;

    if(password !== confirmPassword) throw new BadRequestError('Password doesnot match');
    
    const existingUser: IAuthDocument = await authService.getUserByPasswordToken(token);

    if (!existingUser) throw new BadRequestError('Reset password token has expired');

    existingUser.password = password;
    existingUser.passwordResetExpires = undefined;
    existingUser.passwordResetToken = undefined;

    await existingUser.save();

    const templateParama: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: publicip.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };

    const template = resetPasswordTemplate.passwordResetTemplate(templateParama);

    emailQueue.addEmailJob('forgotPasswordEmail', {
      template,
      receiverEmail: 'erich.bergstrom39@ethereal.email',
      subject: 'Password reset conformation'
    });

    res.status(HTTP_STATUS.OK).json({ message: 'Password successfully updated.' });
  }
}
