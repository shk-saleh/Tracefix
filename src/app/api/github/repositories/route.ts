/**
 * GET /api/github/repositories
 * Returns the authenticated user's repositories.
 */
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createGitHubClient, getRepositories } from "@/lib/github/client";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const per_page = Math.min(parseInt(searchParams.get("per_page") ?? "50", 10), 100);
  const sort = (searchParams.get("sort") ?? "updated") as "updated" | "created" | "pushed" | "full_name";

  try {
    const octokit = createGitHubClient(session.githubAccessToken);
    const repos = await getRepositories(octokit, { sort, per_page, page });

    return NextResponse.json({
      repositories: repos.map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        owner: r.owner.login,
        ownerAvatar: r.owner.avatar_url,
        description: r.description,
        private: r.private,
        htmlUrl: r.html_url,
        cloneUrl: r.clone_url,
        defaultBranch: r.default_branch,
        language: r.language,
        stars: r.stargazers_count,
        updatedAt: r.updated_at,
        pushedAt: r.pushed_at,
        visibility: r.visibility,
      })),
    });
  } catch (err) {
    console.error("[GitHub repositories error]", err);
    const message = err instanceof Error ? err.message : "Failed to fetch repositories";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
