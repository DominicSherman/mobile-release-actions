import * as core from '@actions/core';

import { createGithubTag } from './utils/github';
import { writeBuildAndAppVersions } from './utils/native';
import { getCurrentTag, getNewTag } from './utils/tags';
import { validateVersionChangeType } from './utils/validation';

const main = async (): Promise<void> => {
  const githubAuthToken = core.getInput('github-auth-token');
  const branchToTag = core.getInput('branch-to-tag') || 'main';
  const versionChangeType = validateVersionChangeType(core.getInput('version-change-type'));
  const buildVersion = core.getInput('build-version') || '1';

  const currentTag = await getCurrentTag(githubAuthToken);
  const newTag = getNewTag({
    buildVersion,
    currentTag,
    versionChangeType,
  });

  await writeBuildAndAppVersions({
    buildVersion,
    newTag,
  });

  await createGithubTag({
    githubAuthToken,
    branchToTag,
    currentTag,
    newTag,
  });
};

main().catch((e) => core.setFailed(e instanceof Error ? e.message : JSON.stringify(e)));
