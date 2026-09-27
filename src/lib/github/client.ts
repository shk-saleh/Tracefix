/**
 * GitHub API client backed by Octokit.
 * Always call with a user-specific access token obtained from the session.
 */
import { Octokit } from "octokit";

export function createGitHubClient(accessToken: string): Octokit {
  return new Octokit({ auth: accessToken });
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url: string };
  description: string | null;
  private: boolean;
  html_url: string;
  clone_url: string;
  default_branch: string;
  language: string | null;
  stargazers_count: number;
  updated_at: string | null;
  pushed_at: string | null;
  visibility: string;
}

export interface GitHubBranch {
  name: string;
  commit: { sha: string };
  protected: boolean;
}

export async function getAuthenticatedUser(octokit: Octokit) {
  const { data } = await octokit.rest.users.getAuthenticated();
  return data;
}

export async function getRepositories(
  octokit: Octokit,
  options: {
    type?: "all" | "owner" | "member";
    sort?: "created" | "updated" | "pushed" | "full_name";
    direction?: "asc" | "desc";
    per_page?: number;
    page?: number;
  } = {}
): Promise<GitHubRepository[]> {
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    type: options.type ?? "owner",
    sort: options.sort ?? "updated",
    direction: options.direction ?? "desc",
    per_page: options.per_page ?? 50,
    page: options.page ?? 1,
  });
  return data as GitHubRepository[];
}

export async function getRepository(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<GitHubRepository> {
  const { data } = await octokit.rest.repos.get({ owner, repo });
  return data as GitHubRepository;
}

export async function getBranches(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<GitHubBranch[]> {
  const { data } = await octokit.rest.repos.listBranches({
    owner,
    repo,
    per_page: 50,
  });
  return data as GitHubBranch[];
}
