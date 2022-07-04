import { join, resolve } from 'path';
import { PrivatePathService } from './private-path.service';

describe('PrivatePathService', () => {
  const dirname = 'test_dir';
  const affix = '.zip';
  const datePrefix = 'date_prefix';
  const testDate = '2022-06-10';
  const filenamePrefix = 'project';
  let service: PrivatePathService;

  beforeEach(() => {
    service = new PrivatePathService({ dirname, affix, filenamePrefix });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Dirname path', () => {
    const dateDirPath = service.getDirPath();
    expect(dateDirPath).toBe(join(resolve(), 'private', dirname));
  });

  it('Date Dir path without date_prefix', () => {
    const dateDirPath = service.getDateDirPath(testDate);
    expect(dateDirPath).toBe(join(resolve(), 'private', dirname, testDate));
  });

  it('Get Zip path', () => {
    const zipPath = service.getZipPath(testDate);
    expect(zipPath).toBe(join(resolve(), 'private', dirname, `${testDate}.zip`));
  });

  it('Date Dir path with date_prefix', () => {
    service = new PrivatePathService({ dirname, affix, filenamePrefix, datePrefix });
    const dateDirPath = service.getDateDirPath(testDate);
    expect(dateDirPath).toBe(join(resolve(), 'private', dirname, `${datePrefix}_${testDate}`));
  });

  it('find sub file path', () => {
    service = new PrivatePathService({ dirname, affix, filenamePrefix, datePrefix });
    const dateDirPath = service.getFilePath(testDate);
    expect(dateDirPath).toBe(
      join(resolve(), 'private', dirname, `${datePrefix}_${testDate}`, `${filenamePrefix}_${testDate}${affix}`),
    );
  });
});
