export interface ICreatePlayerDto {
  name: string;
  metadataUri?: string;
}

export interface IPlayerDto extends ICreatePlayerDto {
  owner?: string;
  ownerId?: number;
  issuer?: string;
  externalId?: number;
}
