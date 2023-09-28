import fs from 'fs';
import ejs from 'ejs';
import { INotificationTemplate } from '@notifications/interfaces/notification.interface';

class NotificationTemplate {
  public notificationMessageTemplate(templateParams: INotificationTemplate): string {
    const { username, header, message } = templateParams;
    return ejs.render(fs.readFileSync(__dirname + '/notification.ejs', 'utf-8'), {
      username,
      header,
      message,
      image_url:
        'https://e7.pngegg.com/pngimages/1024/909/png-clipart-computer-icons-lock-padlock-technic-computer-icons.png'
    });
  }
}

export const notificationTemplate: NotificationTemplate = new NotificationTemplate();
