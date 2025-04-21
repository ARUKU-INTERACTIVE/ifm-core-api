import { Roster } from '@module/roster/domain/roster.entity';
import { Team } from '@module/team/domain/team.entity';

import { Base } from '@common/base/domain/base.entity';

import { AppRole } from '@iam/authorization/domain/app-role.enum';

export class User extends Base {
  publicKey?: string;
  username: string | null;
  externalId?: string;
  roles: AppRole[];
  isVerified: boolean;
  team?: Team;
  teamId?: number;
  roster?: Roster;
  constructor(
    publicKey?: string,
    username?: string,
    roles?: AppRole[],
    externalId?: string,
    id?: number,
    createdAt?: string,
    updatedAt?: string,
    deletedAt?: string,
    isVerified?: boolean,
  ) {
    super(id, createdAt, updatedAt, deletedAt);
    this.publicKey = publicKey;
    this.username = username;
    this.externalId = externalId;
    this.roles = roles;
    this.isVerified = isVerified;
  }
}
