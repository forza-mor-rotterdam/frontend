import queryStringParser from './services/query-string-parser/query-string-parser';
import randomStringGenerator from './services/random-string-generator/random-string-generator';
import accessTokenParser from './services/access-token-parser/access-token-parser';
import CONFIGURATION from '../configuration/configuration';

const storage = global.localStorage ? global.localStorage : global.sessionStorage;

// A map of the error keys, that the OAuth2 authorization service can return, to a full description
const ERROR_MESSAGES = {
  invalid_request:
    'The request is missing a required parameter, includes an invalid parameter value, includes a parameter more than once, or is otherwise malformed.',
  unauthorized_client: 'The client is not authorized to request an access token using this method.',
  access_denied: 'The resource owner or authorization server denied the request.',
  unsupported_response_type: 'The authorization server does not support obtaining an access token using this method.',
  invalid_scope: 'The requested scope is invalid, unknown, or malformed.',
  server_error:
    'The authorization server encountered an unexpected condition that prevented it from fulfilling the request.',
  temporarily_unavailable:
    'The authorization server is currently unable to handle the request due to a temporary overloading or maintenance of the server.',
};

// The parameters the OAuth2 authorization service will return on success
const AUTH_PARAMS = ['access_token', 'token_type', 'expires_in', 'state'];

const domainList = ['datapunt', 'grip'];

function getDomain(domain) {
  // TODO
  // Add business logic for the GRIP or datapunt indentity provider (for instance by mapping the domain from the url)
  // ex: parse https://waternet.data.amsterdam.nl, if(waternet) return grip
  // default value is datapunt
  return domain || domainList[0];
}

// The keys of values we need to store in the local storage
const STATE_TOKEN_KEY = 'stateToken'; // OAuth2 state token (prevent CSRF)
const NONCE_KEY = 'nonce'; // OpenID Connect nonce (prevent replay attacks)
const ACCESS_TOKEN_KEY = 'accessToken'; // OAuth2 access token
const OAUTH_DOMAIN_KEY = 'oauthDomain'; // Domain that is used for login

let tokenData = {};

/**
 * Finishes an error from the OAuth2 authorization service.
 *
 * @param code {string} Error code as returned from the service.
 * @param description {string} Error description as returned from the
 * service.
 */
function handleError(code, description) {
  storage.removeItem(STATE_TOKEN_KEY);

  // Remove parameters from the URL, as set by the error callback from the
  // OAuth2 authorization service, to clean up the URL.
  global.location.assign(`${global.location.protocol}//${global.location.host}${global.location.pathname}`);

  throw new Error(`Authorization service responded with error ${code} [${description}] (${ERROR_MESSAGES[code]})`);
}

/**
 * Handles errors in case they were returned by the OAuth2 authorization
 * service.
 */
function catchError() {
  const params = queryStringParser(global.location.search);
  if (params && params.error) {
    handleError(params.error, params.error_description);
  }
}

/**
 * Gets the access token and return path, and clears the local storage.
 */
function handleCallback() {
  // Parse query string into object
  const params = queryStringParser(global.location.hash);
  if (!params) {
    return;
  }

  // Make sure all required parameters are there
  if (AUTH_PARAMS.some(param => params[param] === undefined)) {
    return;
  }

  // The state param must be exactly the same as the state token we
  // have saved in local storage (to prevent CSRF)
  const localStateToken = storage.getItem(STATE_TOKEN_KEY);
  const paramStateToken = decodeURIComponent(params.state);
  if (paramStateToken !== localStateToken) {
    throw new Error(
      `Authenticator encountered an invalid state token (${params.state}). Local state token: ${localStateToken}.`
    );
  }

  const accessToken = params.access_token;

  tokenData = accessTokenParser(accessToken);
  const localNonce = storage.getItem(NONCE_KEY);
  if (tokenData.nonce && tokenData.nonce !== localNonce) {
    throw new Error(
      `Authenticator encountered an invalid nonce (${tokenData.nonce}). Local nonce token: ${localNonce}.`
    );
  }

  storage.setItem(ACCESS_TOKEN_KEY, accessToken);

  storage.removeItem(STATE_TOKEN_KEY);
  storage.removeItem(NONCE_KEY);

  // Clean up URL; remove query and hash
  // https://stackoverflow.com/questions/4508574/remove-hash-from-url
  global.history.replaceState('', document.title, global.location.pathname);
}

