const {
  flattenArr,
  dataFetcher,
  createList,
  formatCurrency,
  handlePromises
} = require('./helpers.js');
const axios = require('axios');

jest.mock('axios', () => ({
  get: jest.fn()
}));

describe('flattenArr', () => {
  it('return a non-nested arr', () => {
    const input = [1, 2, 3, 4];
    const expectedOutput = [1, 2, 3, 4];

    expect(flattenArr(input)).toEqual(expectedOutput);
  });

  it('flattens a nested arr', () => {
    const input = [1, 2, 3, [4, 5, [6, 7, [8, [9, [10]]]]]];
    const expectedOutput = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    expect(flattenArr(input)).toEqual(expectedOutput);
  });
});

describe('dataFetcher', () => {
  it('handles a successful response', async () => {
    axios.get.mockImplementation(() => Promise.resolve({ data: { users: [] } }));

    const data = await dataFetcher();

    expect(data).toEqual({ data: { users: [] } });
  });

  it('handles an error response', async () => {
    axios.get.mockImplementation(() => Promise.reject('Boom'));

    try {
      await dataFetcher();
    } catch (e) {
      expect(e).toEqual(new Error({ error: 'Boom', message: 'An Error Occurred' }));
    }
  });
});

describe('createList', () => {
  it('calls a sorter function if it is available', () => {
    const sortFn = jest.fn();

    createList([3, 2, 1], sortFn);

    expect(sortFn).toBeCalled();
    expect(sortFn.mock.calls).toEqual([[[3, 2, 1]]]);
  });

  it('does not call a sorter function if the array has a length <= 1', () => {
    const sortFn = jest.fn();

    createList([1], sortFn);

    expect(sortFn).not.toBeCalled();
  });

  it('calls the sorter fn', () => {
    const tests = [
      //arr       sortFn     expected
      [[2, 3, 1], jest.fn(), true],
      [[], jest.fn(), false],
      [[1], jest.fn(), false]
    ];

    tests.forEach((test) => {
      const [arr, sortFn, expected] = test;

      createList(arr, sortFn);
      if (expected) {
        expect(sortFn).toBeCalled();
      }

      if (!expected) {
        expect(sortFn).not.toBeCalled();
      }
    });
  });
});

/**
 * Add you test/s here and get this helper file to 100% test coverage!!!
 * You can check that your coverage meets 100% by running `npm run test:coverage`
 */

describe('formatCurrency', () => {
  it('formats currency', () => {
    expect(formatCurrency(2)).toEqual('$2.00');
    expect(formatCurrency('dog')).toEqual('$0.00');
  });
});

describe('handlePromises', () => {
  it('resolves all promises', async () => {
    const promise1 = new Promise((res, rej) => {
      return res('HELLO');
    });

    const promise2 = new Promise((res, rej) => {
      return res('WORLD');
    });

    const data = await handlePromises([promise1, promise2]);
    expect(data).toEqual(['HELLO', 'WORLD']);
  });

  it('handles rejected promises', async () => {
    const promise1 = new Promise((res, rej) => {
      return rej('ERROR');
    });

    const promise2 = new Promise((res, rej) => {
      return res('WORLD');
    });

    const data = await handlePromises([promise1, promise2]);
    expect(data).toEqual(new Error('ERROR'));
  });
});
