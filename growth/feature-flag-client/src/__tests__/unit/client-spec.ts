import FeatureFlagClient from '../../client';
import {
  AnalyticsHandler,
  AutomaticAnalyticsHandler,
  ExposureTriggerReason,
  FlagShape,
} from '../../types';

describe('Feature Flag Client', () => {
  let analyticsHandler: AnalyticsHandler;
  beforeEach(() => {
    analyticsHandler = jest.fn();
  });

  describe('bootstrap', () => {
    test('should throw if no analytics handler is given', () => {
      expect(() => new FeatureFlagClient({} as any)).toThrowError(
        'Feature Flag Client: Missing analyticsHandler',
      );
    });

    test('should allow to bootstrap with flags', () => {
      const client = new FeatureFlagClient({
        analyticsHandler,
        flags: {
          'my.flag': { value: false },
        },
      });

      expect(client.getBooleanValue('my.flag', { default: true })).toBe(false);
    });

    test('should allow to set flags later', () => {
      const client = new FeatureFlagClient({
        analyticsHandler,
        flags: {
          'my.flag': { value: false },
        },
      });

      client.setFlags({
        'my.first.flag': { value: true },
      });

      client.setFlags({
        'my.second.flag': {
          value: 'experiment',
          explanation: {
            kind: 'RULE_MATCH',
            ruleId: '111-bbbbb-ccc',
          },
        },
      });

      expect(client.getBooleanValue('my.flag', { default: true })).toBe(false);
      expect(client.getBooleanValue('my.first.flag', { default: false })).toBe(
        true,
      );
      expect(
        client.getVariantValue('my.second.flag', {
          default: 'control',
          oneOf: ['control', 'experiment'],
        }),
      ).toBe('experiment');
    });
  });

  describe('clear', () => {
    test('should remove all flags', () => {
      const client = new FeatureFlagClient({
        analyticsHandler,
        flags: {
          'my.flag': { value: false },
        },
      });

      expect(client.getBooleanValue('my.flag', { default: true })).toBe(false);

      client.clear();

      expect(client.getBooleanValue('my.flag', { default: true })).toBe(true);
    });
  });

  describe('getters', () => {
    describe('getFlag', () => {
      test('should return an object with the correct flagKey and value if the flag exists', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.test.flag': { value: 'control' },
          },
        });

        const flag = client.getFlag('my.test.flag');
        expect(flag).not.toBeNull();
        if (flag !== null) {
          // required to appease type safety checks
          expect(flag.value).toBe('control');
          expect(flag.flagKey).toBe('my.test.flag');
        }
      });

      test('should return null if the flag does not exist', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {},
        });

        const flag = client.getFlag('my.test.flag');
        expect(flag).toBeNull();
      });
    });

    describe('getBooleanValue', () => {
      test('should throw if called without default', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {},
        });
        expect(() =>
          expect(client.getBooleanValue('my.flag', {} as any)),
        ).toThrow('getBooleanValue: Missing default');
      });

      test('should return default if flag is not set', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {},
        });

        expect(client.getBooleanValue('my.flag', { default: true })).toBe(true);
      });

      test('should throw in DEV if flag does not have a "value" attribute', () => {
        const createClient = () =>
          new FeatureFlagClient({
            analyticsHandler,
            flags: {
              'my.flag': false,
            } as any,
          });

        expect(createClient).toThrow('my.flag is not a valid flag');
      });

      test('should return default if flag is not boolean', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.string.flag': { value: 'string.value' },
            'my.variation.flag': {
              value: 'experiment',
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
                ruleIndex: 1,
              },
            },
          },
        });

        expect(
          client.getBooleanValue('my.variation.flag', { default: true }),
        ).toBe(true);

        expect(
          client.getBooleanValue('my.string.flag', { default: true }),
        ).toBe(true);
      });

      test('should return the right value when the flag is boolean', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.boolean.flag': { value: false },
          },
        });

        expect(
          client.getBooleanValue('my.boolean.flag', { default: true }),
        ).toBe(false);
      });

      test('should not fire the exposure event if the flag does not contain evaluation details (short format / dark feature)', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.boolean.flag': { value: false },
          },
        });

        expect(
          client.getBooleanValue('my.boolean.flag', { default: true }),
        ).toBe(false);
        expect(analyticsHandler).toHaveBeenCalledTimes(0);
      });

      test('should fire the exposure event if the flag contains evaluation details (long format / feature flag)', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.detailed.boolean.flag': {
              value: false,
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
                ruleIndex: 1,
              },
            },
          },
        });

        expect(
          client.getBooleanValue('my.detailed.boolean.flag', { default: true }),
        ).toBe(false);
        expect(analyticsHandler).toHaveBeenCalledTimes(1);
        expect(analyticsHandler).toHaveBeenCalledWith({
          action: 'exposed',
          actionSubject: 'feature',
          attributes: {
            flagKey: 'my.detailed.boolean.flag',
            reason: 'RULE_MATCH',
            ruleId: '111-bbbbb-ccc',
            value: false,
          },
          tags: ['defaultExposure', 'measurement'],
          highPriority: true,
          source: '@atlaskit/feature-flag-client',
        });
      });

      test('should not fire the exposure event if shouldTrackExposureEvent is false', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.detailed.boolean.flag': {
              value: false,
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(
          client.getBooleanValue('my.detailed.boolean.flag', {
            default: true,
            shouldTrackExposureEvent: false,
          }),
        ).toBe(false);
        expect(analyticsHandler).toHaveBeenCalledTimes(0);
      });

      test('should allow for extra attributes in the exposure event', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.detailed.boolean.flag': {
              value: false,
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(
          client.getBooleanValue('my.detailed.boolean.flag', {
            default: true,
            exposureData: {
              permissions: 'read',
              section: 'view-page',
            },
          }),
        ).toBe(false);
        expect(analyticsHandler).toHaveBeenCalledTimes(1);
        expect(analyticsHandler).toHaveBeenCalledWith({
          action: 'exposed',
          actionSubject: 'feature',
          attributes: {
            flagKey: 'my.detailed.boolean.flag',
            reason: 'RULE_MATCH',
            ruleId: '111-bbbbb-ccc',
            value: false,
            permissions: 'read',
            section: 'view-page',
          },
          tags: ['defaultExposure', 'measurement'],
          highPriority: true,
          source: '@atlaskit/feature-flag-client',
        });
      });

      test('should not allow extra attributes conflicting with reserved attributes', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.detailed.boolean.flag': {
              value: false,
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        const errorMessage =
          'exposureData contains a reserved attribute. Reserved attributes are: flagKey, ruleId, reason, value, errorKind';

        expect(() =>
          client.getBooleanValue('my.detailed.boolean.flag', {
            default: true,
            exposureData: {
              value: 'special',
            },
          }),
        ).toThrow(new TypeError(errorMessage));

        expect(() =>
          client.getBooleanValue('my.detailed.boolean.flag', {
            default: true,
            exposureData: {
              ruleId: 'reserved-1111',
            },
          }),
        ).toThrow(new TypeError(errorMessage));

        expect(() =>
          client.getBooleanValue('my.detailed.boolean.flag', {
            default: true,
            exposureData: {
              flagKey: 'reserved.key',
            },
          }),
        ).toThrow(new TypeError(errorMessage));

        expect(() =>
          client.getBooleanValue('my.detailed.boolean.flag', {
            default: true,
            exposureData: {
              reason: 'RESERVED',
            },
          }),
        ).toThrow(new TypeError(errorMessage));
      });

      test('should return the same value on repeated calls where the flag is in a valid state', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.test.flag': { value: true },
          },
        });

        const firstEvalResult = client.getBooleanValue('my.test.flag', {
          default: false,
        });
        const secondEvalResult = client.getBooleanValue('my.test.flag', {
          default: false,
        });

        expect(firstEvalResult).toBe(true);
        expect(secondEvalResult).toBe(true);
      });

      test('should return the passed in default value for repeated calls when the flag is in an invalid state', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.test.flag': { value: 'experiment' },
          },
        });

        // Same flag key, same validation rules, but different defaults
        const firstEvalResult = client.getBooleanValue('my.test.flag', {
          default: false,
        });
        const secondEvalResult = client.getBooleanValue('my.test.flag', {
          default: true,
        });

        expect(firstEvalResult).toBe(false);
        expect(secondEvalResult).toBe(true);
      });

      test('should return the cached result of the first evaluation for the flag key, even if it does not match the type we are asking for', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.test.flag': { value: 'experiment' },
          },
        });

        const firstEvalResult = client.getVariantValue('my.test.flag', {
          oneOf: ['control', 'experiment'],
          default: 'control',
        });
        const secondEvalResult = client.getBooleanValue('my.test.flag', {
          default: false,
        });

        expect(firstEvalResult).toBe('experiment');
        expect(secondEvalResult).toBe('experiment');
      });

      test('should allow exposure events to be suppressed on the initial call, and fired in a later call instead', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.test.flag': {
              value: true,
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        client.getBooleanValue('my.test.flag', {
          default: false,
          shouldTrackExposureEvent: false,
        });
        expect(analyticsHandler).not.toHaveBeenCalled();
        client.getBooleanValue('my.test.flag', {
          default: false,
          shouldTrackExposureEvent: true,
        });
        expect(analyticsHandler).toHaveBeenCalledTimes(1);
        expect(analyticsHandler).toHaveBeenCalledWith({
          action: 'exposed',
          actionSubject: 'feature',
          attributes: {
            flagKey: 'my.test.flag',
            reason: 'RULE_MATCH',
            ruleId: '111-bbbbb-ccc',
            value: true,
          },
          tags: ['optInExposure', 'measurement'],
          highPriority: true,
          source: '@atlaskit/feature-flag-client',
        });
      });
    });

    describe('getVariantValue', () => {
      test('should throw if called without default', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {},
        });

        expect(() =>
          client.getVariantValue('my.flag', {
            oneOf: ['control', 'experiment'],
          } as any),
        ).toThrow('getVariantValue: Missing default');
      });

      test('should throw if called without oneOf', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {},
        });

        expect(() =>
          client.getVariantValue('my.flag', { default: 'control' } as any),
        ).toThrow('getVariantValue: Missing oneOf');
      });

      test('should return default if flag is not set, and not fire exposure event', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {},
        });

        expect(
          client.getVariantValue('my.flag', {
            default: 'control',
            oneOf: ['control', 'experiment'],
          }),
        ).toBe('control');
        expect(analyticsHandler).toHaveBeenCalledTimes(0);
      });

      test('should return default if flag does not have a value attribute', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.variation.a': {
              value: 'variation-a',
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(
          client.getVariantValue('my.flag', {
            default: 'control',
            oneOf: ['control', 'experiment'],
          }),
        ).toBe('control');
        expect(analyticsHandler).toHaveBeenCalledTimes(0);
      });

      test('should return default if flag is boolean, and not fire exposure event', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.flag': { value: true },
          },
        });

        expect(
          client.getVariantValue('my.flag', {
            default: 'control',
            oneOf: ['control', 'experiment'],
          }),
        ).toBe('control');
        expect(analyticsHandler).toHaveBeenCalledTimes(0);
      });

      test('should return default if flag is not listed as oneOf, and should not fire an exposure event', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.variation.a': {
              value: 'variation-a',
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(
          client.getVariantValue('my.variation.a', {
            default: 'control',
            oneOf: ['control', 'experiment'],
          }),
        ).toBe('control');
        expect(analyticsHandler).toHaveBeenCalledTimes(0);
      });

      test('should return the right value if flag is listed as oneOf, and fire exposure event', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.experiment': {
              value: 'experiment',
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(
          client.getVariantValue('my.experiment', {
            default: 'control',
            oneOf: ['control', 'experiment'],
          }),
        ).toBe('experiment');
        expect(analyticsHandler).toHaveBeenCalledTimes(1);
        expect(analyticsHandler).toHaveBeenCalledWith({
          action: 'exposed',
          actionSubject: 'feature',
          attributes: {
            flagKey: 'my.experiment',
            reason: 'RULE_MATCH',
            ruleId: '111-bbbbb-ccc',
            value: 'experiment',
          },
          tags: ['defaultExposure', 'measurement'],
          highPriority: true,
          source: '@atlaskit/feature-flag-client',
        });
      });

      test('should return the right value if flag is listed as oneOf and is a dark feature', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.string.flag': { value: 'string.value' },
          },
        });

        expect(
          client.getVariantValue('my.string.flag', {
            default: 'string.default',
            oneOf: ['string.default', 'string.value'],
          }),
        ).toBe('string.value');
        expect(analyticsHandler).toHaveBeenCalledTimes(0);
      });

      test('should not fire exposure event if shouldTrackExposureEvent is false', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.experiment': {
              value: 'experiment',
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(
          client.getVariantValue('my.experiment', {
            default: 'control',
            oneOf: ['control', 'experiment'],
            shouldTrackExposureEvent: false,
          }),
        ).toBe('experiment');
        expect(analyticsHandler).toHaveBeenCalledTimes(0);
      });

      test('should allow for extra attributes in the exposure event', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.experiment': {
              value: 'experiment',
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(
          client.getVariantValue('my.experiment', {
            default: 'control',
            oneOf: ['control', 'experiment'],
            exposureData: {
              permissions: 'read',
              container: 'space',
            },
          }),
        ).toBe('experiment');
        expect(analyticsHandler).toHaveBeenCalledTimes(1);
        expect(analyticsHandler).toHaveBeenCalledWith({
          action: 'exposed',
          actionSubject: 'feature',
          attributes: {
            flagKey: 'my.experiment',
            reason: 'RULE_MATCH',
            ruleId: '111-bbbbb-ccc',
            value: 'experiment',
            permissions: 'read',
            container: 'space',
          },
          tags: ['defaultExposure', 'measurement'],
          highPriority: true,
          source: '@atlaskit/feature-flag-client',
        });
      });

      describe('invalid types', () => {
        const STRING_DEFAULT_VALUE = 'defaultValue';
        const STRING_TEST_VALUE = 'string';

        const INVALID_ITEMS: any = {
          boolean: true,
          object: {},
          zero: 0,
          number: 100,
          'string-not-in-possibleValues': 'abc',
        };

        Object.keys(INVALID_ITEMS).forEach((key: string) => {
          const wrongValue = INVALID_ITEMS[key];

          test(`should fall back to defaultValue when given ${key}`, () => {
            const client = new FeatureFlagClient({
              analyticsHandler,
              flags: {
                'some-flag': {
                  value: wrongValue,
                },
              },
            });

            expect(
              client.getVariantValue('some-flag', {
                default: STRING_DEFAULT_VALUE,
                oneOf: [STRING_TEST_VALUE],
              }),
            ).toBe(STRING_DEFAULT_VALUE);

            expect(client.flags.get('some-flag')).toEqual({
              value: wrongValue,
            });
          });
        });
      });

      test('should return the same value on repeated calls where the flag is in a valid state', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.test.flag': { value: 'experiment' },
          },
        });

        const firstEvalResult = client.getVariantValue('my.test.flag', {
          oneOf: ['control', 'experiment'],
          default: 'control',
        });
        const secondEvalResult = client.getVariantValue('my.test.flag', {
          oneOf: ['control', 'experiment'],
          default: 'control',
        });

        expect(firstEvalResult).toBe('experiment');
        expect(secondEvalResult).toBe('experiment');
      });

      test('should return the passed in default value for repeated calls when the flag is in an invalid state', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.test.flag': { value: true },
          },
        });

        // Same flag key, same validation rules, but different defaults
        const firstEvalResult = client.getVariantValue('my.test.flag', {
          oneOf: ['control', 'experiment'],
          default: 'control',
        });
        const secondEvalResult = client.getVariantValue('my.test.flag', {
          oneOf: ['control', 'experiment'],
          default: 'experiment',
        });

        expect(firstEvalResult).toBe('control');
        expect(secondEvalResult).toBe('experiment');
      });

      test('should return the cached result of the first evaluation for the flag key, even if it does not match the type we are asking for', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.test.flag': { value: true },
          },
        });

        const firstEvalResult = client.getBooleanValue('my.test.flag', {
          default: false,
        });
        const secondEvalResult = client.getVariantValue('my.test.flag', {
          oneOf: ['control', 'experiment'],
          default: 'control',
        });

        expect(firstEvalResult).toBe(true);
        expect(secondEvalResult).toBe(true);
      });

      test('should allow exposure events to be suppressed on the initial call, and fired in a later call instead', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.test.flag': {
              value: 'experiment',
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        client.getVariantValue('my.test.flag', {
          default: 'control',
          oneOf: ['control', 'experiment'],
          shouldTrackExposureEvent: false,
        });
        expect(analyticsHandler).not.toHaveBeenCalled();
        client.getVariantValue('my.test.flag', {
          default: 'control',
          oneOf: ['control', 'experiment'],
          shouldTrackExposureEvent: true,
        });
        expect(analyticsHandler).toHaveBeenCalledTimes(1);
        expect(analyticsHandler).toHaveBeenCalledWith({
          action: 'exposed',
          actionSubject: 'feature',
          attributes: {
            flagKey: 'my.test.flag',
            reason: 'RULE_MATCH',
            ruleId: '111-bbbbb-ccc',
            value: 'experiment',
          },
          tags: ['optInExposure', 'measurement'],
          highPriority: true,
          source: '@atlaskit/feature-flag-client',
        });
      });
    });

    describe('getJSONValue', () => {
      test('should return empty object if flag is not set, and not fire exposure event', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {},
        });

        expect(client.getJSONValue('my.empty.json.flag')).toEqual({});
        expect(analyticsHandler).toHaveBeenCalledTimes(0);
      });

      test('should return empty object if the flag is not a json flag', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.string.flag': { value: 'string.value' },
            'my.experiment': {
              value: 'experiment',
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(client.getJSONValue('my.experiment')).toEqual({});
        expect(client.getJSONValue('my.string.flag')).toEqual({});
      });

      test('should return the object if flag is set', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.json.flag': {
              value: {
                nav: 'blue',
                footer: 'black',
              },
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(client.getJSONValue('my.json.flag')).toEqual({
          nav: 'blue',
          footer: 'black',
        });
        expect(analyticsHandler).toHaveBeenCalledTimes(0);
      });

      test('should accept simple flags', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.json.flag': {
              value: {
                nav: 'blue',
                footer: 'black',
              },
            },
          },
        });

        expect(client.getJSONValue('my.json.flag')).toEqual({
          nav: 'blue',
          footer: 'black',
        });
        expect(analyticsHandler).toHaveBeenCalledTimes(0);
      });

      test('should return the same value on repeated calls where the flag is in a valid state', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.test.flag': {
              value: {
                nav: 'blue',
                footer: 'black',
              },
            },
          },
        });

        const firstEvalResult = client.getJSONValue('my.test.flag');
        const secondEvalResult = client.getJSONValue('my.test.flag');

        expect(firstEvalResult).toEqual({
          nav: 'blue',
          footer: 'black',
        });
        expect(secondEvalResult).toEqual({
          nav: 'blue',
          footer: 'black',
        });
      });

      test('should return the cached result of the first evaluation for the flag key, even if it does not match the type we are asking for', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.test.flag': { value: true },
          },
        });

        const firstEvalResult = client.getBooleanValue('my.test.flag', {
          default: false,
        });
        const secondEvalResult = client.getJSONValue('my.test.flag');

        expect(firstEvalResult).toBe(true);
        expect(secondEvalResult).toBe(true);
      });
    });

    describe('getRawValue', () => {
      test('should throw if called without default', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {},
        });

        expect(() =>
          client.getRawValue('my.flag', {
            oneOf: ['control', 'experiment'],
          } as any),
        ).toThrow('getRawValue: Missing default');
      });

      test('should return default if flag is not set, and not fire exposure event', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {},
        });

        expect(
          client.getRawValue('my.flag', {
            default: 'control',
          }),
        ).toBe('control');
        expect(analyticsHandler).toHaveBeenCalledTimes(0);
      });

      test('should return value if flag is set to different type', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.variation.a': {
              value: 'variation-a',
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(
          client.getRawValue('my.variation.a', {
            default: false,
          }),
        ).toBe('variation-a');
      });

      test('should return default if flag does not have a value attribute', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.variation.a': {
              value: 'variation-a',
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(
          client.getRawValue('my.flag', {
            default: 'control',
          }),
        ).toBe('control');
        expect(analyticsHandler).toHaveBeenCalledTimes(0);
      });

      test('should return the right value if the flag is a boolean, and fire exposure event', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.experiment': {
              value: true,
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(
          client.getRawValue('my.experiment', {
            default: false,
          }),
        ).toBe(true);
        expect(analyticsHandler).toHaveBeenCalledTimes(1);
        expect(analyticsHandler).toHaveBeenCalledWith({
          action: 'exposed',
          actionSubject: 'feature',
          attributes: {
            flagKey: 'my.experiment',
            reason: 'RULE_MATCH',
            ruleId: '111-bbbbb-ccc',
            value: true,
          },
          tags: ['defaultExposure', 'measurement'],
          highPriority: true,
          source: '@atlaskit/feature-flag-client',
        });
      });

      test('should return the right value if the flag is a string, and fire exposure event', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.experiment': {
              value: 'variation',
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(
          client.getRawValue('my.experiment', {
            default: 'control',
          }),
        ).toBe('variation');
        expect(analyticsHandler).toHaveBeenCalledTimes(1);
        expect(analyticsHandler).toHaveBeenCalledWith({
          action: 'exposed',
          actionSubject: 'feature',
          attributes: {
            flagKey: 'my.experiment',
            reason: 'RULE_MATCH',
            ruleId: '111-bbbbb-ccc',
            value: 'variation',
          },
          tags: ['defaultExposure', 'measurement'],
          highPriority: true,
          source: '@atlaskit/feature-flag-client',
        });
      });

      test('should return the right value if the flag is an object, and fire exposure event', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.experiment': {
              value: {
                boolean: true,
                string: 'control',
              },
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(
          client.getRawValue('my.experiment', {
            default: {},
          }),
        ).toEqual({
          boolean: true,
          string: 'control',
        });
        expect(analyticsHandler).toHaveBeenCalledTimes(1);
        expect(analyticsHandler).toHaveBeenCalledWith({
          action: 'exposed',
          actionSubject: 'feature',
          attributes: {
            flagKey: 'my.experiment',
            reason: 'RULE_MATCH',
            ruleId: '111-bbbbb-ccc',
            value: {
              boolean: true,
              string: 'control',
            },
          },
          tags: ['defaultExposure', 'measurement'],
          highPriority: true,
          source: '@atlaskit/feature-flag-client',
        });
      });

      test('should not fire exposure event if shouldTrackExposureEvent is false', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.experiment': {
              value: 'experiment',
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(
          client.getRawValue('my.experiment', {
            default: 'control',
            shouldTrackExposureEvent: false,
          }),
        ).toBe('experiment');
        expect(analyticsHandler).toHaveBeenCalledTimes(0);
      });

      test('should allow for extra attributes in the exposure event', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.experiment': {
              value: 'experiment',
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(
          client.getRawValue('my.experiment', {
            default: 'control',
            exposureData: {
              permissions: 'read',
              container: 'space',
            },
          }),
        ).toBe('experiment');
        expect(analyticsHandler).toHaveBeenCalledTimes(1);
        expect(analyticsHandler).toHaveBeenCalledWith({
          action: 'exposed',
          actionSubject: 'feature',
          attributes: {
            flagKey: 'my.experiment',
            reason: 'RULE_MATCH',
            ruleId: '111-bbbbb-ccc',
            value: 'experiment',
            permissions: 'read',
            container: 'space',
          },
          tags: ['defaultExposure', 'measurement'],
          highPriority: true,
          source: '@atlaskit/feature-flag-client',
        });
      });

      test('should return the same value on repeated calls where the flag is in a valid state', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.test.flag': { value: true },
          },
        });

        const firstEvalResult = client.getRawValue('my.test.flag', {
          default: false,
        });
        const secondEvalResult = client.getRawValue('my.test.flag', {
          default: false,
        });

        expect(firstEvalResult).toBe(true);
        expect(secondEvalResult).toBe(true);
      });

      test('should return the passed in default value for repeated calls when the flag is in an invalid state', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {},
        });

        // Same flag key, same validation rules, but different defaults
        const firstEvalResult = client.getRawValue('my.test.flag', {
          default: false,
        });
        const secondEvalResult = client.getRawValue('my.test.flag', {
          default: 'experiment',
        });

        expect(firstEvalResult).toBe(false);
        expect(secondEvalResult).toBe('experiment');
      });

      test('should allow exposure events to be suppressed on the initial call, and fired in a later call instead', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.test.flag': {
              value: true,
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        client.getRawValue('my.test.flag', {
          default: false,
          shouldTrackExposureEvent: false,
        });
        expect(analyticsHandler).not.toHaveBeenCalled();
        client.getRawValue('my.test.flag', {
          default: false,
          shouldTrackExposureEvent: true,
        });
        expect(analyticsHandler).toHaveBeenCalledTimes(1);
        expect(analyticsHandler).toHaveBeenCalledWith({
          action: 'exposed',
          actionSubject: 'feature',
          attributes: {
            flagKey: 'my.test.flag',
            reason: 'RULE_MATCH',
            ruleId: '111-bbbbb-ccc',
            value: true,
          },
          tags: ['optInExposure', 'measurement'],
          highPriority: true,
          source: '@atlaskit/feature-flag-client',
        });
      });
    });

    describe('getFlagStats', () => {
      test('should reset the stats for any flags that are reset through setFlags', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.experiment': {
              value: 'experiment',
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(client.getFlagStats()).toEqual({});

        client.getVariantValue('my.experiment', {
          default: 'control',
          oneOf: ['control', 'experiment'],
        });

        expect(client.getFlagStats()).toEqual({
          'my.experiment': {
            evaluationCount: 1,
          },
        });

        client.setFlags({
          'my.experiment': {
            value: 'control',
            explanation: {
              kind: 'RULE_MATCH',
              ruleId: '111-bbbbb-ccc',
            },
          },
        });

        expect(client.getFlagStats()).toEqual({});
      });

      test('should reset the stats if all flags are cleared', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.experiment': {
              value: 'experiment',
              explanation: {
                kind: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
              },
            },
          },
        });

        expect(client.getFlagStats()).toEqual({});

        client.getVariantValue('my.experiment', {
          default: 'control',
          oneOf: ['control', 'experiment'],
        });

        expect(client.getFlagStats()).toEqual({
          'my.experiment': {
            evaluationCount: 1,
          },
        });

        client.clear();

        expect(client.getFlagStats()).toEqual({});
      });

      test('should return the expected evaluation count for valid flags', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.experiment': {
              value: true,
            },
          },
        });

        const evaluationCount = 5;
        for (let i = 0; i < evaluationCount; i++) {
          client.getBooleanValue('my.experiment', {
            default: false,
          });
        }

        expect(client.getFlagStats()).toEqual({
          'my.experiment': {
            evaluationCount,
          },
        });
      });

      test('should return the expected evaluation count for missing flags', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {},
        });

        const evaluationCount = 5;
        for (let i = 0; i < evaluationCount; i++) {
          client.getBooleanValue('my.experiment', {
            default: false,
          });
        }

        expect(client.getFlagStats()).toEqual({
          'my.experiment': {
            evaluationCount,
          },
        });
      });
    });
  });

  describe('exposures', () => {
    describe('Automatic Exposures Mode', () => {
      let automaticAnalyticsHandler: AutomaticAnalyticsHandler;
      beforeEach(() => {
        automaticAnalyticsHandler = {
          sendOperationalEvent: jest.fn(),
        };
      });
      test('enableAutomaticExposures should be false by default', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {},
        });

        expect(client.isAutomaticExposuresEnabled).toEqual(false);
      });

      test('enableAutomaticExposures should be able to set to true', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {},
        });

        client.setIsAutomaticExposuresEnabled(true);
        expect(client.isAutomaticExposuresEnabled).toEqual(true);
      });

      test('setAutomaticExposuresMode should set enableAutomaticExposures and automaticAnalyticsHandler', () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {},
        });

        client.setAutomaticExposuresMode(true, automaticAnalyticsHandler);
        expect(client.isAutomaticExposuresEnabled).toEqual(true);
        expect(client.automaticAnalyticsHandler).toEqual(
          automaticAnalyticsHandler,
        );
      });

      describe('getters with AutomaticExposuresMode', () => {
        describe('getBooleanValue', () => {
          test('with automode true, shouldTrackExposureEvent false; should fire automatic exposure event not track event', () => {
            const client = new FeatureFlagClient({
              analyticsHandler,
              flags: {
                'my.boolean.flag': {
                  value: false,
                  explanation: {
                    kind: 'RULE_MATCH',
                    ruleId: '111-bbbbb-ccc',
                    ruleIndex: 1,
                  },
                },
              },
            });

            client.setAutomaticExposuresMode(true, automaticAnalyticsHandler);

            expect(
              client.getBooleanValue('my.boolean.flag', {
                default: true,
                shouldTrackExposureEvent: false,
              }),
            ).toBe(false);
            expect(analyticsHandler).toHaveBeenCalledTimes(0);
            expect(
              automaticAnalyticsHandler.sendOperationalEvent,
            ).toHaveBeenCalledTimes(1);
            expect(
              automaticAnalyticsHandler.sendOperationalEvent,
            ).toHaveBeenCalledWith({
              action: 'exposed',
              actionSubject: 'feature',
              attributes: {
                flagKey: 'my.boolean.flag',
                reason: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
                value: false,
              },
              tags: ['autoExposure', 'measurement'],
              highPriority: false,
              source: '@atlaskit/feature-flag-client',
            });
          });

          test('with automode true, shouldTrackExposureEvent true and a flag with evalutation details; should only fire track event', () => {
            const client = new FeatureFlagClient({
              analyticsHandler,
              flags: {
                'my.detailed.boolean.flag': {
                  value: false,
                  explanation: {
                    kind: 'RULE_MATCH',
                    ruleId: '111-bbbbb-ccc',
                    ruleIndex: 1,
                  },
                },
              },
            });

            client.setAutomaticExposuresMode(true, automaticAnalyticsHandler);

            expect(
              client.getBooleanValue('my.detailed.boolean.flag', {
                default: true,
                shouldTrackExposureEvent: true,
              }),
            ).toBe(false);

            expect(analyticsHandler).toHaveBeenCalledTimes(1);
            expect(
              automaticAnalyticsHandler.sendOperationalEvent,
            ).toHaveBeenCalledTimes(0);
            expect(analyticsHandler).toHaveBeenCalledWith({
              action: 'exposed',
              actionSubject: 'feature',
              attributes: {
                flagKey: 'my.detailed.boolean.flag',
                reason: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
                value: false,
              },
              tags: ['optInExposure', 'measurement'],
              highPriority: true,
              source: '@atlaskit/feature-flag-client',
            });
          });

          test('with automode true, shouldTrackExposureEvent false; should fire only automatic exposure event', () => {
            const client = new FeatureFlagClient({
              analyticsHandler,
              flags: {
                'my.boolean.flag': {
                  value: false,
                  explanation: {
                    kind: 'RULE_MATCH',
                    ruleId: '111-bbbbb-ccc',
                    ruleIndex: 1,
                  },
                },
              },
            });

            client.setAutomaticExposuresMode(true, automaticAnalyticsHandler);

            expect(
              client.getBooleanValue('my.boolean.flag', {
                default: true,
                shouldTrackExposureEvent: false,
              }),
            ).toBe(false);
            expect(analyticsHandler).toHaveBeenCalledTimes(0);
            expect(
              automaticAnalyticsHandler.sendOperationalEvent,
            ).toHaveBeenCalledTimes(1);
            expect(
              automaticAnalyticsHandler.sendOperationalEvent,
            ).toHaveBeenCalledWith({
              action: 'exposed',
              actionSubject: 'feature',
              attributes: {
                flagKey: 'my.boolean.flag',
                reason: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
                value: false,
              },
              tags: ['autoExposure', 'measurement'],
              highPriority: false,
              source: '@atlaskit/feature-flag-client',
            });
          });

          test('with automode true, shouldTrackExposureEvent false and a flag with evalutation details; should fire only automatic exposure event', () => {
            const client = new FeatureFlagClient({
              analyticsHandler,
              flags: {
                'my.detailed.boolean.flag': {
                  value: false,
                  explanation: {
                    kind: 'RULE_MATCH',
                    ruleId: '111-bbbbb-ccc',
                    ruleIndex: 1,
                  },
                },
              },
            });

            client.setAutomaticExposuresMode(true, automaticAnalyticsHandler);

            expect(
              client.getBooleanValue('my.detailed.boolean.flag', {
                default: true,
                shouldTrackExposureEvent: false,
              }),
            ).toBe(false);
            expect(analyticsHandler).toHaveBeenCalledTimes(0);
            expect(
              automaticAnalyticsHandler.sendOperationalEvent,
            ).toHaveBeenCalledTimes(1);
            expect(
              automaticAnalyticsHandler.sendOperationalEvent,
            ).toHaveBeenCalledWith({
              action: 'exposed',
              actionSubject: 'feature',
              attributes: {
                flagKey: 'my.detailed.boolean.flag',
                reason: 'RULE_MATCH',
                ruleId: '111-bbbbb-ccc',
                value: false,
              },
              tags: ['autoExposure', 'measurement'],
              highPriority: false,
              source: '@atlaskit/feature-flag-client',
            });
          });

          test('should only send 1 automatic exposure event if flag is evaluated more than once', () => {
            const client = new FeatureFlagClient({
              analyticsHandler,
              flags: {
                'my.detailed.boolean.flag': {
                  value: false,
                  explanation: {
                    kind: 'RULE_MATCH',
                    ruleId: '111-bbbbb-ccc',
                    ruleIndex: 1,
                  },
                },
              },
            });

            client.setAutomaticExposuresMode(true, automaticAnalyticsHandler);

            client.getBooleanValue('my.detailed.boolean.flag', {
              default: true,
              shouldTrackExposureEvent: false,
            });

            client.getBooleanValue('my.detailed.boolean.flag', {
              default: true,
              shouldTrackExposureEvent: false,
            });
            client.getBooleanValue('my.detailed.boolean.flag', {
              default: true,
              shouldTrackExposureEvent: false,
            });

            expect(
              automaticAnalyticsHandler.sendOperationalEvent,
            ).toBeCalledTimes(1);
          });

          test('should still send track event if shouldTrackExposureEvent is later enabled', () => {
            const client = new FeatureFlagClient({
              analyticsHandler,
              flags: {
                'my.detailed.boolean.flag': {
                  value: false,
                  explanation: {
                    kind: 'RULE_MATCH',
                    ruleId: '111-bbbbb-ccc',
                    ruleIndex: 1,
                  },
                },
              },
            });

            client.setAutomaticExposuresMode(true, automaticAnalyticsHandler);

            client.getBooleanValue('my.detailed.boolean.flag', {
              default: true,
              shouldTrackExposureEvent: false,
            });

            expect(analyticsHandler).toBeCalledTimes(0);
            expect(
              automaticAnalyticsHandler.sendOperationalEvent,
            ).toBeCalledTimes(1);

            client.getBooleanValue('my.detailed.boolean.flag', {
              default: true,
              shouldTrackExposureEvent: true,
            });

            expect(analyticsHandler).toBeCalledTimes(1);
          });

          describe('Invalid types on default value and flag value', () => {
            test('should send automatic exposure event with errorKind:WRONG_TYPE if type of default value does not match type of flag value for flag with evaluation details', () => {
              const client = new FeatureFlagClient({
                analyticsHandler,
                flags: {
                  'my.experiment': {
                    value: 'experiment',
                    explanation: {
                      kind: 'RULE_MATCH',
                      ruleId: '111-bbbbb-ccc',
                    },
                  },
                },
              });

              client.setAutomaticExposuresMode(true, automaticAnalyticsHandler);

              expect(
                client.getBooleanValue('my.experiment', {
                  default: true,
                  shouldTrackExposureEvent: false,
                }),
              ).toBe(true);

              expect(analyticsHandler).toHaveBeenCalledTimes(0);

              expect(
                automaticAnalyticsHandler.sendOperationalEvent,
              ).toHaveBeenCalledTimes(1);

              expect(
                automaticAnalyticsHandler.sendOperationalEvent,
              ).toHaveBeenCalledWith({
                action: 'exposed',
                actionSubject: 'feature',
                attributes: {
                  flagKey: 'my.experiment',
                  reason: 'ERROR',
                  ruleId: '111-bbbbb-ccc',
                  value: true,
                  errorKind: 'WRONG_TYPE',
                },
                tags: ['autoExposure', 'measurement'],
                highPriority: false,
                source: '@atlaskit/feature-flag-client',
              });
            });

            test('should send automatic exposure event with errorKind:WRONG_TYPE if type of default value does not match type of flag value for simple flag', () => {
              const client = new FeatureFlagClient({
                analyticsHandler,
                flags: {
                  'my.experiment': {
                    value: 'experiment',
                  },
                },
              });

              client.setAutomaticExposuresMode(true, automaticAnalyticsHandler);

              expect(
                client.getBooleanValue('my.experiment', {
                  default: true,
                  shouldTrackExposureEvent: false,
                }),
              ).toBe(true);

              expect(analyticsHandler).toHaveBeenCalledTimes(0);

              expect(
                automaticAnalyticsHandler.sendOperationalEvent,
              ).toHaveBeenCalledTimes(1);

              expect(
                automaticAnalyticsHandler.sendOperationalEvent,
              ).toHaveBeenCalledWith({
                action: 'exposed',
                actionSubject: 'feature',
                attributes: {
                  flagKey: 'my.experiment',
                  reason: 'ERROR',
                  value: true,
                  errorKind: 'WRONG_TYPE',
                },
                tags: ['autoExposure', 'measurement'],
                highPriority: false,
                source: '@atlaskit/feature-flag-client',
              });
            });
          });

          describe('Flag does not exist', () => {
            test('should send automatic exposure event with errorKind:FLAG_NOT_FOUND if a flag is requested but does not exist', () => {
              const client = new FeatureFlagClient({
                analyticsHandler,
                flags: {},
              });

              client.setAutomaticExposuresMode(true, automaticAnalyticsHandler);

              expect(
                client.getBooleanValue('my.experiment', {
                  default: true,
                  shouldTrackExposureEvent: false,
                }),
              ).toBe(true);

              expect(analyticsHandler).toHaveBeenCalledTimes(0);

              expect(
                automaticAnalyticsHandler.sendOperationalEvent,
              ).toHaveBeenCalledTimes(1);

              expect(
                automaticAnalyticsHandler.sendOperationalEvent,
              ).toHaveBeenCalledWith({
                action: 'exposed',
                actionSubject: 'feature',
                attributes: {
                  flagKey: 'my.experiment',
                  reason: 'ERROR',
                  value: true,
                  errorKind: 'FLAG_NOT_FOUND',
                },
                tags: ['autoExposure', 'measurement'],
                highPriority: false,
                source: '@atlaskit/feature-flag-client',
              });
            });
          });

          test('with automode true, shouldTrackExposureEvent true and a simple flag; should not fire automatic exposure event and track event on flag', () => {
            const client = new FeatureFlagClient({
              analyticsHandler,
              flags: {
                'my.boolean.flag': {
                  value: false,
                },
              },
            });

            client.setAutomaticExposuresMode(true, automaticAnalyticsHandler);

            expect(
              client.getBooleanValue('my.boolean.flag', {
                default: true,
                shouldTrackExposureEvent: false,
              }),
            ).toBe(false);
            expect(analyticsHandler).toHaveBeenCalledTimes(0);
            expect(
              automaticAnalyticsHandler.sendOperationalEvent,
            ).toHaveBeenCalledTimes(0);
          });
        });

        describe('getVariantValue', () => {
          describe('Variant does not exist in the provided oneOf argument', () => {
            test('should send automatic exposure event with errorKind:VALIDATION_ERROR if the value does not exist in the provided oneOf for flag with evaluation details', () => {
              const client = new FeatureFlagClient({
                analyticsHandler,
                flags: {
                  'my.experiment': {
                    value: 'variant',
                    explanation: {
                      kind: 'RULE_MATCH',
                      ruleId: '111-bbbbb-ccc',
                    },
                  },
                },
              });

              client.setAutomaticExposuresMode(true, automaticAnalyticsHandler);

              expect(
                client.getVariantValue('my.experiment', {
                  default: 'control',
                  oneOf: ['control', 'experiment'],
                  shouldTrackExposureEvent: false,
                }),
              ).toBe('control');

              expect(analyticsHandler).toHaveBeenCalledTimes(0);

              expect(
                automaticAnalyticsHandler.sendOperationalEvent,
              ).toHaveBeenCalledTimes(1);

              expect(
                automaticAnalyticsHandler.sendOperationalEvent,
              ).toHaveBeenCalledWith({
                action: 'exposed',
                actionSubject: 'feature',
                attributes: {
                  flagKey: 'my.experiment',
                  ruleId: '111-bbbbb-ccc',
                  reason: 'ERROR',
                  value: 'control',
                  errorKind: 'VALIDATION_ERROR',
                },
                tags: ['autoExposure', 'measurement'],
                highPriority: false,
                source: '@atlaskit/feature-flag-client',
              });
            });

            test('should send automatic exposure event with errorKind:VALIDATION_ERROR if the value does not exist in the provided oneOf for simple flag', () => {
              const client = new FeatureFlagClient({
                analyticsHandler,
                flags: {
                  'my.experiment': {
                    value: '111-bbbbbb-ccc',
                  },
                },
              });

              client.setAutomaticExposuresMode(true, automaticAnalyticsHandler);

              expect(
                client.getVariantValue('my.experiment', {
                  default: 'control',
                  oneOf: ['control', 'experiment'],
                  shouldTrackExposureEvent: false,
                }),
              ).toBe('control');

              expect(analyticsHandler).toHaveBeenCalledTimes(0);

              expect(
                automaticAnalyticsHandler.sendOperationalEvent,
              ).toHaveBeenCalledTimes(1);

              expect(
                automaticAnalyticsHandler.sendOperationalEvent,
              ).toHaveBeenCalledWith({
                action: 'exposed',
                actionSubject: 'feature',
                attributes: {
                  flagKey: 'my.experiment',
                  reason: 'ERROR',
                  value: 'control',
                  errorKind: 'VALIDATION_ERROR',
                },
                tags: ['autoExposure', 'measurement'],
                highPriority: false,
                source: '@atlaskit/feature-flag-client',
              });
            });
          });
        });
      });
    });

    describe('Manual Exposures Mode', () => {
      let automaticAnalyticsHandler: AutomaticAnalyticsHandler;
      beforeEach(() => {
        automaticAnalyticsHandler = {
          sendOperationalEvent: jest.fn(),
        };
      });

      test('should send exposure event with appropriate fields when trackExposure is called', async () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.experiment': {
              value: '111-bbbbbb-ccc',
            },
          },
        });
        client.setAutomaticExposuresMode(false, automaticAnalyticsHandler);
        await client.trackExposure(
          'my.experiment',
          {
            value: '111-bbbbbb-ccc',
            explanation: {
              kind: 'RULE_MATCH',
              ruleId: 'aaaa-vbbbb-ccccc',
            },
          },
          {
            someCustomAttribute: 9000,
          },
        );

        expect(automaticAnalyticsHandler.sendOperationalEvent).toBeCalledTimes(
          0,
        );
        expect(analyticsHandler).toHaveBeenCalledWith({
          action: 'exposed',
          actionSubject: 'feature',
          attributes: {
            flagKey: 'my.experiment',
            reason: 'RULE_MATCH',
            ruleId: 'aaaa-vbbbb-ccccc',
            someCustomAttribute: 9000,
            value: '111-bbbbbb-ccc',
          },
          tags: ['manualExposure', 'measurement'],
          highPriority: true,
          source: '@atlaskit/feature-flag-client',
        });
      });
    });

    describe('trackFeatureFlag', () => {
      let automaticAnalyticsHandler: AutomaticAnalyticsHandler;

      beforeEach(() => {
        automaticAnalyticsHandler = {
          sendOperationalEvent: jest.fn(),
        };
      });

      test('should call _trackExposure and retrieve flagValue and flagExplanation from the flags map', async () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.experiment': {
              value: '111-bbbbbb-ccc',
              explanation: { kind: 'SIMPLE_EVAL' },
            },
          },
        });

        client.setAutomaticExposuresMode(false, automaticAnalyticsHandler);

        client.trackFeatureFlag('my.experiment', {
          triggerReason: ExposureTriggerReason.Manual,
        });

        expect(automaticAnalyticsHandler.sendOperationalEvent).toBeCalledTimes(
          0,
        );

        expect(analyticsHandler).toHaveBeenCalledWith({
          action: 'exposed',
          actionSubject: 'feature',
          attributes: {
            flagKey: 'my.experiment',
            reason: 'SIMPLE_EVAL',
            ruleId: undefined,
            value: '111-bbbbbb-ccc',
          },
          tags: ['manualExposure', 'measurement'],
          highPriority: true,
          source: '@atlaskit/feature-flag-client',
        });
      });

      test('should call _trackExposure and use values for flagValue and flagExplanation from the parameters', async () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.experiment': {
              value: '111-bbbbbb-ccc',
              explanation: { kind: 'SIMPLE_EVAL' },
            },
          },
        });

        client.setAutomaticExposuresMode(false, automaticAnalyticsHandler);

        client.trackFeatureFlag('my.experiment', {
          triggerReason: ExposureTriggerReason.Manual,
          value: '222-cccccc-ddd',
          explanation: { kind: 'RULE_MATCH', ruleId: 'some-rule-id' },
        });

        expect(automaticAnalyticsHandler.sendOperationalEvent).toBeCalledTimes(
          0,
        );

        expect(analyticsHandler).toHaveBeenCalledWith({
          action: 'exposed',
          actionSubject: 'feature',
          attributes: {
            flagKey: 'my.experiment',
            reason: 'RULE_MATCH',
            ruleId: 'some-rule-id',
            value: '222-cccccc-ddd',
          },
          tags: ['manualExposure', 'measurement'],
          highPriority: true,
          source: '@atlaskit/feature-flag-client',
        });
      });

      test('should call sendAutomaticExposure and retrieve flagValue and flagExplanation from the flags map', async () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.experiment': {
              value: '111-bbbbbb-ccc',
              explanation: { kind: 'SIMPLE_EVAL' },
            },
          },
        });

        client.setAutomaticExposuresMode(true, automaticAnalyticsHandler);

        client.trackFeatureFlag('my.experiment', {
          triggerReason: ExposureTriggerReason.AutoExposure,
        });

        expect(analyticsHandler).toHaveBeenCalledTimes(0);
        expect(
          automaticAnalyticsHandler.sendOperationalEvent,
        ).toHaveBeenCalledWith({
          action: 'exposed',
          actionSubject: 'feature',
          attributes: {
            flagKey: 'my.experiment',
            reason: 'SIMPLE_EVAL',
            ruleId: undefined,
            value: '111-bbbbbb-ccc',
          },
          tags: ['autoExposure', 'measurement'],
          highPriority: false,
          source: '@atlaskit/feature-flag-client',
        });
      });

      test('should call sendAutomaticExposure use values for flagValue and flagExplanation from the paramaters', async () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.experiment': {
              value: '111-bbbbbb-ccc',
              explanation: { kind: 'SIMPLE_EVAL' },
            },
          },
        });

        client.setAutomaticExposuresMode(true, automaticAnalyticsHandler);

        client.trackFeatureFlag('my.experiment', {
          triggerReason: ExposureTriggerReason.AutoExposure,
          value: '222-cccccc-ddd',
          explanation: { kind: 'RULE_MATCH', ruleId: 'some-rule-id' },
        });

        expect(analyticsHandler).toHaveBeenCalledTimes(0);
        expect(
          automaticAnalyticsHandler.sendOperationalEvent,
        ).toHaveBeenCalledWith({
          action: 'exposed',
          actionSubject: 'feature',
          attributes: {
            flagKey: 'my.experiment',
            reason: 'RULE_MATCH',
            ruleId: 'some-rule-id',
            value: '222-cccccc-ddd',
          },
          tags: ['autoExposure', 'measurement'],
          highPriority: false,
          source: '@atlaskit/feature-flag-client',
        });
      });

      test('should not proceed if there is no retrievable flagValue for a flagKey', async () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: undefined,
        });

        client.setAutomaticExposuresMode(false, automaticAnalyticsHandler);

        client.trackFeatureFlag('my.experiment', {
          triggerReason: ExposureTriggerReason.AutoExposure,
        });

        expect(analyticsHandler).toHaveBeenCalledTimes(0);
        expect(automaticAnalyticsHandler.sendOperationalEvent).toBeCalledTimes(
          0,
        );
      });

      const callTrackFeatureFlagWithoutFlagData = (
        client: FeatureFlagClient,
        flags: { [flagKey: string]: FlagShape },
      ) => {
        Object.keys(flags).forEach((key) =>
          client.trackFeatureFlag(key, {
            triggerReason: ExposureTriggerReason.AutoExposure,
          }),
        );
      };

      const callTrackFeatureFlagWithFlagData = (
        client: FeatureFlagClient,
        flags: { [flagKey: string]: FlagShape },
      ) => {
        Object.entries(flags).forEach(([key, { value, explanation }]) =>
          client.trackFeatureFlag(key, {
            triggerReason: ExposureTriggerReason.AutoExposure,
            value,
            explanation,
          }),
        );
      };

      const triggerAutomaticExposureAndAssert = (
        client: FeatureFlagClient,
        flags: { [flagKey: string]: FlagShape },
        triggerExposures: (
          client: FeatureFlagClient,
          flags: { [flagKey: string]: FlagShape },
        ) => void,
      ) => {
        client.setAutomaticExposuresMode(true, automaticAnalyticsHandler);
        const sendAutomaticExposureSpy = jest.spyOn(
          client,
          // @ts-ignore Spying on private function
          'sendAutomaticExposure',
        );

        triggerExposures(client, flags);

        expect(sendAutomaticExposureSpy).toHaveBeenCalledTimes(
          Object.keys(flags).length,
        );
        Object.entries(flags).forEach(([key, { value, explanation }]) =>
          expect(sendAutomaticExposureSpy).toHaveBeenCalledWith(
            key,
            value,
            explanation,
          ),
        );
      };

      const flasey_flags: { [flagKey: string]: FlagShape } = {
        false: {
          value: false,
          explanation: { kind: 'SIMPLE_EVAL' },
        },
        'empty-string': {
          value: '',
          explanation: { kind: 'SIMPLE_EVAL' },
        },
        null: {
          // @ts-ignore Worst case scenario
          value: null,
          explanation: { kind: 'SIMPLE_EVAL' },
        },
        undefined: {
          // @ts-ignore Worst case scenario
          value: undefined,
          explanation: { kind: 'SIMPLE_EVAL' },
        },
        '0': {
          // @ts-ignore Worst case scenario
          value: 0,
          explanation: { kind: 'SIMPLE_EVAL' },
        },
      };

      test('should call sendAutomaticExposure when flagValue from flags if falsey', async () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: flasey_flags,
        });

        triggerAutomaticExposureAndAssert(
          client,
          flasey_flags,
          callTrackFeatureFlagWithoutFlagData,
        );
      });

      test('should call sendAutomaticExposure when flagValue from options if falsey', async () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {},
        });

        triggerAutomaticExposureAndAssert(
          client,
          flasey_flags,
          callTrackFeatureFlagWithFlagData,
        );
      });

      test('should not call sendAutomaticExposure when flagValue is not set', async () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {},
        });

        client.setAutomaticExposuresMode(true, automaticAnalyticsHandler);
        const sendAutomaticExposureSpy = jest.spyOn(
          client,
          // @ts-ignore Spying on private function
          'sendAutomaticExposure',
        );

        client.trackFeatureFlag('non-existant-key', {
          triggerReason: ExposureTriggerReason.AutoExposure,
        });

        expect(sendAutomaticExposureSpy).not.toHaveBeenCalled();
      });

      test('should default to a manual exposure trigger if no trigger reason is supplied', async () => {
        const client = new FeatureFlagClient({
          analyticsHandler,
          flags: {
            'my.experiment': {
              value: '111-bbbbbb-ccc',
              explanation: { kind: 'SIMPLE_EVAL' },
            },
          },
        });

        client.setAutomaticExposuresMode(false, automaticAnalyticsHandler);

        client.trackFeatureFlag('my.experiment', {});

        expect(automaticAnalyticsHandler.sendOperationalEvent).toBeCalledTimes(
          0,
        );

        expect(analyticsHandler).toHaveBeenCalledWith({
          action: 'exposed',
          actionSubject: 'feature',
          attributes: {
            flagKey: 'my.experiment',
            reason: 'SIMPLE_EVAL',
            ruleId: undefined,
            value: '111-bbbbbb-ccc',
          },
          tags: ['manualExposure', 'measurement'],
          highPriority: true,
          source: '@atlaskit/feature-flag-client',
        });
      });
    });
  });
});
