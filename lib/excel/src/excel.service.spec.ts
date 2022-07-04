import { ExcelService } from './excel.service';

describe('ExcelService', () => {
  let service: ExcelService;

  beforeEach(async () => {
    service = new ExcelService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
