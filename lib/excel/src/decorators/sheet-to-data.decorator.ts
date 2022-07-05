import 'reflect-metadata';
import { EXCEL_DATA_PARAM_METADATA } from '../constants';

export const SheetToData: ParameterDecorator = (target, propertyName, parameterIndex) => {
  Reflect.defineMetadata(EXCEL_DATA_PARAM_METADATA, parameterIndex, target, propertyName);
};
