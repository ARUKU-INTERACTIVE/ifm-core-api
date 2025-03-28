export interface ICreatePlayerDto {
  name: string;
  metadataUri?: string;
  owner?: string;
  ownerId?: number;
  issuer?: string;
  externalId?: number;
}
