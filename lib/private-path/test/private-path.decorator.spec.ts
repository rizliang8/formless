import { PrivatePath, PrivatePathInterface, PrivatePathService } from '../src';

describe('PrivatePathDecorator', () => {
  it('Should has privatePathService property', () => {
    interface TestService extends PrivatePathInterface {}

    @PrivatePath({
      dirname: '',
      affix: '.xlsx',
      filenamePrefix: '',
      datePrefix: ',',
    })
    class TestService {}

    const testService = new TestService();

    expect(testService.privatePathService).toBeInstanceOf(PrivatePathService);
  });
});
