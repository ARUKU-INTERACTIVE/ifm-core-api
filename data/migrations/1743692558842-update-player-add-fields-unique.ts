import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatePlayerAddFieldsUnique1743692558842 implements MigrationInterface {
    name = 'UpdatePlayerAddFieldsUnique1743692558842'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD CONSTRAINT "UQ_42b91698abd213c7ec160a28f24" UNIQUE ("metadata_uri")`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD CONSTRAINT "UQ_fff284b373faea26558095a1909" UNIQUE ("external_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP CONSTRAINT "UQ_fff284b373faea26558095a1909"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP CONSTRAINT "UQ_42b91698abd213c7ec160a28f24"`);
    }

}
