import fs from 'fs';
import path from 'path';
import { ExcelParserService } from '../../src';

describe('ExcelParserService', () => {
  let service: ExcelParserService;

  beforeAll(async () => {
    const fileContent = fs.readFileSync(path.join(__dirname, '../test.xlsx'));
    service = new ExcelParserService(fileContent);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('makeTitleMap', () => {
    service.setTitles(['First Name', 'Last Name', 'EmailAddress', '手机', 'unneed field']);
    expect(
      service.makeTitleMap({
        EmailAddress: 'email',
        'First Name': 'firstName',
        'Last Name': 'lastName',
        ['手机']: 'mobile',
      }),
    ).toMatchObject(
      new Map([
        [0, 'firstName'],
        [1, 'lastName'],
        [2, 'email'],
        [3, 'mobile'],
      ]),
    );
  });

  it('giveMapData', () => {
    const data = service.giveMapData<{
      area: string;
      district: string;
    }>(
      {
        Column1: 'area',
        Column2: 'district',
      },
      'Test',
    );

    expect(data).toEqual([
      { area: 'DataA-2', district: 'DataB-2' },
      { area: 'DataA-3', district: undefined },
    ]);
  });
});
