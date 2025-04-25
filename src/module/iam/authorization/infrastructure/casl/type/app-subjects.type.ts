import { InferSubjects } from '@casl/ability';
import { Type } from '@nestjs/common';

import { Base } from '@common/base/domain/base.entity';

import { User } from '@iam/user/domain/user.entity';

export type AppSubjects = InferSubjects<typeof User> | Type<Base> | 'all';
