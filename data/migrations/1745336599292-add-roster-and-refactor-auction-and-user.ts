import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRosterAndRefactorAuctionAndUser1745336599292 implements MigrationInterface {
    name = 'AddRosterAndRefactorAuctionAndUser1745336599292'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ifm"."roster" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "team_id" integer NOT NULL, "user_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_335af8059513bd20c70320d3941" UNIQUE ("uuid"), CONSTRAINT "REL_f94c326aa32119920beb109d6b" UNIQUE ("user_id"), CONSTRAINT "REL_3f75a303a2af833a28efd951e9" UNIQUE ("team_id"), CONSTRAINT "PK_a4942154015f2666f3b5ddc15d3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ifm"."user" DROP COLUMN "team_id"`);
        await queryRunner.query(`ALTER TABLE "ifm"."auction" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "ifm"."auction_status_enum"`);
        await queryRunner.query(`ALTER TABLE "ifm"."team" ADD "roster_id" integer`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD "roster_id" integer`);
        await queryRunner.query(`ALTER TABLE "ifm"."roster" ADD CONSTRAINT "FK_f94c326aa32119920beb109d6b0" FOREIGN KEY ("user_id") REFERENCES "ifm"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ifm"."roster" ADD CONSTRAINT "FK_3f75a303a2af833a28efd951e91" FOREIGN KEY ("team_id") REFERENCES "ifm"."team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD CONSTRAINT "FK_d761fa0330fe492f7a62588e209" FOREIGN KEY ("roster_id") REFERENCES "ifm"."roster"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP CONSTRAINT "FK_d761fa0330fe492f7a62588e209"`);
        await queryRunner.query(`ALTER TABLE "ifm"."roster" DROP CONSTRAINT "FK_3f75a303a2af833a28efd951e91"`);
        await queryRunner.query(`ALTER TABLE "ifm"."roster" DROP CONSTRAINT "FK_f94c326aa32119920beb109d6b0"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP COLUMN "roster_id"`);
        await queryRunner.query(`ALTER TABLE "ifm"."team" DROP COLUMN "roster_id"`);
        await queryRunner.query(`CREATE TYPE "ifm"."auction_status_enum" AS ENUM('Open', 'Cancelled', 'Completed', 'NFTTransferred')`);
        await queryRunner.query(`ALTER TABLE "ifm"."auction" ADD "status" "ifm"."auction_status_enum" NOT NULL DEFAULT 'Open'`);
        await queryRunner.query(`ALTER TABLE "ifm"."user" ADD "team_id" integer`);
        await queryRunner.query(`DROP TABLE "ifm"."roster"`);
    }

}
