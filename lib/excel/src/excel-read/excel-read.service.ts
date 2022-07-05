import * as iconv from 'iconv-lite';
import xlsx from 'node-xlsx';

export type SheetType = {
  name: string;
  data: string[][];
};

export class ExcelReadService {
  /**
   * Excel time format to Javascript date
   * @param excelTimestamp
   * @returns
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
    console.log('delta', delta, excelTimestampAsUnixTimestamp, parsed);

    console.log(Number(excelTimestamp));
    return new Date(parsed);
  }

  excelDateToJSDate(excelTimestamp: string) {
    return new Date(((Number(excelTimestamp) - 70 * 365 - 19) * 86400 - 8 * 3600) * 1000);
  }

  /**
   * For each titles to give row data to result data
   * @param titles
   * @param row
   */
  forInGiveData(titles: string[], row: string[]) {
    const data: Record<string, string> = {};
    titles.forEach((title, index) => {
      const cell = row[index];
      if (cell && typeof cell === 'string') {
        data[title] = cell.replace(/(^\s*)|(\s*$)/g, '');
      } else {
        data[title] = cell;
      }
    });

    return data;
  }

  /**
   * Get sheet list by resource
   * @param resource
   */
  parseSheetList(resource: string | Buffer): {
    name: string;
    data: string[][];
  }[] {
    return xlsx.parse(resource, {
      // cellDates: true,
    }) as SheetType[];
  }

  /**
   * Make the capital of word to lowercase.
   * Most used for the first word.
   * @param word
   */
  parseCapitalToLowerCase(word: string): string {
    const pieces = word.split('');
    pieces[0] = pieces[0].toLowerCase();
    return pieces.join('');
  }

  /**
   * Make the capital of word to uppercase.
   * Most used for the second word and after.
   * @param word
   */
  parseCapitalToUpperCase(word: string): string {
    const pieces = word.split('');
    pieces[0] = pieces[0].toUpperCase();
    return pieces.join('');
  }

  /**
   * Split the word by space.
   * @param word
   */
  splitSpace(word: string): string[] {
    return word.split(' ');
  }

  /**
   * Split the word by space.
   * @param word
   */
  splitDash(word: string): string[] {
    return word.split('_');
  }

  /**
   * 映射title成为Entity 的 key
   * @param titles
   * @param map
   */
  parseTitleMatchEntity<T>(titles: string[], map?: Record<string, keyof T & string>) {
    console.log(titles, map);

    const set = new Set<number>();

    // 如果有映射就映射
    if (map) {
      titles.forEach((title, index) => {
        if (map[title]) {
          titles[index] = map[title];
          set.add(index);
        }
      });
    }

    titles.forEach((_, index) => {
      // 映射过了就不操作了
      if (set.has(index)) {
        return;
      }
      // 'First second Third' => ['First', 'second', 'Third'];
      let words = this.splitSpace(titles[index]);
      words.forEach((word, innerIndex) => {
        // 'First' => 'first'
        if (innerIndex === 0) {
          words[innerIndex] = this.parseCapitalToLowerCase(word);
        }
        // 'Second' => 'second', 'Third' => 'Third'
        else {
          words[innerIndex] = this.parseCapitalToUpperCase(word);
        }
      });

      // ['first', 'Second', 'Third'] = 'firstSecondThird'
      titles[index] = words.join('');

      words = this.splitDash(titles[index]);
      words.forEach((word, innerIndex) => {
        // 'First' => 'first'
        if (innerIndex === 0) {
          words[innerIndex] = this.parseCapitalToLowerCase(word);
        }
        // 'Second' => 'second', 'Third' => 'Third'
        else {
          words[innerIndex] = this.parseCapitalToUpperCase(word);
        }
      });

      titles[index] = words.join('');
    });

    return titles;
  }

  /**
   * 指定哪些文本需要转码
   * @param data
   * @param parseFields
   */
  parseDecode(data: Record<string, string>, parseFields: string[]) {
    parseFields.forEach((field) => {
      // encoding : gbk/utf-8
      data[field] = iconv.decode(Buffer.from(data[field], 'binary'), 'utf-8');
    });
  }

  shiftSheetTitle(sheet: SheetType) {
    return sheet.data.shift();
  }
}
