import { UserController } from '../../../../src/modules/user/controllers/user.controller';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(() => {
    controller = new UserController();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should expose a createUser method', () => {
    expect(typeof controller.createUser).toBe('function');
  });

  it('should expose a getUserById method', () => {
    expect(typeof controller.getUserById).toBe('function');
  });
});
