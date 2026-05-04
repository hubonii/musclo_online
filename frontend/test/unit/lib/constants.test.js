// Unit tests for shared frontend constants.
import { SET_TYPES, STAT_PERIODS } from '../../../src/lib/constants';

describe('lib/constants', () => {
  test('exposes canonical set types in expected order', () => {
    expect(SET_TYPES).toEqual(['working', 'warmup', 'dropset', 'failure']);
  });

  test('exposes supported stats periods', () => {
    expect(STAT_PERIODS).toEqual(['week', 'month', 'year']);
  });
});

