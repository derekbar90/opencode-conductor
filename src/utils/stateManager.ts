import { join } from "path";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";

export interface SetupState {
  last_successful_step: string;
}

export class StateManager {
  private statePath: string;

  constructor(workDir: string) {
    this.statePath = join(workDir, "conductor", "setup_state.json");
  }

  ensureConductorDir() {
    const dir = join(this.statePath, "..");
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  readState(): SetupState {
    if (!existsSync(this.statePath)) {
      return { last_successful_step: "" };
    }
    try {
      return JSON.parse(readFileSync(this.statePath, "utf-8"));
    } catch (e) {
      return { last_successful_step: "" };
    }
  }

  writeState(step: string) {
    this.ensureConductorDir();
    const state: SetupState = { last_successful_step: step };
    writeFileSync(this.statePath, JSON.stringify(state, null, 2));
  }
}
