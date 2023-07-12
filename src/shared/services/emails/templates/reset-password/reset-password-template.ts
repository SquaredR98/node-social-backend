import fs from 'fs';
import ejs from 'ejs';
import { IResetPasswordParams } from '@user/interfaces/user.interface';

class ResetPasswordTemplate {
  public passwordResetTemplate(templateParams: IResetPasswordParams): string {
    const { email, ipaddress, username } = templateParams;

    return ejs.render(fs.readFileSync(__dirname + '/reset-password-template.ejs', 'utf-8'), {
      username,
      email,
      ipaddress,
      image_url: 'https://e7.pngegg.com/pngimages/1024/909/png-clipart-computer-icons-lock-padlock-technic-computer-icons.png'
    });
  }
}

export const resetPasswordTemplate: ResetPasswordTemplate = new ResetPasswordTemplate();