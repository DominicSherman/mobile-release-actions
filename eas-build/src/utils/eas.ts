import fs from 'fs/promises';

interface UpdateEasJsonProps {
  appleId: string;
  appleAscAppId: string;
  appleTeamId: string;
  androidExpoDeployKeyPath: string;
  androidSubmitTrack: string;
}

export const updateEasAppJson = async ({
  appleId,
  appleAscAppId,
  appleTeamId,
  androidExpoDeployKeyPath,
  androidSubmitTrack,
}: UpdateEasJsonProps): Promise<void> => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const easJson = require(`${process.env.GITHUB_WORKSPACE}/eas.json`);

  const json = {
    ...easJson,
  };

  json.submit = {
    beta: {
      ios: {
        appleId,
        ascAppId: appleAscAppId,
        appleTeamId,
      },
      android: {
        serviceAccountKeyPath: androidExpoDeployKeyPath,
        track: androidSubmitTrack,
      },
    },
    production: {
      ios: {
        appleId: appleId,
        ascAppId: appleAscAppId,
        appleTeamId,
      },
      android: {
        serviceAccountKeyPath: androidExpoDeployKeyPath,
        track: androidSubmitTrack,
      },
    },
  };

  await fs.writeFile(`${process.env.GITHUB_WORKSPACE}/eas.json`, JSON.stringify(json));
};
