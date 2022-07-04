import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

export type Params = { dirname: string; affix: string; filenamePrefix?: string; datePrefix?: string };

/**
 * privatePath = resolve/private
 * dirPath = resolve/private/${dirname}
 * getDatePath = resolve/private/ {dirname} / {datePrefix} {date}
 * getFilePath = resolve/private/ {dirname} / {datePrefix} {date}/${date} ${name}
 */
@Injectable()
export class PrivatePathService {
  private privatePath = join(resolve(), 'private');
  private dirPath: string;
  private datePrefix: string;
  private affix: string;
  private filenamePrefix: string;

  constructor(input: Params) {
    const dirname = input.dirname;
    const affix = input.affix;
    const filenamePrefix = input.filenamePrefix;
    const datePrefix = input.datePrefix;

    this.dirPath = join(this.privatePath, dirname);
    this.affix = affix;
    this.datePrefix = datePrefix;
    this.filenamePrefix = filenamePrefix;
  }

  checkAndMakeFile(date: string) {
    // {$resolve}/private
    if (!existsSync(this.privatePath)) {
      mkdirSync(this.privatePath);
    }
    // {$resolve}/private/${dirPath}
    if (!existsSync(this.dirPath)) {
      mkdirSync(this.dirPath);
    }
    // {$resolve}/private/${excelPath}/${date}
    if (!existsSync(this.getDateDirPath(date))) {
      mkdirSync(this.getDateDirPath(date));
    }
  }

  /**
   * dirPath = resolve/private/ ${dirname}
   * @returns
   */
  getDirPath() {
    return this.dirPath;
  }

  /**
   * resolve/private/${dirname}/ ${datePrefix} {$date}
   * @param date
   * @returns
   */
  getDateDirPath(date: string) {
    if (this.datePrefix) {
      date = `${this.datePrefix}_${date}`;
    }
    return join(this.dirPath, date);
  }

  getZipPath(date: string) {
    return `${this.getDateDirPath(date)}.zip`;
  }

  /**
   * resolve/private/${dirname}/ ${datePrefix} ${$date}/ ${date} ${name}
   * @param date
   * @param name
   * @returns
   */
  getFilePath(date: string) {
    return join(this.getDateDirPath(date), `${this.filenamePrefix}_${date}${this.affix}`);
  }

  downloadZipByDate(date: string, downloadFileName: string, response: Response) {
    const zipPath = this.getZipPath(date);
    /**
     * check file exits
     */
    if (!existsSync(zipPath)) {
      return response.json({
        success: false,
        message: 'File not Found',
      });
    }
    /**
     * read file and send to client
     */
    const buffer = readFileSync(zipPath);
    response.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(downloadFileName)}.zip`);

    return response.send(buffer);
  }

  /**
   * 下载
   * @param date
   * @param downloadFileName
   * @param response
   * @returns
   */
  downloadFileByDate(date: string, downloadFileName: string, response: Response) {
    /**
     * check file exits
     */
    if (!existsSync(this.getFilePath(date))) {
      return response.json({
        success: false,
        message: 'File not Found',
      });
    }
    /**
     * read file and send to client
     */
    const buffer = readFileSync(this.getFilePath(date));
    response.setHeader(
      'Content-Disposition',
      `attachment; filename=${encodeURIComponent(downloadFileName)}${this.affix}`,
    );

    return response.send(buffer);
  }
}
