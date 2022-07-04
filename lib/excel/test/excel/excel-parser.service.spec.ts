import fs from 'fs';
import path from 'path';
import { ExcelParserService } from '../../src/excel-parser/excel-parser.service';

describe('ExcelParserService', () => {
  let service: ExcelParserService;

  beforeAll(async () => {
    const fileContent = fs.readFileSync(path.join(path.resolve(), 'lib', 'test', 'test.xlsx'), 'utf8');
    service = new ExcelParserService(fileContent);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('test makeTitleMap', () => {
    // service.titles = [
    //   'First Name',
    //   'Last Name',
    //   'EmailAddress',
    //   '手机',
    //   '不要的field',
    // ];
    // expect(
    //   service.makeTitleMap({
    //     EmailAddress: 'email',
    //     'First Name': 'firstName',
    //     'Last Name': 'lastName',
    //     ['手机']: 'mobile',
    //   }),
    // ).toMatchObject(
    //   new Map([
    //     [0, 'firstName'],
    //     [1, 'lastName'],
    //     [2, 'email'],
    //     [3, 'mobile'],
    //   ]),
    // );
  });
});
