import { AppAction } from '@iam/authorization/domain/app-action.enum';
import { IPermissionsDefinition } from '@iam/authorization/infrastructure/policy/type/permissions-definition.interface';

import { Team } from '@/module/team/domain/team.entity';

export const Permissions: IPermissionsDefinition = {
  regular(_, { can }) {
    can(AppAction.Read, Team);
    can(AppAction.Update, Team);
  },
  admin(_, { can }) {
    can(AppAction.Manage, Team);
    can(AppAction.Update, Team);
  },
};
