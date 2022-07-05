import { NotFoundException } from '@nestjs/common';
import express from 'express';
import fs from 'fs';
import { join, resolve } from 'path';
import supertest from 'supertest';
import { PrivatePathService } from '../src';

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

  it('checkAndMakeFile', () => {
    service = new PrivatePathService({ dirname, affix, filenamePrefix, datePrefix });
    service.checkAndMakeFile('test_date');
  });

  it('downloadFileByDate, File not found', (done) => {
    const app = express();
    service = new PrivatePathService({ dirname, affix, filenamePrefix, datePrefix });
    service.checkAndMakeFile('test_date');

    app.use((_, res) => {
      service.downloadFileByDate('test_date', 'File not found', res);
    });

    supertest(app).get('/').expect({ success: false, message: 'File not found' }, done);
  });

  it('downloadFileByDate success', (done) => {
    const app = express();
    service = new PrivatePathService({ dirname, affix: '.txt', filenamePrefix, datePrefix });
    service.checkAndMakeFile('test_date');

    fs.writeFileSync(service.getFilePath('test_date'), 'any', 'utf8');

    app.use((_, res) => {
      service.downloadFileByDate('test_date', 'hello', res);
    });

    supertest(app)
      .get('/')
      .expect('Content-Type', 'application/octet-stream')
      .expect('Content-Disposition', 'attachment; filename=hello.txt')
      .expect(Buffer.from('any'), done);
  });

  it('downloadZipByDate, File not found', (done) => {
    const app = express();
    service = new PrivatePathService({ dirname, affix: '.txt', filenamePrefix, datePrefix });

    app.use((_, res) => {
      service.downloadZipByDate('NotFound', 'hello', res);
    });

    supertest(app).get('/').expect({ success: false, message: 'File not found' }, done);
  });

  it('downloadZipByDate File', (done) => {
    const app = express();
    service = new PrivatePathService({ dirname, affix: '.txt', filenamePrefix, datePrefix });
    service.checkAndMakeFile('test_date');

    fs.writeFileSync(service.getZipPath('test_date'), 'any', 'utf8');

    app.use((_, res) => {
      service.downloadZipByDate('test_date', 'hello', res);
    });

    supertest(app)
      .get('/')
      .expect('Content-Type', 'application/octet-stream')
      .expect('Content-Disposition', 'attachment; filename=hello.zip')
      .expect(Buffer.from('any'), done);
  });
});
