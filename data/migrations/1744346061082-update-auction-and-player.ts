import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateAuctionAndPlayer1744346061082 implements MigrationInterface {
    name = 'UpdateAuctionAndPlayer1744346061082'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD "address" character varying`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD CONSTRAINT "UQ_087a68eb0c05ad421178aa0f551" UNIQUE ("address")`);
        await queryRunner.query(`ALTER TABLE "ifm"."auction" ADD "player_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP CONSTRAINT "FK_c7ffb7bbe5f79f1f3dea2afeb29"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ALTER COLUMN "owner_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TYPE "ifm"."auction_status_enum" RENAME TO "auction_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "ifm"."auction_status_enum" AS ENUM('Open', 'Cancelled', 'Completed', 'NFTTransferred')`);
        await queryRunner.query(`ALTER TABLE "ifm"."auction" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "ifm"."auction" ALTER COLUMN "status" TYPE "ifm"."auction_status_enum" USING "status"::"text"::"ifm"."auction_status_enum"`);
        await queryRunner.query(`ALTER TABLE "ifm"."auction" ALTER COLUMN "status" SET DEFAULT 'Open'`);
        await queryRunner.query(`DROP TYPE "ifm"."auction_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD CONSTRAINT "FK_c7ffb7bbe5f79f1f3dea2afeb29" FOREIGN KEY ("owner_id") REFERENCES "ifm"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ifm"."auction" ADD CONSTRAINT "FK_c6f3246b7ac7bd4de47b610486b" FOREIGN KEY ("player_id") REFERENCES "ifm"."player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ifm"."auction" DROP CONSTRAINT "FK_c6f3246b7ac7bd4de47b610486b"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP CONSTRAINT "FK_c7ffb7bbe5f79f1f3dea2afeb29"`);
        await queryRunner.query(`CREATE TYPE "ifm"."auction_status_enum_old" AS ENUM('0', '1', '2', '3')`);
        await queryRunner.query(`ALTER TABLE "ifm"."auction" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "ifm"."auction" ALTER COLUMN "status" TYPE "ifm"."auction_status_enum_old" USING "status"::"text"::"ifm"."auction_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "ifm"."auction" ALTER COLUMN "status" SET DEFAULT '0'`);
        await queryRunner.query(`DROP TYPE "ifm"."auction_status_enum"`);
        await queryRunner.query(`ALTER TYPE "ifm"."auction_status_enum_old" RENAME TO "auction_status_enum"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ALTER COLUMN "owner_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD CONSTRAINT "FK_c7ffb7bbe5f79f1f3dea2afeb29" FOREIGN KEY ("owner_id") REFERENCES "ifm"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ifm"."auction" DROP COLUMN "player_id"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP CONSTRAINT "UQ_087a68eb0c05ad421178aa0f551"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP COLUMN "address"`);
    }

}
