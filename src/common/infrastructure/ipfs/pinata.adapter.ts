import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Blob } from 'buffer';
import { PinataSDK, UploadResponse } from 'pinata';

import { IPinataPlayerCid } from '@common/infrastructure/ipfs/application/interfaces/pinata-player-cid.interface';
import { CreateNFTDtoComplete } from '@common/infrastructure/stellar/dto/create-nft.dto';

@Injectable()
export class PinataAdapter {
  private readonly pinataJwt: string;
  private readonly pinataGatewayUrl: string;
  private readonly pinata: PinataSDK;

  constructor(private readonly environmentConfig: ConfigService) {
    this.pinataJwt = this.environmentConfig.get('pinata.pinataJwt');
    this.pinataGatewayUrl = this.environmentConfig.get(
      'pinata.pinataGatewayUrl',
    );
    this.pinata = new PinataSDK({
      pinataJwt: this.pinataJwt,
      pinataGateway: this.pinataGatewayUrl,
    });
  }

  async getPinataUriFromFile(
    file: Express.Multer.File,
  ): Promise<UploadResponse> {
    const blob = new Blob([file.buffer], {
      type: file.mimetype,
    });
    const currentFile = new File([blob], `${file.originalname}-${Date.now()}`, {
      type: file.mimetype,
    });
    return await this.pinata.upload.public.file(currentFile);
  }

  async getPinataMetadataAndImageCid(
    createNFTDtoComplete: CreateNFTDtoComplete,
  ): Promise<IPinataPlayerCid> {
    const imageUploadResult = await this.getPinataUriFromFile(
      createNFTDtoComplete.file,
    );
    const imageCid = imageUploadResult.cid;
    const metadataPayload = {
      name: createNFTDtoComplete.name,
      description: createNFTDtoComplete.description,
      image: `https://${this.pinataGatewayUrl}/ipfs/${imageCid}`,
      issuer: createNFTDtoComplete.issuer,
      code: createNFTDtoComplete.code,
    };
    const metadataUploadResult =
      await this.pinata.upload.public.json(metadataPayload);
    return {
      metadataCid: metadataUploadResult.cid,
      imageCid: imageCid,
    };
  }
}
