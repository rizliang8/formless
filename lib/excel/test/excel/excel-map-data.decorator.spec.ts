import fs from 'fs';
import path from 'path';
import 'reflect-metadata';
import { ExcelConf, ExcelConfMethodParams } from '../../src/decorators/excel-conf.decorator';
import { ExcelParseData } from '../../src/decorators/excel-parse-data.decorator';

describe('ExcelMapData', () => {
  it('Test', () => {
    class TestService {
      parseExcelData(params: ExcelConfMethodParams): void;

      @ExcelConf<{
        area: string;
        district: string;
      }>({
        sheetSearch: 'Test',
        fieldsMap: {
          Column1: 'area',
          Column2: 'district',
        },
      })
      parseExcelData(@ExcelParseData data: any[]) {
        return data;
      }
    }

    const testService = new TestService();
    const fileBuffer = fs.readFileSync(path.join(__dirname, '../test.xlsx'));
    const file = {
      buffer: fileBuffer,
    };
    expect(testService.parseExcelData(file)).toEqual([
      { area: 'DataA-2', district: 'DataB-2' },
      { area: 'DataA-3', district: undefined },
    ]);
  });
});
