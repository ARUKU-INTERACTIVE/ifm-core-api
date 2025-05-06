import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuctionStatusProperty1746564752796
  implements MigrationInterface
{
  name = 'AddAuctionStatusProperty1746564752796';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ifm"."auction" ADD "status" character varying NOT NULL DEFAULT 'Open'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "ifm"."auction" DROP COLUMN "status"`);
  }
}
