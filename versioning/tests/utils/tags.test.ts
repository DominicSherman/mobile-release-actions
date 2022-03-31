import { VersionChangeType } from './../../src/types';
import { getNewTag } from '../../src/utils/tags';

describe('tags', () => {
  describe('getNewTag', () => {
    const currentTag = 'v1.0.0-1';

    it.each([
      ['major', 'v2.0.0-1'],
      ['minor', 'v1.1.0-1'],
      ['patch', 'v1.0.1-1'],
      ['none', 'v1.0.0-2'],
    ])('should handle %s version bumps', (type, newTag) => {
      expect(
        getNewTag({
          currentTag,
          versionChangeType: type as VersionChangeType,
        })
      ).toEqual(newTag);
    });
  });
});
