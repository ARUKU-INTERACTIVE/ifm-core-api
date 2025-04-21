import { Roster } from '@/module/roster/domain/roster.entity';

describe('Roster', () => {
  let roster: Roster;

  beforeEach(() => {
    roster = new Roster();
  });

  describe('Roster Creation', () => {
    it('should have an undefined userId upon creation', async () => {
      expect(roster.userId).toStrictEqual(undefined);
    });
  });
});