/**
 * Returns the access token from local storage when available.
 *
 * @returns {string} The access token.
 */
export function getAccessToken() {
  return storage.getItem(ACCESS_TOKEN_KEY);
}

export function getOauthDomain() {
  return storage.getItem(OAUTH_DOMAIN_KEY);
}

/**
 * Restores the access token from local storage when available.
 */
function restoreAccessToken() {
  const accessToken = getAccessToken();
  if (accessToken) {
    tokenData = accessTokenParser(accessToken);
  }
}

/**
 * Redirects to the OAuth2 authorization service.
 */
export function login(domain) {
  if (typeof global.Storage === 'undefined') {
    throw new TypeError('Storage not available; cannot proceed with logging in');
  }

  // Get the URI the OAuth2 authorization service needs to use as callback
  // const callback = encodeURIComponent(`${location.protocol}//${location.host}${location.pathname}`);
  // Get a random string to prevent CSRF
  const stateToken = randomStringGenerator();
  const nonce = randomStringGenerator();
  if (!stateToken || !nonce) {
    throw new Error('crypto library is not available on the current browser');
  }

  storage.removeItem(ACCESS_TOKEN_KEY);

  storage.setItem(STATE_TOKEN_KEY, stateToken);
  storage.setItem(NONCE_KEY, nonce);
  storage.setItem(OAUTH_DOMAIN_KEY, domain);

  const encodedClientId = encodeURIComponent(CONFIGURATION.OIDC_CLIENT_ID);
  const encodedResponseType = encodeURIComponent(CONFIGURATION.OIDC_RESPONSE_TYPE);
  const encodedScope = encodeURIComponent(CONFIGURATION.OIDC_SCOPE);
  const encodedStateToken = encodeURIComponent(stateToken);
  const encodedNonce = encodeURIComponent(nonce);
  const encodedRedirectUri = encodeURIComponent(
    `${global.location.protocol}//${global.location.host}/manage/incidents`
  );
  const encodedDomain = encodeURIComponent(getDomain(domain));

  global.location.assign(
    `${CONFIGURATION.OIDC_AUTH_ENDPOINT}` +
      `?client_id=${encodedClientId}` +
      `&response_type=${encodedResponseType}` +
      `&scope=${encodedScope}` +
      `&state=${encodedStateToken}` +
      `&nonce=${encodedNonce}` +
      `&redirect_uri=${encodedRedirectUri}` +
      `&idp_id=${encodedDomain}`
  );
}

export function logout() {
  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(OAUTH_DOMAIN_KEY);
}

/**
 * Initializes the auth service when needed. Catches any callback params and
 * errors from the OAuth2 authorization service when available.
 *
 * When no access token is available it initiates the login process which will
 * redirect the user to the OAuth2 authorization service.
 *
 */
export function initAuth() {
  restoreAccessToken(); // Restore acces token from local storage
  catchError(); // Catch any error from the OAuth2 authorization service
  handleCallback(); // Handle a callback from the OAuth2 authorization service
}

export const isAuthenticated = () => {
  const decoded = accessTokenParser(getAccessToken());

  if (!decoded?.expiresAt) return false;

  const hasExpired = decoded.expiresAt * 1000 < Date.now();

  return !hasExpired;
};

export function getScopes() {
  return tokenData.scopes || [];
}

export function getName() {
  return tokenData.name || '';
}

/**
 * Creates an instance of the native JS `Headers` class containing the
 * authorization headers needed for an API call.
 *
 * @returns {Object<string, string>} The headers needed for an API call.
 */
export function getAuthHeaders() {
  const accessToken = getAccessToken();
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export const authenticate = () => {
  initAuth();

  const accessToken = getAccessToken();

  if (accessToken) {
    return { userName: getName(), userScopes: getScopes(), accessToken };
  }

  return null;
};
