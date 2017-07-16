# Oauth Service

Ecommerce Cart service, part of the [microbase](http://microbase.io) 
ecosystem.

# Features

This service only provides JWT client credential tokens. The tokens validation is made in the service itself.

## Configuration

Use the properties key `token:secretKey` to configure secret key to sign the token. The same key should be used in the services to validate the token.

Use the properties key `token:expirationMinutes` to configure the token expiration time (a year by default).

## Token storage
if the database is configured (`db` key in the properties), the following token properties are saved to it.
 
. Token ID
. Token issue time
. Token expiration time
. Subject
. Scope
