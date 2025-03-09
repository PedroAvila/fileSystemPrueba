import { Module } from '@nestjs/common';
import { BlobStorageController } from './blob-storage.controller';
import { BlobStorageService } from './blob-storage.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plot } from './plot.entity';

@Module({
  controllers: [BlobStorageController],
  providers: [BlobStorageService],
  imports: [TypeOrmModule.forFeature([Plot])],
})
export class BlobStorageModule {}
