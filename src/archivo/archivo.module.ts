import { Module } from '@nestjs/common';
import { ArchivoController } from './archivo.controller';
import { ArchivoService } from './archivo.service';

@Module({
    controllers: [ArchivoController],
    providers: [ArchivoService]
})
export class ArchivoModule {}
