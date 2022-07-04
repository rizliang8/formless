import 'reflect-metadata';

const requiredMetadataKey = 'DDD';

describe('Test', () => {
  function required(target: any, propertyKey: string | symbol, parameterIndex: number) {
    const existingRequiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyKey) || [];
    existingRequiredParameters.push(parameterIndex);
    Reflect.defineMetadata(requiredMetadataKey, existingRequiredParameters, target, propertyKey);
  }

  function validate(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
    const method = descriptor.value!;

    descriptor.value = function () {
      const requiredParameters: number[] = Reflect.getOwnMetadata(requiredMetadataKey, target, propertyName);
      console.log('requiredParameters', requiredParameters);
      if (requiredParameters) {
        for (const parameterIndex of requiredParameters) {
          // eslint-disable-next-line prefer-rest-params
          if (parameterIndex >= arguments.length || arguments[parameterIndex] === undefined) {
            throw new Error('Missing required argument.');
          }
        }
      }
      // eslint-disable-next-line prefer-rest-params
      return method.apply(this, arguments);
    };
  }

  it('print', () => {
    class BugReport {
      type = 'report';
      title: string;

      constructor(t: string) {
        this.title = t;
      }

      @validate
      print(other: string, @required verbose: boolean) {
        if (verbose) {
          console.log(`type: ${this.type}\ntitle: ${this.title}`);
        } else {
          console.log(this.title);
        }
      }
    }

    const bugReport = new BugReport('title');
    bugReport.print('other', false);
  });
});
