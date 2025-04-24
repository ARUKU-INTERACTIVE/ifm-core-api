import { FormationPlayer } from '@/module/formation-player/domain/formation-player.entity';

describe('FormationPlayer', () => {
  let formationPlayer: FormationPlayer;

  beforeEach(() => {
    formationPlayer = new FormationPlayer();
  });

  describe('FormationPlayer Creation', () => {
    it('should have an undefined name upon creation', async () => {
      expect(formationPlayer.name).toStrictEqual(undefined);
    });
  });
});
