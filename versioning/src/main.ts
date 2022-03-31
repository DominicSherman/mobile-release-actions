import * as core from '@actions/core';
import { updateEasAppJson } from './utils/eas';

import { createGithubTag } from './utils/github';
import { writeBuildAndAppVersions } from './utils/native';
import { getCurrentTag, getNewTag } from './utils/tags';
import { validateVersionChangeType } from './utils/validation';

const main = async (): Promise<void> => {
  const githubAuthToken = core.getInput('github-auth-token');
  const branchToTag = core.getInput('branch-to-tag') || 'main';
  const versionChangeType = validateVersionChangeType(core.getInput('version-change-type'));
  const buildVersion = core.getInput('build-version') || '1';
  const updateEas = core.getBooleanInput('update-eas');

  const currentTag = await getCurrentTag(githubAuthToken);
  const newTag = getNewTag({
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

  if (updateEas) {
    await updateEasAppJson({
      buildVersion,
      newTag,
    });
  }
};

main().catch((e) => core.setFailed(e instanceof Error ? e.message : JSON.stringify(e)));
