import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTeamIdToUserAndRemoveUserRosterRelation1745437164135 implements MigrationInterface {
    name = 'AddTeamIdToUserAndRemoveUserRosterRelation1745437164135'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ifm"."roster" DROP CONSTRAINT "FK_f94c326aa32119920beb109d6b0"`);
        await queryRunner.query(`ALTER TABLE "ifm"."team" DROP COLUMN "roster_id"`);
        await queryRunner.query(`ALTER TABLE "ifm"."roster" DROP CONSTRAINT "REL_f94c326aa32119920beb109d6b"`);
        await queryRunner.query(`ALTER TABLE "ifm"."roster" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "ifm"."user" ADD "team_id" integer`);
        await queryRunner.query(`ALTER TABLE "ifm"."user" ADD CONSTRAINT "UQ_155dbc144ff2bd4713fdf1f6c77" UNIQUE ("team_id")`);
        await queryRunner.query(`ALTER TABLE "ifm"."user" ADD CONSTRAINT "FK_155dbc144ff2bd4713fdf1f6c77" FOREIGN KEY ("team_id") REFERENCES "ifm"."team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ifm"."user" DROP CONSTRAINT "FK_155dbc144ff2bd4713fdf1f6c77"`);
        await queryRunner.query(`ALTER TABLE "ifm"."user" DROP CONSTRAINT "UQ_155dbc144ff2bd4713fdf1f6c77"`);
        await queryRunner.query(`ALTER TABLE "ifm"."user" DROP COLUMN "team_id"`);
        await queryRunner.query(`ALTER TABLE "ifm"."roster" ADD "user_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ifm"."roster" ADD CONSTRAINT "REL_f94c326aa32119920beb109d6b" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "ifm"."team" ADD "roster_id" integer`);
        await queryRunner.query(`ALTER TABLE "ifm"."roster" ADD CONSTRAINT "FK_f94c326aa32119920beb109d6b0" FOREIGN KEY ("user_id") REFERENCES "ifm"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
