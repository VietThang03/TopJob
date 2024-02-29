import { Injectable } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import fs, { mkdir }  from 'fs';
import { diskStorage } from 'multer';
import path, { basename, extname, join } from 'path';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {

  // Doi ten file upload va cau hinh noi luu tru file
  createMulterOptions(): MulterModuleOptions {
    return {
      // diskStorage ==> luu anh trong o dia
      storage: diskStorage({
        // fnc destination ==> Noi muon luu tru file
        // destination: './upload',
        destination: (req, file, cb) => {
          const folder = req?.headers?.folder_type ?? 'default';
          this.ensureExists(`public/uploads/${folder}`);
          cb(null, `public/uploads/${folder}`);
        },
        // fnc filename ==> doi ten file vua upload
        filename: (req, file, cb) => {
          //get image extension
          let extName = extname(file.originalname);
          //get image's name (without extension)
          let baseName = basename(file.originalname, extName);
          let finalName = `${baseName}-${Date.now()}${extName}`;
          cb(null, finalName);
        },
      }),
    };
  }

  // fnc lay duong dan goc
  getRootPath = () => {
    return process.cwd();
  };

  //Check xem thu muc luu file upload ton tai hay chua, neu ton tai => ko tao, neu chua ton tai => tao thu muc upload
   ensureExists(targetDirectory: string) {
     mkdir(targetDirectory, { recursive: true }, (error) => {
      if (!error) {
        console.log('Directory successfully created, or it already exists.');
        return;
      }
      switch (error.code) {
        case 'EEXIST':
          // Error:
          // Requested location already exists, but it's not a directory.
          break;
        case 'ENOTDIR':
          // Error:
          // The parent hierarchy contains a file with the same name as the dir
          // you're trying to create.
          break;
        default:
          // Some other error like permission denied.
          console.error(error);
          break;
      }
    });
  }

}
