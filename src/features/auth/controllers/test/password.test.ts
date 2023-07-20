/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Password } from '@auth/controllers/password';
import { authMock, mockAuthRequest, mockAuthResponse } from '@root/mocks/auth.mock';
import { CustomError } from '@globals/helpers/error-handler';
import { emailQueue } from '@services/queues/email.queue';
import { authService } from '@services/db/auth.service';

const WRONG_EMAIL = 'test@email.com';
const CORRECT_EMAIL = 'manny@me.com';
const INVALID_EMAIL = 'test';
const CORRECT_PASSWORD = 'manny';

jest.mock('@services/queues/base.queue');
jest.mock('@services/queues/email.queue');
jest.mock('@services/db/auth.service');
jest.mock('@services/emails/mail.transport');

describe('Password', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw an error if email is invalid', () => {
      const req: Request = mockAuthRequest({}, { email: INVALID_EMAIL }) as Request;
      const res: Response = mockAuthResponse();
      Password.prototype.create(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Field must be valid');
      });
    });

    it('should throw "Invalid credentials" if email does not exist', () => {
      const req: Request = mockAuthRequest({}, { email: WRONG_EMAIL }) as Request;
      const res: Response = mockAuthResponse();
      jest.spyOn(authService, 'getUserByEmail').mockResolvedValue(null as any);
      Password.prototype.create(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Email doesnot exist');
      });
    });

    it('should send correct json response', async () => {
      const req: Request = mockAuthRequest({}, { email: CORRECT_EMAIL }) as Request;
      const res: Response = mockAuthResponse();
      jest.spyOn(authService, 'getUserByEmail').mockResolvedValue(authMock);
      jest.spyOn(emailQueue, 'addEmailJob');
      await Password.prototype.create(req, res);
      expect(emailQueue.addEmailJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password Reset Email Sent'
      });
    });
  });

  describe('update', () => {
    it('should throw an error if password is empty', () => {
      const req: Request = mockAuthRequest({}, { password: '' }) as Request;
      const res: Response = mockAuthResponse();
      Password.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Password is a required field');
      });
    });

    it('should throw an error if password and confirmPassword are different', () => {
      const req: Request = mockAuthRequest({}, { password: CORRECT_PASSWORD, confirmPassword: `${CORRECT_PASSWORD}2` }) as Request;
      const res: Response = mockAuthResponse();
      Password.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Passwords should match');
      });
    });

    it('should throw error if reset token has expired', () => {
      const req: Request = mockAuthRequest({}, { password: CORRECT_PASSWORD, confirmPassword: CORRECT_PASSWORD }, null, {
        token: ''
      }) as Request;
      const res: Response = mockAuthResponse();
      jest.spyOn(authService, 'getUserByPasswordToken').mockResolvedValue(null as any);
      Password.prototype.update(req, res).catch((error: CustomError) => {
        expect(error.statusCode).toEqual(400);
        expect(error.serializeErrors().message).toEqual('Reset password token has expired');
      });
    });

    it('should send correct json response', async () => {
      const req: Request = mockAuthRequest({}, { password: CORRECT_PASSWORD, confirmPassword: CORRECT_PASSWORD }, null, {
        token: '12sde3'
      }) as Request;
      const res: Response = mockAuthResponse();
      jest.spyOn(authService, 'getUserByPasswordToken').mockResolvedValue(authMock);
      jest.spyOn(emailQueue, 'addEmailJob');
      await Password.prototype.update(req, res);
      expect(emailQueue.addEmailJob).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Password successfully updated.'
      });
    });
  });
});
