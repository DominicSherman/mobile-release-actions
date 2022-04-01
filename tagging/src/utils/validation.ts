import { VersionChangeType } from '../types';

export const validateVersionChangeType = (versionChangeType: string): VersionChangeType => {
  if (!versionChangeType) {
    return 'none';
  }

  if (['patch', 'minor', 'major', 'none'].includes(versionChangeType)) {
    return versionChangeType as VersionChangeType;
  }

  throw new Error('Invalid version change type');
};
