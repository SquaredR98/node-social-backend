import { BaseQueue } from '@services/queues/base.queue';
import { IAuthJob } from '@auth/interfaces/auth.interface';

class AuthQueue extends BaseQueue {
  constructor() {
    super('auth');
  }

  public addAuthUserJob (name: string, data: IAuthJob): void {
    this.addJob(name, data);
  }
}

export const authQueue: AuthQueue = new AuthQueue();