import { MigrationInterface, QueryRunner } from "typeorm";

export class PlayerWithAuction1743516921677 implements MigrationInterface {
    name = 'PlayerWithAuction1743516921677'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "ifm"."player" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "metadata_uri" character varying, "external_id" integer NOT NULL, "issuer" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "owner_id" integer, CONSTRAINT "UQ_d361920f8c6a8ea7950a34e0200" UNIQUE ("uuid"), CONSTRAINT "PK_65edadc946a7faf4b638d5e8885" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "ifm"."auction_status_enum" AS ENUM('0', '1', '2', '3')`);
        await queryRunner.query(`CREATE TABLE "ifm"."auction" ("id" SERIAL NOT NULL, "uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "external_id" integer NOT NULL, "status" "ifm"."auction_status_enum" NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_33069fee8a48592ff61372edff0" UNIQUE ("uuid"), CONSTRAINT "PK_9dc876c629273e71646cf6dfa67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "ifm"."user" ADD "public_key" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ifm"."user" ADD CONSTRAINT "UQ_95346651704b18bcd60d5c2e83d" UNIQUE ("public_key")`);
        await queryRunner.query(`ALTER TABLE "ifm"."admin" ADD "public_key" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ifm"."admin" ADD CONSTRAINT "UQ_523cbba6a46aa7d6a46c5970b9f" UNIQUE ("public_key")`);
        await queryRunner.query(`ALTER TABLE "ifm"."user" ALTER COLUMN "username" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ifm"."user" ALTER COLUMN "roles" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD CONSTRAINT "FK_c7ffb7bbe5f79f1f3dea2afeb29" FOREIGN KEY ("owner_id") REFERENCES "ifm"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP CONSTRAINT "FK_c7ffb7bbe5f79f1f3dea2afeb29"`);
        await queryRunner.query(`ALTER TABLE "ifm"."user" ALTER COLUMN "roles" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ifm"."user" ALTER COLUMN "username" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ifm"."admin" DROP CONSTRAINT "UQ_523cbba6a46aa7d6a46c5970b9f"`);
        await queryRunner.query(`ALTER TABLE "ifm"."admin" DROP COLUMN "public_key"`);
        await queryRunner.query(`ALTER TABLE "ifm"."user" DROP CONSTRAINT "UQ_95346651704b18bcd60d5c2e83d"`);
        await queryRunner.query(`ALTER TABLE "ifm"."user" DROP COLUMN "public_key"`);
        await queryRunner.query(`DROP TABLE "ifm"."auction"`);
        await queryRunner.query(`DROP TYPE "ifm"."auction_status_enum"`);
        await queryRunner.query(`DROP TABLE "ifm"."player"`);
    }

}
