import path from 'path';
import fs from 'fs';
import { Xcode } from 'pbxproj-dom/xcode';
import plist from 'plist';
import { uniq as unique, flattenDeep } from 'lodash';

const IOS_DIR = path.join(process.env.GITHUB_WORKSPACE || '', 'ios');
const BUILD_GRADLE_PATH = path.join(process.env.GITHUB_WORKSPACE || '', 'android/app/build.gradle');

interface WriteBuildAndAppVersionProps {
  tag: string;
}

/**
 * Write iOS and Android Build/App versions
 */
export const writeBuildAndAppVersions = async ({ tag }: WriteBuildAndAppVersionProps) => {
  const [appVersionWithV, stringBuildVersion] = tag.split('-');
  const appVersion = appVersionWithV.replace('v', '');
  const buildVersion = Number(stringBuildVersion);

  await updateIOSVersions({ appVersion, buildVersion });
  await updateAndroidVersions({ appVersion, buildVersion });
};

interface AppVersionAndBuildVersion {
  appVersion: string;
  buildVersion: number;
}

/**
 * Updates ios projects/plists with new app versions
 */
async function updateIOSVersions({ appVersion, buildVersion }: AppVersionAndBuildVersion) {
  console.log(`-- Updating iOS App version to ${appVersion} --`);
  console.log(`-- Updating iOS build version to ${buildVersion} --`);

  const xcodeProjects = fs.readdirSync(IOS_DIR).filter((file) => /\.xcodeproj$/i.test(file));

  const projectFolder = path.join(IOS_DIR, xcodeProjects[0]);
  const xcode = Xcode.open(path.join(projectFolder, 'project.pbxproj'));

  await updateXcodeProjects({ xcode, buildVersion, appVersion });
  await updatePlists({ xcode, buildVersion, appVersion });
}

interface UpdateXcodeProjects extends AppVersionAndBuildVersion {
  xcode: any;
}

/**
 * Updates the CURRENT_PROJECT_VERSION within an xcode project
 */
async function updateXcodeProjects({ xcode, buildVersion }: UpdateXcodeProjects) {
  xcode.document.projects.forEach((project: any) => {
    project.targets.filter(Boolean).forEach((target: any) => {
      target.buildConfigurationsList.buildConfigurations.forEach((config: any) => {
        config.patch({
          buildSettings: {
            CURRENT_PROJECT_VERSION: buildVersion,
          },
        });
      });
    });
  });

  return xcode.save();
}

/**
 * Updates plists with a new app/build version
 */
async function updatePlists({ xcode, appVersion, buildVersion }: UpdateXcodeProjects) {
  const plistFileNames = getPlistFilenames(xcode);

  const plistsToSave = plistFileNames.map((filename: any) => {
    const plistPath = path.join(IOS_DIR, filename);
    const plistObject = plist.parse(fs.readFileSync(plistPath, 'utf8')) as any;

    plistObject.CFBundleShortVersionString = appVersion;
    plistObject.CFBundleVersion = `${buildVersion}`;

    const file = plist.build(plistObject);
    return fs.promises.writeFile(plistPath, file);
  });

  await Promise.all(plistsToSave);
}

/**
 * Gets plists used in a given project
 */
function getPlistFilenames(xcode: any) {
  return unique(
    flattenDeep(
      xcode.document.projects.map((project: any) => {
        return project.targets.filter(Boolean).map((target: any) => {
          return target.buildConfigurationsList.buildConfigurations.map((config: any) => {
            return config.ast.value.get('buildSettings').get('INFOPLIST_FILE').text;
          });
        });
      })
    )
  );
}

/**
 * Updates plists with a new app/build version
 */
async function updateAndroidVersions({ appVersion, buildVersion }: AppVersionAndBuildVersion) {
  console.log(`-- Updating Android App version to ${appVersion} --`);
  console.log(`-- Updating Android build version to ${buildVersion} --`);
  let gradleFile: string | Buffer = await fs.promises.readFile(BUILD_GRADLE_PATH);

  // Note that buildVersion MUST be an integer, or Android builds will fail. See:
  //  https://stackoverflow.com/a/64708656/344391
  gradleFile = gradleFile.toString().replace(/versionCode (\d+)/, `versionCode ${buildVersion}`);

  gradleFile = gradleFile
    .toString()
    .replace(/versionName (["'])(.*)["']/, `versionName $1${appVersion}$1`);

  return fs.promises.writeFile(BUILD_GRADLE_PATH, gradleFile);
}
