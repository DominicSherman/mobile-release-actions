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
  branchToTag,
  currentTag,
  newTag,
}: CreateGithubTagProps): Promise<void> => {
  const octokit = github.getOctokit(githubAuthToken);

  const commitsResponse = await octokit.rest.repos.compareCommitsWithBasehead({
    ...github.context.repo,
    basehead: `${currentTag}...${branchToTag}`,
  });
  const commits = commitsResponse?.data?.commits || [];
  // generate list of commit messages for release body
  const commitMessages = commits.map(
    (item) => `* ${item.commit.message} ${item.html_url} - @${item.author?.login || 'unknown'}`
  );
  // generate body for release
  const body = `Released from ${branchToTag}\n\n${commitMessages.join('\n ')}`;

  await octokit.rest.repos.createRelease({
    ...github.context.repo,
    name: newTag,
    body,
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
