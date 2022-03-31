import { VersionChangeType } from '../types';

// TAG - v1.0.0-1
// VERSION - 1.0.0

export const getCurrentTag = (): string => {
  // TODO pull from GitHub or app.json?
  return 'v0.0.1-0';
};

/**
 * Returns the version based on the tag
 * @param {string} currentTag ex: v1.0.0-1
 * @returns {string} ex: 1.0.0
 */
export const getVersionFromTag = (currentTag: string): string => {
  const [tagVersion, _tagVersionNumber] = currentTag.split('-');

  return tagVersion.replace('v', '');
};

interface GetNewTagProps {
  currentTag: string;
  versionChangeType: VersionChangeType;
}

/**
 * Bump tag based on version change type
 * If there is a version bump, then reset the version number to 1
 * If there is not a version bump, then increment the version number
 */
export const getNewTag = ({ currentTag, versionChangeType }: GetNewTagProps): string => {
  const [tagVersion, tagVersionNumber] = currentTag.split('-');
  const cleanTag = tagVersion.replace('v', '');
  const [major, minor, patch] = cleanTag.split('.');

  if (versionChangeType === 'major') {
    return `v${Number(major) + 1}.0.0-1`;
  } else if (versionChangeType === 'minor') {
    return `v${major}.${Number(minor) + 1}.0-1`;
  } else if (versionChangeType === 'patch') {
    return `v${major}.${minor}.${Number(patch) + 1}-1`;
  }

  return `v${cleanTag}-${Number(tagVersionNumber) + 1}`;
};