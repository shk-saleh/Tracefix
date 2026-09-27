#!/bin/sh
# Clone the repository into /workspace/repo
# Environment: CLONE_URL, BRANCH
set -e

git clone \
  --depth 50 \
  --branch "${BRANCH:-main}" \
  "${CLONE_URL}" \
  /workspace/repo

echo "Clone complete"
