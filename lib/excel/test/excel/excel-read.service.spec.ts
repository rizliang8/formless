import { ExcelReadService } from '../../src/excel-read/excel-read.service';

describe('ExcelReadService', () => {
  let service: ExcelReadService;

  beforeEach(async () => {
    service = new ExcelReadService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
