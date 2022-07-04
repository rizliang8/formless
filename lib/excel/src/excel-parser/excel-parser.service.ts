import xlsx from 'node-xlsx';
import { SheetType } from '../excel-read/excel-read.service';

export class ExcelParserService {
  private titles: string[];
  private sheetList: SheetType[];
  private sheetNameIndexMap: Record<string, number> = {};

  constructor(resource: string | Buffer) {
    this.setSheetListByResource(resource);
  }

  /**
   * 初始化获取sheetlist实例
   * @param resource
   */
  private setSheetListByResource(resource: string | Buffer) {
    this.sheetList = xlsx.parse(resource, {}) as SheetType[];

    this.sheetList.forEach((sheet, index) => {
      this.sheetNameIndexMap[sheet.name] = index;
    });
  }

  getSheetIndexByName(name: string) {
    return this.sheetNameIndexMap[name];
  }

  /**
   * 生成指定 index => title map
   * @param record
   */
  makeTitleMap<T>(record: Record<string, keyof T & string>) {
    const returnMap = new Map<number, string>();

    this.titles.forEach((title, index) => {
      if (record[title]) {
        returnMap.set(index, record[title].trim());
      }
    });

    return returnMap;
  }

  /**
   * 删除空格
   * Delete space
   * @param cell
   */
  private deleteCellSpace(cell: string) {
    return cell && typeof cell === 'string' ? cell.replace(/(^\s*)|(\s*$)/g, '') : cell;
  }

  /**
   * 直接根据map生成原生对象数据
   * @param map
   * @param sheetSearch
   */
  giveMapData<T>(map: Record<string, keyof T & string>, sheetSearch: string | number = 0) {
    let sheetIndex: number;
    if (typeof sheetSearch === 'string') {
      sheetIndex = this.sheetNameIndexMap[sheetSearch];
    } else {
      sheetIndex = sheetSearch;
    }

    const targetSheet = this.sheetList[sheetIndex];
    const targetData = targetSheet.data;

    this.titles = targetData.shift();

    // console.log(`this.titles.length: ${this.titles.length}`);

    if (!this.titles?.length) {
      throw new Error(`Sheet '${targetSheet.name}' titles is not exists`);
    }

    const titleMap = this.makeTitleMap<T>(map);

    const returnData: Record<string, any>[] = [];

    targetData.forEach((row: string[]) => {
      const data: Record<string, any> = {};

      titleMap.forEach((title, index) => {
        const cell = row[index];
        data[title] = this.deleteCellSpace(cell);
      });

      returnData.push(data);
    });

    return returnData;
  }

  /**
   * Excel 日期处理
   * @param excelTimestamp
   */
  excelDateToJSDate(excelTimestamp: string) {
    return new Date(((Number(excelTimestamp) - 70 * 365 - 19) * 86400 - 8 * 3600) * 1000);
  }

  /**
   * ExcelTime to JSDate
   * @param excelTimestamp
   */
  excelTimeToJSDate(excelTimestamp: string) {
    const secondsInDay = 24 * 60 * 60;
    const excelEpoch = new Date(1899, 11, 31);
    // Get Excel Epoch time;
    const excelEpochAsUnixTimestamp = excelEpoch.getTime();
    const missingLeapYearDay = secondsInDay * 1000;
    const delta = excelEpochAsUnixTimestamp - missingLeapYearDay;
    const excelTimestampAsUnixTimestamp = Number(excelTimestamp) * secondsInDay * 1000;

    const parsed = excelTimestampAsUnixTimestamp + delta;
    return new Date(parsed);
  }
}
