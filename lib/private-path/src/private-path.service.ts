import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

export type PrivatePathServiceParams = { dirname: string; affix: string; filenamePrefix?: string; datePrefix?: string };

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

  constructor(input: PrivatePathServiceParams) {
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

  /**
   *
   * @param date
   * @param downloadFileName
   * @param response
   * @returns
   */
  downloadZipByDate(date: string, downloadFileName: string, res: Response) {
    const zipPath = this.getZipPath(date);
    /**
     * check file exits
     */
    if (!existsSync(zipPath)) {
      return res.json({
        success: false,
        message: 'File not found',
      });
    }
    /**
     * read file and send to client
     */
    const buffer = readFileSync(zipPath);
    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(downloadFileName)}.zip`);

    return res.send(buffer);
  }

  /**
   * 下载
   * @param date
   * @param downloadFileName
   * @param response
   * @returns
   */
  downloadFileByDate(date: string, downloadFileName: string, res: Response) {
    try {
      const filePath = this.getFilePath(date);
      /**
       * check file exits
       */
      if (!existsSync(filePath)) {
        return res.json({
          success: false,
          message: 'File not found',
        });
      }
      /**
       * read file and send to client
       */
      const buffer = readFileSync(filePath);
      res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(downloadFileName)}${this.affix}`);

      return res.send(buffer);
    } catch (err) {
      console.dir(err);
    }
  }
}
