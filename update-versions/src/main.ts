import * as core from '@actions/core';
import { writeBuildAndAppVersions } from './update-versions';

const main = async (): Promise<void> => {
  const tag = core.getInput('tag');
  const [appVersion, buildVersion] = tag.split('-');

  await writeBuildAndAppVersions({
    appVersion,
    buildVersion,
  });
};

main().catch((e) => core.setFailed(e instanceof Error ? e.message : JSON.stringify(e)));
