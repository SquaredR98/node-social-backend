import nodemailer from 'nodemailer';
import sendGridMail from '@sendgrid/mail';
import Logger from 'bunyan';
import { config } from '../../../config';
import { BadRequestError } from '../../globals/helpers/error-handler';

interface IMailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
}

const logger: Logger = config.createLogger('email');

sendGridMail.setApiKey(config.SENDGRID_API_KEY!);

class MailTransport {
  public async sensEmail(receiverEmail: string, subject: string, body: string): Promise<void> {
    if (config.NODE_ENV === 'test' || config.NODE_ENV === 'development') {
      this.developmentEmailSender(receiverEmail, subject, body);
    } else {
      this.productionEmailSender(receiverEmail, subject, body);
    }
  }

  private async developmentEmailSender(
    receiverEmail: string,
    subject: string,
    body: string
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: config.SENDER_EMAIL!,
        pass: config.SENDER_EMAIL_PASSWORD!
      }
    });

    const mailOptions: IMailOptions = {
      from: `SquaredR Socialize <${config.SENDER_EMAIL!}>`,
      to: receiverEmail,
      subject,
      html: body
    };

    try {
      await transporter.sendMail(mailOptions);
      logger.info('Development email sent successfully');
    } catch (error) {
      logger.error('Error sending email', error);
      throw new BadRequestError('Error sending email');
    }
  }
  private async productionEmailSender(
    receiverEmail: string,
    subject: string,
    body: string
  ): Promise<void> {
    const mailOptions: IMailOptions = {
      from: `SquaredR Socialize <${config.SENDER_EMAIL!}>`,
      to: receiverEmail,
      subject,
      html: body
    };

    try {
      await sendGridMail.send(mailOptions);
      logger.info('Production email sent successfully');
    } catch (error) {
      logger.error('Error sending email', error);
      throw new BadRequestError('Error sending email');
    }
  }
}


export const mailTransport: MailTransport = new MailTransport();