import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePlayer1744041692469 implements MigrationInterface {
    name = 'UpdatePlayer1744041692469'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP CONSTRAINT "UQ_42b91698abd213c7ec160a28f24"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP COLUMN "metadata_uri"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP CONSTRAINT "UQ_fff284b373faea26558095a1909"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP COLUMN "external_id"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD "description" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD "metadata_cid" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD CONSTRAINT "UQ_a7b70fd92aadd995e8afd1f2561" UNIQUE ("metadata_cid")`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD "image_cid" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD CONSTRAINT "UQ_36000e3f4b27a658137b3c6bf75" UNIQUE ("image_cid")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP CONSTRAINT "UQ_36000e3f4b27a658137b3c6bf75"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP COLUMN "image_cid"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP CONSTRAINT "UQ_a7b70fd92aadd995e8afd1f2561"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP COLUMN "metadata_cid"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP COLUMN "description"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD "external_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD CONSTRAINT "UQ_fff284b373faea26558095a1909" UNIQUE ("external_id")`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD "metadata_uri" character varying`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD CONSTRAINT "UQ_42b91698abd213c7ec160a28f24" UNIQUE ("metadata_uri")`);
    }

}
