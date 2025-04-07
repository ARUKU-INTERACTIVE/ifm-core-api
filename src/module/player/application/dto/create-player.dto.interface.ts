export interface ICreatePlayerDto {
  name: string;
  description: string;
  metadataCid?: string;
  imageCid?: string;
  owner?: string;
  ownerId?: number;
  issuer?: string;
  isInAuction?: boolean;
}
