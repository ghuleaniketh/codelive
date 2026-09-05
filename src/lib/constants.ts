/**
 * Shared constants between frontend and backend
 */

export const COOKIE_NAME = "__Host-id_token";
export const OAUTH_STATE_COOKIE = "__Host-oauth_state";
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
export const UNAUTHED_ERR_MSG = "UNAUTHORIZED";

/**
 * Encode OAuth state parameter for security
 */
export function encodeOAuthState(state: { redirectUri: string; nonce: string }): string {
  return btoa(JSON.stringify(state));
}

/**
 * Decode OAuth state parameter
 */
export function decodeOAuthState(state: string): { redirectUri: string; nonce: string } {
  return JSON.parse(atob(state));
}
