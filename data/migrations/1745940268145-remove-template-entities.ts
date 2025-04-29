import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveTemplateEntities1745940268145 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ifm"."book" DROP CONSTRAINT "FK_f316eed809f6f7617821012ad05"`,
    );
    await queryRunner.query(`DROP TABLE "ifm"."admin"`);
    await queryRunner.query(`DROP TABLE "ifm"."genre"`);
    await queryRunner.query(`DROP TABLE "ifm"."book"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ifm"."book" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying, "genre_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_0a5875eb5ec460206c670c3b62d" UNIQUE ("uuid"), CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ifm"."genre" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_3e554b051ddcb121a7e3d946e69" UNIQUE ("uuid"), CONSTRAINT "PK_0285d4f1655d080cfcf7d1ab141" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "ifm"."admin" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "external_id" character varying, "roles" text NOT NULL, "is_verified" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_7640d8ad91a4e271cba74e22629" UNIQUE ("uuid"), CONSTRAINT "UQ_5e568e001f9d1b91f67815c580f" UNIQUE ("username"), CONSTRAINT "UQ_db769b03e65ec8e15172fdda2ad" UNIQUE ("external_id"), CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "ifm"."book" ADD CONSTRAINT "FK_f316eed809f6f7617821012ad05" FOREIGN KEY ("genre_id") REFERENCES "ifm"."genre"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
