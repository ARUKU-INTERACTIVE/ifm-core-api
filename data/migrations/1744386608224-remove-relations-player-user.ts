import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveRelationsPlayerUser1744386608224 implements MigrationInterface {
    name = 'RemoveRelationsPlayerUser1744386608224'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP CONSTRAINT "FK_c7ffb7bbe5f79f1f3dea2afeb29"`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" DROP COLUMN "owner_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD "owner_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "ifm"."player" ADD CONSTRAINT "FK_c7ffb7bbe5f79f1f3dea2afeb29" FOREIGN KEY ("owner_id") REFERENCES "ifm"."user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
