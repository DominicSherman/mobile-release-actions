import fetch from 'node-fetch';
import { DEFAULT_APP_VERSION } from '../constants';

interface CommitItem {
  commit: {
    message: string;
  };
  html_url: string;
  author: {
    login: string;
  };
}

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
  const headers = getHeaders(githubAuthToken);

  // get commits to HEAD since most recent tag
  const commitSinceTagUrl = `${process.env.GITHUB_API_URL}/repos/${process.env.GITHUB_REPOSITORY}/compare/${currentTag}...HEAD`;
  const commitsSinceTagResponse = await fetch(commitSinceTagUrl, { headers });
  const commitSinceTagData = await commitsSinceTagResponse.json();
  const commits = commitSinceTagData.commits || [];

  // generate list of commit messages for release body
  const commitMessages = commits.map(
    (item: CommitItem) => `* ${item.commit.message} ${item.html_url} - @${item.author.login}`
  );

  const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');

  // generate body for release
  const body = `${commitMessages.join('\n ')}`;

  // create release
  await fetch(`${process.env.GITHUB_API_URL}/repos/${process.env.GITHUB_REPOSITORY}/releases`, {
    body: JSON.stringify({
      owner,
      repo,
      tag_name: newTag,
      target_commitish: branchToTag,
      name: newTag,
      body,
    }),
    method: 'POST',
    headers,
  });
};

export const getMostRecentGithubTag = async (githubAuthToken: string): Promise<string> => {
  // get existing tags
  const tagsResponse = await fetch(
    `${process.env.GITHUB_API_URL}/repos/${process.env.GITHUB_REPOSITORY}/tags`,
    {
      headers: getHeaders(githubAuthToken),
    }
  );
  const tagsData = await tagsResponse.json();

  // default if the repository doesn't have any tags created yet
  let mostRecentTag = `v${DEFAULT_APP_VERSION}-1`;

  if (tagsData && Array.isArray(tagsData) && tagsData[0] && tagsData[0].name) {
    // specify most recent tag if there are existing tags in the repo
    mostRecentTag = tagsData[0].name;
  }

  return mostRecentTag;
};

const getHeaders = (token: string) => {
  if (!token) {
    throw new Error('Github auth token not specified');
  }
  return {
    Accept: 'application/vnd.github.v3+json',
    Authorization: `Bearer ${token}`,
  };
};
