import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFormationAndFormationPlayerEntities1745861928803 implements MigrationInterface {
    name = 'AddFormationAndFormationPlayerEntities1745861928803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "ifm"."formation_player_position_enum" AS ENUM('Goalkeeper', 'Defender', 'Midfielder', 'Forward')`);
        await queryRunner.query(`CREATE TABLE "ifm"."formation_player" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "formation_id" integer NOT NULL, "player_id" integer NOT NULL, "position" "ifm"."formation_player_position_enum" NOT NULL, "position_index" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_e4a788af02b87a643b5da92eef0" UNIQUE ("uuid"), CONSTRAINT "PK_6d045b573506578911d44bef86f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ifm"."formation" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "defenders" integer NOT NULL, "description" character varying DEFAULT '', "forwards" integer NOT NULL, "midfielders" integer NOT NULL, "is_active" boolean NOT NULL DEFAULT false, "roster_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_c62c85956a46363cccfcb71f8e6" UNIQUE ("uuid"), CONSTRAINT "PK_0b7ed8d0239c80921e788650b0d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ifm"."formation_player" ADD CONSTRAINT "FK_cfce62e1e0f9425264f092bebd6" FOREIGN KEY ("player_id") REFERENCES "ifm"."player"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ifm"."formation_player" ADD CONSTRAINT "FK_6bbb069f766b9ec13ce88a07ed4" FOREIGN KEY ("formation_id") REFERENCES "ifm"."formation"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ifm"."formation" ADD CONSTRAINT "FK_6c72199345ba5e69d6c0bcdde8c" FOREIGN KEY ("roster_id") REFERENCES "ifm"."roster"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ifm"."formation" DROP CONSTRAINT "FK_6c72199345ba5e69d6c0bcdde8c"`);
        await queryRunner.query(`ALTER TABLE "ifm"."formation_player" DROP CONSTRAINT "FK_6bbb069f766b9ec13ce88a07ed4"`);
        await queryRunner.query(`ALTER TABLE "ifm"."formation_player" DROP CONSTRAINT "FK_cfce62e1e0f9425264f092bebd6"`);
        await queryRunner.query(`DROP TABLE "ifm"."formation"`);
        await queryRunner.query(`DROP TABLE "ifm"."formation_player"`);
        await queryRunner.query(`DROP TYPE "ifm"."formation_player_position_enum"`);
    }

}
