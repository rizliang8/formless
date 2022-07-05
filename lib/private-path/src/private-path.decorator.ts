import { PrivatePathService, PrivatePathServiceParams } from './';

type SomeConstructor = {
  new (...args: any[]): any;
};

export interface PrivatePathInterface {
  privatePathService: PrivatePathService;
}

/**
 * Description: 需要继承
 * @param data
 * @returns
 */
export const PrivatePath =
  (data: PrivatePathServiceParams) =>
  <T extends SomeConstructor>(constructor: T) => {
    return class g extends constructor {
      privatePathService = new PrivatePathService(data);
    };
  };
