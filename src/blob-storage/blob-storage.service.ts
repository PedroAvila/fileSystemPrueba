import { BlobServiceClient, BlockBlobClient } from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Plot } from './plot.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as path from 'path';

@Injectable()
export class BlobStorageService {
  private readonly blobServiceClient: BlobServiceClient;
  private readonly containerName: string = 'tramas';

  constructor(
    @InjectRepository(Plot)
    private readonly plotRepository: Repository<Plot>,
  ) {
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING || '';
    this.blobServiceClient =
      BlobServiceClient.fromConnectionString(connectionString);
  }

  async uploadPlot(file: Express.Multer.File): Promise<void> {
    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    await containerClient.createIfNotExists();

    const blobClient: BlockBlobClient = containerClient.getBlockBlobClient(
      file.originalname,
    );

    // guarda la metadata en la db
    const dto = new Plot();
    dto.name = file.originalname;
    dto.size = file.size;
    dto.extension = path.extname(file.originalname);

    const newPlot = this.plotRepository.create(dto);
    const entity = await this.plotRepository.save(newPlot);

    await blobClient.uploadData(file.buffer);
    console.log('Archivo subido correctamente');
  }

  async downLoadPlotById(id: string): Promise<string> {
    const plot = await this.plotRepository.findOne({ where: { id } });
    if (!plot) {
      throw new Error('Plot not found');
    }

    console.log(`Descargando archivo ${plot.name}`);

    const containerClient = this.blobServiceClient.getContainerClient(
      this.containerName,
    );
    const blobClient: BlockBlobClient = containerClient.getBlockBlobClient(
      plot.name,
    );
    const download = await blobClient.download();
    const fileBuffer = this.streamToBuffer(download.readableStreamBody);
    const fileContent = (await fileBuffer).toString('utf-8');
    console.log(`Contenido del archivo: ${fileContent}`);
    return fileContent;
  }

  private async streamToBuffer(
    readableStream: NodeJS.ReadableStream | null,
  ): Promise<Buffer> {
    if (!readableStream) throw new Error('El stream de datos es nulo');

    const chunks: Buffer[] = [];
    for await (const chunk of readableStream) {
      chunks.push(chunk as Buffer);
    }

    return Buffer.concat(chunks);
  }
}
