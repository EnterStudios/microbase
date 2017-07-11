const moment = require('moment');
const nJwt = require('njwt');

module.exports = (base) => {

  const revokedTokensUri = base.config.get('services:uris:oauth.token.revoked.list');
  const revokedListHeaders = base.config.get('revokedListHeaders');
  const revokedListTimeout = base.config.get('revokedListTimeout');
  const revokedListActive = base.config.get('revokedListActive');

  let tokens;

  function loadTokens() {
    base.services
      .call({
        name: revokedTokensUri,
        headers: revokedListHeaders,
        circuitbreaker: {
          timeout: revokedListTimeout
        }
      })
      .then(response => {
        if (!response.ok) throw base.utils.Error('cannot_load_revoked_tokens');
        response.tokens.forEach(t => tokens.set(t, 1));
      })
      .then(() => {
        if (base.logger.isDebugEnabled()) base.logger.debug('[oauth] revoked tokens loaded');
      })
      .catch(error => {
        base.logger.error('[oauth]', error);
      });
  }

  base.cache
    .create('revokedTokens', { expiresIn: 2147483646 }) // 24 days
    .then((cache) => {
      tokens = cache;
      if (revokedListActive) loadTokens();
    });

  // Reload list on Token change
  if (revokedListActive) {
    const oauthChannel = base.config.get('bus:channels:oauth:name');
    base.bus.subscribe(`${oauthChannel}.TOKENREVOKE`, (/* msg */) => {
      loadTokens();
    });
  }

  return {
    isRevoked: (tokenId) =>
      tokens.get(tokenId)
        .then((token) => token !== null),

    generateToken: (iss, tokenSecretKey, client, sub, scope, tokenValiditySeconds) => {
      const claims = {
        iss,
        sub,
        scope
      };
      const jwt = nJwt.create(claims, tokenSecretKey);
      if (tokenValiditySeconds && tokenValiditySeconds > 0) {
        const expirationTime = moment().add(tokenValiditySeconds, 'seconds').toDate();
        jwt.setExpiration(expirationTime.getTime());
      } else {
        jwt.setExpiration();
      }
      return jwt;
    },

    isValid: (token, tokenSecretKey) => {
      try {
        nJwt.verify(token, tokenSecretKey);
      } catch (e) {
        return false;
      }
      return true;
    }
  };
};
