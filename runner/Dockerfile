FROM node:22-bookworm-slim

# Install system dependencies
RUN apt-get update \
    && apt-get install -y git \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally; yarn is already bundled via corepack in node:22 —
# enable it instead of re-installing to avoid EEXIST on /usr/local/bin/yarn.
RUN npm install -g pnpm --quiet \
    && corepack enable

# Create non-root user for security
RUN useradd -m -u 1001 runner

# Pre-create directories that npm/pnpm/yarn will write to as the runner user.
# /tmp is root-owned inside the container — use the runner home instead.
RUN mkdir -p /workspace \
    && mkdir -p /home/runner/.npm \
    && mkdir -p /home/runner/.pnpm-store \
    && mkdir -p /home/runner/.yarn/berry \
    && chown -R runner:runner /workspace /home/runner

USER runner
WORKDIR /workspace

CMD ["bash"]
