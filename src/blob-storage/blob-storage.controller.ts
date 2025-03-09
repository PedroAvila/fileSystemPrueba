import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { BlobStorageService } from './blob-storage.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('tramas')
export class BlobStorageController {
  constructor(private readonly blobStorageService: BlobStorageService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadPlot(@UploadedFile() file: Express.Multer.File): Promise<void> {
    return await this.blobStorageService.uploadPlot(file);
  }

  @Get(':id')
  async downloadPlotById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<string> {
    return await this.blobStorageService.downLoadPlotById(id);
  }
}
