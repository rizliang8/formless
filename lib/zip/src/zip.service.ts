import archiver from 'archiver';
import { createWriteStream } from 'fs';

export class ZipService {
  static zipDir(path: string) {
    const output = createWriteStream(path + '.zip');
    const archive = archiver('zip');

    output.on('close', () => {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');
    });

    output.on('end', () => {
      console.log('Data has been drained');
    });

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

    archive.on('error', function (err: any) {
      throw err;
    });

    archive.directory(path, false);

    return archive.finalize();
  }
}
