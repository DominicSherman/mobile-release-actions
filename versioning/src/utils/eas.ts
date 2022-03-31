import fs from 'fs/promises';
import { getVersionFromTag } from './tags';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const easJson = require('eas.json');

// const PLATFORMS = ['ios', 'android'];
const LANES = ['alpha', 'beta', 'production'];

interface UpdateEasJsonProps {
  newTag: string;
  buildVersion: string;
}

export const updateEasAppJson = async ({ newTag }: UpdateEasJsonProps): Promise<void> => {
  const newVersion = getVersionFromTag(newTag);
  const json = {
    ...easJson,
  };

  const [majorVersion, minorVersion, _patchVersion] = newVersion.split('.');

  json.build.base.env = {
    ...(json.build.base.env || {}),
    APP_VERSION: process.env.APP_VERSION,
    BUILD_VERSION: process.env.BUILD_VERSION,
  };

  // add lane specific env vars
  LANES.forEach((lane) => {
    // when active, OTA updates will only be used for patch releases
    const releaseChannel = `${lane}-${majorVersion}-${minorVersion}`;
    json.build[lane].releaseChannel = releaseChannel;
  });

  json.submit = {
    beta: {
      ios: {
        appleId: process.env.APPLE_ID,
        ascAppId: process.env.APPLE_ASC_APP_ID,
      },
      android: {
        serviceAccountKeyPath: process.env.ANDROID_EXPO_DEPLOY_KEY_PATH,
        track: process.env.ANDROID_SUBMIT_TRACK,
      },
    },
    production: {
      ios: {
        appleId: process.env.APPLE_ID,
        ascAppId: process.env.APPLE_ASC_APP_ID,
      },
      android: {
        serviceAccountKeyPath: process.env.ANDROID_EXPO_DEPLOY_KEY_PATH,
        track: process.env.ANDROID_SUBMIT_TRACK,
      },
    },
  };

  await fs.writeFile('eas.json', JSON.stringify(json));
};