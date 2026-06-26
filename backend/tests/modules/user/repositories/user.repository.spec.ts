import { UserRepository } from '../../../../src/modules/user/repositories/user.repository';

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(() => {
    repository = new UserRepository();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should expose a save method', () => {
    expect(typeof repository.save).toBe('function');
  });

  it('should expose a findById method', () => {
    expect(typeof repository.findById).toBe('function');
  });
});
