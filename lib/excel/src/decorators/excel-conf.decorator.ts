import { isUndefined } from '../../../formless/src';
import { EXCEL_DATA_PARAM_METADATA } from '../constants';
import { ExcelParserService } from '../';

/**
 * Excel data param.
 */
export type ExcelConfMethodDataParam = { data: string[][] }[];
/**
 * File or Excel data param.
 */
export type ExcelConfMethodParams = Required<{ buffer: Buffer }> | ExcelConfMethodDataParam;

export type ExcelConfigType<T> = {
  sheetSearch?: string | number;
  fieldsMap: Record<string, keyof T & string>;
};

export const ExcelConf =
  <T>(config: ExcelConfigType<T>) =>
  (target: any, propertyKey: string | symbol, descriptor: any) => {
    const originalMethod = descriptor.value;
    /**
     * Get config data param index
     */
    const excelDataParameterIndex = Reflect.getOwnMetadata(EXCEL_DATA_PARAM_METADATA, target, propertyKey);
    if (!isUndefined(excelDataParameterIndex)) {
      descriptor.value = (
        file: Required<{
          buffer: Buffer;
        }>,
      ) => {
        const applyParams: any[] = [];

        const sheetSearch = config.sheetSearch || 0;
        const excelParserService = new ExcelParserService(file.buffer);
        const data = excelParserService.giveMapData<T>(config.fieldsMap, sheetSearch);

        applyParams[excelDataParameterIndex] = data;
        return originalMethod.apply(this, applyParams);
      };

      return descriptor;
    }
  };
