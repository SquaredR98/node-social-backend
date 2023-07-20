import { Request, Response } from 'express';
import { mockAuthRequest, mockAuthResponse } from '@root/mocks/auth.mock';
import { SignOut } from '@auth/controllers/signout';

const USERNAME = 'Manny';
const PASSWORD = 'manny1';

describe('SignOut', () => {
  it('should set session to null', async () => {
    const req: Request = mockAuthRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = mockAuthResponse();
    await SignOut.prototype.signout(req, res);
    expect(req.session).toBeNull();
  });

  it('should send correct json response', async () => {
    const req: Request = mockAuthRequest({}, { username: USERNAME, password: PASSWORD }) as Request;
    const res: Response = mockAuthResponse();
    await SignOut.prototype.signout(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Signout successful',
      user: {},
      token: ''
    });
  });
});
