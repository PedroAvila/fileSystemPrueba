import * as path from 'path';
import * as fs from 'fs';
import { BadRequestException } from '@nestjs/common';


import { extractFull } from 'node-7z';

export class ArchivoService {
    private readonly uploadDir = path.join(process.cwd(), 'uploads');

    constructor() {
        // Crear la carpeta uploads si no existe
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async unploadFile(file: Express.Multer.File, ruc: string){

        let extractedRuc: string = "";
        const extensionsValidate: string[] = [".S01"];

        // validar si el archivo tiene un nombre valido
        if(!file || !file.originalname){
            throw new Error('El archivo no tiene un nombre válido');
        }

        const fileExtension = path.extname(file.originalname);
        // const isValidExtension = extensionsValidate.includes(fileExtension);
        // if(isValidExtension) 
        //     console.log("La extension del archivo es valida.");


        console.log(ruc);

        // extraer una subcadena
        const startIndex = 4;
        const length = 11;

        /*
        if(file.originalname.length >= startIndex + length){
            extractedRuc = file.originalname.substring(startIndex, startIndex + length);
            console.log('Cadena extraida: ', extractedRuc);
        }

        if(extractedRuc != ruc) throw new BadRequestException('El ruc no es valido');
        */

        // usar la raiz del proyecto para obtener la carpeta uploads
        const uploadDir = path.join(process.cwd(), 'uploads')

        // crear la carpeta uploads si no existe
        if(!fs.existsSync(uploadDir)){
            fs.mkdirSync(uploadDir, {recursive: true});
        }

        // ruta donde guardaras el archivo recibido
        const originalPath = path.join(uploadDir, file.originalname);
        console.log('Ruta original: ', originalPath);

        // guardar el archivo recibido
        fs.writeFileSync(originalPath, file.buffer);

        const fileType = await this.identifyFileFormat(originalPath);
        console.log(`Tipo detectado: ${fileType}`);

        // const files = await decompress(newFilePath, uploadDir);
        if (fileType === 'ZIP') {
            const password = '123456';
            await this.extractZipWithPassword(originalPath, this.uploadDir, password);
        }
        
        return { message: 'Archivo recibido y descomprimido' };
    }

    async identifyFileFormat(filePath: string): Promise<string> {
        const signatures: { [key: string]: number[] } = {
            'ZIP': [0x50, 0x4B, 0x03, 0x04],
            'GZIP': [0x1F, 0x8B, 0x08],
            'TAR': [0x75, 0x73, 0x74, 0x61, 0x72],
            '7Z': [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C],
            'RAR': [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07],
        };
    
        // Leer los primeros bytes del archivo
        const buffer = fs.readFileSync(filePath).subarray(0, 6);
    
        for (const [format, signature] of Object.entries(signatures)) {
            if (buffer.subarray(0, signature.length).equals(Buffer.from(signature))) {
                return format;
            }
        }
    
        return 'Desconocido';
    }

    async extractZipWithPassword(zipPath: string, outputDir: string, password: string) {
        return new Promise<void>((resolve, reject) => {
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
    
            const sevenZip = extractFull(zipPath, outputDir, {
                password,
                $bin: "C:\\Program Files\\7-Zip\\7z.exe", // Ruta en Windows (ajustar según el sistema)
            });
    
            sevenZip.on('end', () => {
                console.log('Archivos extraídos correctamente');
                resolve();
            });
    
            sevenZip.on('error', (err) => {
                console.error('Error al descomprimir el ZIP:', err);
                reject(err);
            });
        });
    }
}




