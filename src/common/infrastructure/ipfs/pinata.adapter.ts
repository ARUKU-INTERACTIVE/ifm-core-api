import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Blob } from 'buffer';
import { PinataSDK, UploadResponse } from 'pinata';

@Injectable()
export class PinataAdapter {
  private readonly pinataJwt: string;
  readonly pinataGatewayUrl: string;
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

  async uploadFIle(file: Express.Multer.File): Promise<UploadResponse> {
    const blob = new Blob([file.buffer], {
      type: file.mimetype,
    });
    const currentFile = new File([blob], `${file.originalname}-${Date.now()}`, {
      type: file.mimetype,
    });
    return await this.pinata.upload.public.file(currentFile);
  }

  async uploadJson(json: Record<string, unknown>): Promise<UploadResponse> {
    return await this.pinata.upload.public.json(json);
  }
}
