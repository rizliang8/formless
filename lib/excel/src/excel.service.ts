import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { writeFileSync } from 'fs';
import xlsx from 'node-xlsx';

type CellDataType = (string | number)[];
type SheetType = CellDataType[];
type SheetList = Record<string, SheetType>;

@Injectable()
export class ExcelService {
  xlsxData: SheetList = {};

  /**
   * Push the string array as the Excel first row.
   * @param titles
   * @param sheetName
   */
  createDataByTitles(titles: string[], sheetName = 'sheet1') {
    if (!this.xlsxData[sheetName]) {
      this.xlsxData[sheetName] = [];
    }
    this.xlsxData[sheetName].push(titles);

    return this.xlsxData;
  }

  /**
   * Push the data to Excel cell.
   * @param resources
   * @param createDataMethod
   * @param sheetName
   */
  pushResourceToData<T>(resources: T[], createDataMethod: (resource: T) => (string | number)[], sheetName = 'sheet1') {
    resources.forEach((resource) => {
      const data = createDataMethod(resource);
      this.xlsxData[sheetName].push(data);
    });
  }

  /**
   * Build an Excel buffer.
   * When setting up a header,
   * return this buffer in controller so that user can download the Excel
   * @param res
   * @param filename
   * @return Buffer
   */
  build(res: Response, filename: string) {
    this.setBasicHeader(res, filename);

    const buildData = Object.keys(this.xlsxData).reduce((store, sheetName) => {
      store.push({
        name: sheetName,
        data: this.xlsxData[sheetName],
      });

      return store;
    }, []);

    return xlsx.build(buildData);
  }

  /**
   * Set the header so that the browser can know it's to download a file.
   * @param res
   * @param filename
   */
  setBasicHeader(res: Response, filename: string) {
    res.setHeader('Content-Type', 'application/vnd.openxmlformats;charset=utf-8');

    res.setHeader('Content-Disposition', `attachment; filename=${encodeURIComponent(filename)}.xlsx`);
  }

  writeFile(path: string) {
    const buildData = Object.keys(this.xlsxData).reduce((store, sheetName) => {
      store.push({
        name: sheetName,
        data: this.xlsxData[sheetName],
      });

      return store;
    }, []);

    const buffer = xlsx.build(buildData);

    writeFileSync(path, new Uint8Array(buffer));
  }
}
