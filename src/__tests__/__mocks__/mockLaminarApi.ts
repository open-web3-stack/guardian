jest.mock('@laminar/api');

import { from } from 'rxjs';
import { LaminarApi } from '@laminar/api';

export default (methods: object) => {
  // @ts-ignore
  LaminarApi.mockImplementation(() => {
    return {
      constructor: jest.fn(),
      isReady: jest.fn(() => Promise.resolve()),
      ...methods,
    };
  });
};
