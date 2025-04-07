import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveIsInAuctionToPlayer1744050795806 implements MigrationInterface {
    name = 'RemoveIsInAuctionToPlayer1744050795806'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP COLUMN "is_in_auction"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD "is_in_auction" boolean NOT NULL DEFAULT false`);
    }

}
