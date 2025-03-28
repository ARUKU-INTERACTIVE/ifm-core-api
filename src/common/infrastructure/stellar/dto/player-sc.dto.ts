export interface ISCPlayerDto {
  is_in_auction: boolean;
  issuer: string;
  last_auction: null | bigint;
  name: string;
  owner: string;
  token_id: bigint;
  metadata_uri: string;
}
