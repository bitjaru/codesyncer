import * as fs from 'fs-extra';
import * as path from 'path';
import { Language } from '../types';

/**
 * Setup state for recovery
 */
export interface SetupState {
  step: number;
  lang: Language;
  projectName: string;
  githubUsername: string;
  workspaceMode: 'single' | 'monorepo' | 'multi-repo';
  selectedRepos?: string[];
  timestamp: string;
}

const STATE_FILENAME = '.setup-state.json';

/**
 * Get the path to the setup state file
 */
function getStatePath(dir: string): string {
  return path.join(dir, '.codesyncer', STATE_FILENAME);
}

/**
 * Save setup state for recovery
 */
export async function saveSetupState(dir: string, state: SetupState): Promise<void> {
  const statePath = getStatePath(dir);
  await fs.ensureDir(path.dirname(statePath));
  await fs.writeJson(statePath, { ...state, timestamp: new Date().toISOString() }, { spaces: 2 });
}

/**
 * Load setup state if exists
 */
export async function loadSetupState(dir: string): Promise<SetupState | null> {
  const statePath = getStatePath(dir);

  try {
    if (await fs.pathExists(statePath)) {
      const state = await fs.readJson(statePath);
      return state as SetupState;
    }
  } catch {
    // Corrupted state file, ignore
  }

  return null;
}

/**
 * Clear setup state (on successful completion)
 */
export async function clearSetupState(dir: string): Promise<void> {
  const statePath = getStatePath(dir);

  try {
    if (await fs.pathExists(statePath)) {
      await fs.remove(statePath);
    }
  } catch {
    // Ignore errors when clearing state
  }
}

/**
 * Check if there's a recoverable state
 */
export async function hasRecoverableState(dir: string): Promise<boolean> {
  const state = await loadSetupState(dir);
  return state !== null;
}
