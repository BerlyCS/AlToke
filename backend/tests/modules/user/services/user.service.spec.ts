import { UserService } from '../../../../src/modules/user/services/user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should expose a createUser method', () => {
    expect(typeof service.createUser).toBe('function');
  });

  it('should expose a getUserById method', () => {
    expect(typeof service.getUserById).toBe('function');
  });
});
