/**
 * Runner factory — returns the correct runner based on RUNNER_MODE env var.
 */
import { Runner } from "./types";
import { LocalDockerRunner } from "./local-runner";
import { CloudRunner } from "./cloud-runner";

let _runner: Runner | null = null;

export function getRunner(): Runner {
  if (_runner) return _runner;

  const mode = process.env.RUNNER_MODE ?? "local";

  if (mode === "cloud") {
    _runner = new CloudRunner();
  } else {
    _runner = new LocalDockerRunner();
  }

  return _runner;
}

// Reset singleton (useful for testing)
export function resetRunner() {
  _runner = null;
}
