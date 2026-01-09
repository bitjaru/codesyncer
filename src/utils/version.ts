import * as path from 'path';
import * as fs from 'fs';

/**
 * Read version from package.json
 * Single source of truth for version number
 */
function getPackageJson(): { version: string; name: string; description: string } {
  const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
  return JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
}

export const VERSION = getPackageJson().version;
export const PACKAGE_NAME = getPackageJson().name;
export const DESCRIPTION = getPackageJson().description;
