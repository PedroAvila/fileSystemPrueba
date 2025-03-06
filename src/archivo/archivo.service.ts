import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

@Injectable()
export class ArchivoService {
  private sevenZipPath = 'C:\\Program Files\\7-Zip\\7z.exe';

  async unploadFile(file: Express.Multer.File) {
    const archivoExtraido = await this.extractZipBuffer(file.buffer, '123456');
    console.log('Archivos extraidos', { archivoExtraido });

    for (const [fileName, fileBuffer] of archivoExtraido) {
      console.log(`${fileName}: ${fileBuffer.toString('utf-8')}`);
    }

    return archivoExtraido;
  }

  private async extractZipBuffer(
    zipBuffer: Buffer,
    password: string,
  ): Promise<Map<string, Buffer>> {
    console.log(zipBuffer);
    return new Promise((resolve, reject) => {
      const extractedFiles = new Map<string, Buffer>(); // Map para almacenar archivos en memoria

      // Crear un archivo ZIP temporal en una carpeta temporal
      const tempZipPath = path.join(os.tmpdir(), `temp_${Date.now()}.zip`);
      console.log(tempZipPath);
      fs.writeFileSync(tempZipPath, zipBuffer);

      // Crear una carpeta temporal para la extracción
      const tempExtractPath = path.join(os.tmpdir(), `extract_${Date.now()}`);
      fs.mkdirSync(tempExtractPath, { recursive: true });

      // Ejecutar 7-Zip para extraer
      const process = spawn(this.sevenZipPath, [
        'x',
        tempZipPath,
        `-p${password}`,
        `-o${tempExtractPath}`,
        '-y',
      ]);

      let errorData: Buffer[] = [];

      process.stderr.on('data', (chunk) => errorData.push(chunk)); // Capturar errores

      process.on('close', (code) => {
        if (code === 0) {
          this.readFilesRecursively(tempExtractPath, extractedFiles);

          // Limpiar archivos temporales
          fs.unlinkSync(tempZipPath);
          fs.rmSync(tempExtractPath, { recursive: true, force: true });

          resolve(extractedFiles);
        } else {
          reject(
            new Error(
              `Error al descomprimir: ${Buffer.concat(errorData).toString()}`,
            ),
          );
        }
      });
    });
  }

  private readFilesRecursively(
    directory: string,
    extractedFiles: Map<string, Buffer>,
  ) {
    const items = fs.readdirSync(directory);
    for (const item of items) {
      const itemPath = path.join(directory, item);
      const stat = fs.statSync(itemPath);

      if (stat.isFile()) {
        extractedFiles.set(item, fs.readFileSync(itemPath));
      } else if (stat.isDirectory()) {
        this.readFilesRecursively(itemPath, extractedFiles);
      }
    }
  }
}
