import { Formation } from '@/module/formation/domain/formation.entity';

describe('Formation', () => {
  let formation: Formation;

  beforeEach(() => {
    formation = new Formation();
  });

  describe('Formation Creation', () => {
    it('should have an undefined name upon creation', async () => {
      expect(formation.name).toStrictEqual(undefined);
    });
  });
});
