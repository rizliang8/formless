import { Response } from 'express';
import { Params, PrivatePathService } from './private-path.service';

type SomeConstructor = {
  new (...args: any[]): any;
};

export interface PrivatePathInterface {
  privatePathService: PrivatePathService;
  // downloadByDate(date: string, downloadFileName: string, response: Response): Response;
}

/**
 * Description: 需要继承
 * @param data
 * @returns
 */
export const PrivatePath =
  (data: Params) =>
  <T extends SomeConstructor>(constructor: T) => {
    return class g extends constructor {
      privatePathService = new PrivatePathService(data);
      // downloadFileByDate = this.privatePathService.downloadFileByDate;
      // downloadZipByDate = this.privatePathService.downloadZipByDate;
    };
  };
