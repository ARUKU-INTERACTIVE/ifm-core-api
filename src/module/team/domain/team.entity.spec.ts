import { Team } from '@/module/team/domain/team.entity';

describe('Team', () => {
  let team: Team;

  beforeEach(() => {
    team = new Team();
  });

  describe('Team Creation', () => {
    it('should have an undefined name upon creation', async () => {
      expect(team.name).toStrictEqual(undefined);
    });
  });
});
