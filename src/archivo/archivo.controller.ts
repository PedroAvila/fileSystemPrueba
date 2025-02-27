import { Body, Controller, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { ArchivoService } from "./archivo.service";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('files')
export class ArchivoController {

    constructor(
        private readonly archivoService: ArchivoService
    ){}

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('ruc') ruc: string){
        return await this.archivoService.unploadFile(file);
    }



}


