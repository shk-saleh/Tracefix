/**
 * GET /api/github/repositories/[owner]/[repo]
 * Returns details for a specific repository.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createGitHubClient, getRepository, getBranches } from "@/lib/github/client";

interface Params {
  params: Promise<{ owner: string; repo: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { owner, repo } = await params;

  try {
    const octokit = createGitHubClient(session.githubAccessToken);
    const [repoData, branches] = await Promise.all([
      getRepository(octokit, owner, repo),
      getBranches(octokit, owner, repo),
    ]);

    return NextResponse.json({
      repository: {
        id: repoData.id,
        name: repoData.name,
        fullName: repoData.full_name,
        owner: repoData.owner.login,
        ownerAvatar: repoData.owner.avatar_url,
        description: repoData.description,
        private: repoData.private,
        htmlUrl: repoData.html_url,
        cloneUrl: repoData.clone_url,
        defaultBranch: repoData.default_branch,
        language: repoData.language,
        stars: repoData.stargazers_count,
        updatedAt: repoData.updated_at,
        visibility: repoData.visibility,
      },
      branches: branches.map((b) => ({
        name: b.name,
        sha: b.commit.sha,
        protected: b.protected,
      })),
    });
  } catch (err) {
    console.error("[GitHub repo details error]", err);
    const message = err instanceof Error ? err.message : "Failed to fetch repository";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
