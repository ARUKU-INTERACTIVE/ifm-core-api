import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTeam1745336354359 implements MigrationInterface {
    name = 'AddTeam1745336354359'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ifm"."team" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "logo_uri" character varying NOT NULL, "user_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_f4415f685b68870787990e16122" UNIQUE ("uuid"), CONSTRAINT "REL_add64c4bdc53d926d9c0992bcc" UNIQUE ("user_id"), CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD "team_id" integer`);
        await queryRunner.query(`ALTER TABLE "ifm"."user" ADD "team_id" integer`);
        await queryRunner.query(`ALTER TABLE "ifm"."team" ADD CONSTRAINT "FK_add64c4bdc53d926d9c0992bccc" FOREIGN KEY ("user_id") REFERENCES "ifm"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD CONSTRAINT "FK_9deb77a11ad43ce17975f13dc85" FOREIGN KEY ("team_id") REFERENCES "ifm"."team"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP CONSTRAINT "FK_9deb77a11ad43ce17975f13dc85"`);
        await queryRunner.query(`ALTER TABLE "ifm"."team" DROP CONSTRAINT "FK_add64c4bdc53d926d9c0992bccc"`);
        await queryRunner.query(`ALTER TABLE "ifm"."user" DROP COLUMN "team_id"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP COLUMN "team_id"`);
        await queryRunner.query(`DROP TABLE "ifm"."team"`);
    }

}
