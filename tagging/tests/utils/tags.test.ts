import { VersionChangeType } from '../../src/types';
import { getNewTag } from '../../src/utils/tags';

describe('tags', () => {
  describe('getNewTag', () => {
    const currentVersion = '1.0.0';

    it.each([
      ['major', 'v2.0.0-2'],
      ['minor', 'v1.1.0-2'],
      ['patch', 'v1.0.1-2'],
      ['none', 'v1.0.0-2'],
    ])('should handle %s version bumps', (type, newTag) => {
      expect(
        getNewTag({
          currentVersion,
          versionChangeType: type as VersionChangeType,
          buildVersion: '2',
        })
      ).toEqual(newTag);
    });
  });
});
