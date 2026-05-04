// Contract checks for shared motion presets.
import { MOTION } from '../../../src/lib/motion';

describe('lib/motion', () => {
  test('includes required animation profiles used in pages/components', () => {
    expect(MOTION).toEqual(
      expect.objectContaining({
        spring: expect.any(Object),
        pageEnter: expect.any(Object),
        staggerContainer: expect.any(Object),
        staggerItem: expect.any(Object),
      })
    );
  });

  test('keeps page enter transition intentionally fast', () => {
    expect(MOTION.pageEnter.transition.duration).toBeLessThanOrEqual(0.15);
  });
});

