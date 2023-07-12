import fs from 'fs';
import ejs from 'ejs';

class ForgotPasswordTemplate {
  public forgotTemplate(username: string, resetLink: string): string {
    return ejs.render(fs.readFileSync(__dirname + '/forgot-password-template.ejs', 'utf-8'), {
      username,
      resetLink,
      image_url:
        'https://e7.pngegg.com/pngimages/1024/909/png-clipart-computer-icons-lock-padlock-technic-computer-icons.png'
    });
  }
}

export const forgotPasswordTemplate: ForgotPasswordTemplate = new ForgotPasswordTemplate();
