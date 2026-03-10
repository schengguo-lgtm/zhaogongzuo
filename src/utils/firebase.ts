/**
 * Utility for detecting whether a Firebase config value contains a real key
 * versus a placeholder inserted by the project template.
 */

/**
 * Common placeholder patterns used in .env.example and app.json templates.
 * A value matches if it is empty, or if any of these patterns appear in it
 * (case-insensitive), or if it is the literal string "null" / "undefined".
 */
const PLACEHOLDER_PATTERNS: RegExp[] = [
  /^YOUR_/i,        // YOUR_API_KEY, YOUR_PROJECT_ID, etc.
  /^PLACEHOLDER/i,  // PLACEHOLDER_VALUE
  /^EXAMPLE_/i,     // EXAMPLE_KEY
  /^REPLACE_/i,     // REPLACE_ME
  /^INSERT_/i,      // INSERT_HERE
  /^<.+>$/,         // <MY_KEY>
  /^\[.+\]$/,       // [MY_KEY]
  /^null$/i,
  /^undefined$/i,
];

/** Returns true if the value looks like a real, user-supplied config value. */
export function isRealConfigValue(value: string | undefined | null): boolean {
  if (!value || value.trim() === '') return false;
  return !PLACEHOLDER_PATTERNS.some((re) => re.test(value.trim()));
}

/**
 * Returns true if the Firebase config contains real (non-placeholder) values
 * for the three fields that are required to connect: apiKey, projectId, appId.
 */
export function isFirebaseConfigured(cfg: {
  apiKey: string;
  projectId: string;
  appId: string;
}): boolean {
  return (
    isRealConfigValue(cfg.apiKey) &&
    isRealConfigValue(cfg.projectId) &&
    isRealConfigValue(cfg.appId)
  );
}
