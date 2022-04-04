import * as github from '@actions/github';

import { DEFAULT_APP_VERSION } from '../constants';

interface CreateGithubTagProps {
  githubAuthToken: string;
  branchToTag: string;
  currentTag: string;
  newTag: string;
}

export const createGithubTag = async ({
  githubAuthToken,
  currentTag,
  newTag,
}: CreateGithubTagProps): Promise<void> => {
  const octokit = github.getOctokit(githubAuthToken);

  const { data: releaseNotes } = await octokit.rest.repos.generateReleaseNotes({
    ...github.context.repo,
    tag_name: newTag,
    previous_tag_name: currentTag,
  });
  await octokit.rest.repos.createRelease({
    ...github.context.repo,
    ...releaseNotes,
    target_commitish: github.context.sha,
    tag_name: newTag,
  });
};

export const getMostRecentGithubTag = async (githubAuthToken: string): Promise<string> => {
  const octokit = github.getOctokit(githubAuthToken);
  const tagsResponse = await octokit.rest.repos.listTags({
    ...github.context.repo,
    per_page: 10,
  });
  const tags = tagsResponse?.data || [];

  const mostRecentTag = tags[0]?.name || `v${DEFAULT_APP_VERSION}-1`;

  return mostRecentTag;
};
