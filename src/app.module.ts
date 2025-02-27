import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArchivoModule } from './archivo/archivo.module';

@Module({
  imports: [ArchivoModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
