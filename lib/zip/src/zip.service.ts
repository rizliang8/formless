import archiver from 'archiver';
import { createWriteStream } from 'fs';

export class ZipService {
  static zipDir(path: string) {
    // 压缩
    const output = createWriteStream(path + '.zip');
    const archive = archiver('zip');

    output.on('close', () => {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    output.on('end', () => {
      console.log('Data has been drained');
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function (err: any) {
      if (err.code === 'ENOENT') {
        // log warning
        console.log(err);
      } else {
        // throw error
        throw err;
      }
    });

    archive.pipe(output);

    // good practice to catch this error explicitly
    archive.on('error', function (err: any) {
      throw err;
    });

    archive.directory(path, false);

    return archive.finalize();
  }
}
