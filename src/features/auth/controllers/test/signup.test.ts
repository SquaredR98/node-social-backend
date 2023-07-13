import { Request, Response } from 'express';
import * as cloudinaryUploads from '@globals/helpers/cloudinary-upload';
import { mockAuthRequest, mockAuthResponse } from '@mocks/auth.mock';
import { SignUp } from '../signup';
import { CustomError } from '../../../../shared/globals/helpers/error-handler';



jest.mock('@services/queues/base.queue');
jest.mock('@services/queues/user.queue');
jest.mock('@services/queues/auth.queue');
jest.mock('@services/redis/user.cache');
jest.mock('@globals/helpers/cloudinary-upload');

describe('Sign Up', () => {
  it('should throw an error if username is not valid', () => {
    const req: Request = mockAuthRequest({}, {
      username: '',
      email: 'someone@email.com',
      password: 'ravi1234',
      avatarColor: '',
      avatarImage: ''
    }) as unknown as Request;

    const res: Response = mockAuthResponse();
  
    SignUp.prototype.create(req, res).catch((error :CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });
  it('should throw an error if username length is less than minimum length', () => {
    const req: Request = mockAuthRequest({}, {
      username: 'sqr',
      email: 'someone@email.com',
      password: 'ravi1234',
      avatarColor: '',
      avatarImage: ''
    }) as unknown as Request;

    const res: Response = mockAuthResponse();
  
    SignUp.prototype.create(req, res).catch((error :CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });
  it('should throw an error if username length is greater than maximum length', () => {
    const req: Request = mockAuthRequest({}, {
      username: 'squaredr@2018',
      email: 'someone@email.com',
      password: 'ravi1234',
      avatarColor: '',
      avatarImage: ''
    }) as unknown as Request;

    const res: Response = mockAuthResponse();
  
    SignUp.prototype.create(req, res).catch((error :CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });
});