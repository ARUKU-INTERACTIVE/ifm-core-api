import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsInAuctionToPlayerSchema1743795032561
  implements MigrationInterface
{
  name = 'AddIsInAuctionToPlayerSchema1743795032561';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ifm"."player" ADD "is_in_auction" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ifm"."player" DROP COLUMN "is_in_auction"`,
    );
  }
}
