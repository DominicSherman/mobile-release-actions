import * as core from '@actions/core';
import { updateEasAppJson } from './utils/eas';

const main = async (): Promise<void> => {
  const appleId = core.getInput('apple-id');
  const appleAscAppId = core.getInput('apple-asc-app-id');
  const appleTeamId = core.getInput('apple-team-id');
  const androidExpoDeployKeyPath = core.getInput('android-expo-deploy-key-path');
  const androidSubmitTrack = core.getInput('android-submit-track');

  await updateEasAppJson({
    appleId,
    appleAscAppId,
    appleTeamId,
    androidExpoDeployKeyPath,
    androidSubmitTrack,
  });
};

main().catch((e) => core.setFailed(e instanceof Error ? e.message : JSON.stringify(e)));
