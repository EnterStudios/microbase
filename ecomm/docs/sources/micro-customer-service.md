# Customer Service

[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![bitHound Overall Score][bithound-overal-image]][bithound-url]
[![bitHound Code][bithound-code-image]][bithound-url]
[![Dependency status][bithound-image]][bithound-url]
[![Dev Dependency status][bithound-dev-image]][bithound-url]

[npm-url]:https://npmjs.org/package/microbase
[downloads-image]:http://img.shields.io/npm/dm/microbase.svg
[npm-image]:http://img.shields.io/npm/v/microbase.svg

[travis-url]:https://travis-ci.org/microbaseio/micro-customer-service
[travis-image]:http://img.shields.io/travis/microbaseio/micro-customer-service/develop.svg
[coveralls-url]:https://coveralls.io/r/microbaseio/micro-customer-service
[coveralls-image]:https://img.shields.io/coveralls/microbaseio/micro-customer-service/develop.svg

[bithound-url]:https://www.bithound.io/github/microbaseio/micro-customer-service/develop
[bithound-overal-image]:https://www.bithound.io/github/microbaseio/micro-customer-service/badges/score.svg
[bithound-image]:https://img.shields.io/bithound/dependencies/github/microbaseio/micro-customer-service.svg
[bithound-dev-image]:https://img.shields.io/bithound/devDependencies/github/microbaseio/micro-customer-service.svg
[bithound-code-image]:https://www.bithound.io/github/microbaseio/micro-customer-service/badges/code.svg

Ecommerce Customer service, part of the [microbase](http://microbase.io)
ecosystem.

# Features

* Customers and addresses management (create, read, update and delete operations).
* Check customers credentials.

# Entities

The Customer entity holds the information about customers and their addresses.

## Customers

Field | Description | Type | Required | Default
---------|----------|------|---------|------------
id        | Internal unique Customer identifier          | String       | yes | System generated
email     | Customer email.                              | String       | yes |
password  | Customer password.                           | String       | yes |
firstName | Customer first name.                         | String       | yes |
lastName  | Customer last name.                          | String       | yes |
status    | Status of the customer. ACTIVE or INACTIVE.  | String       | no  | ACTIVE
tags      | Tags associated to the customer.             | String       | no  |
addresses | Customer addresses                           | Object List  | no  |

## Addresses

Field | Description | Type | Required | Default
---------|----------|------|---------|------------
id           | Internal unique Address identifier         | String  | yes | System generated
name         | Address name.                              | String  | yes |
firstName    | Customer first name.                       | String  | yes |
lastName     | Customer last name.                        | String  | no  |
address_1    | Address information.                       | String  | yes |
address_2    | Aditional address information.             | String  | no  |
postCode     | Address post code                          | String  | yes |
city         | Address city                               | String  | yes |
state        | Address state                              | String  | yes |
country      | Address country                            | String  | yes |
company      | Name of the company                        | String  | no  |
phone        | Address phone                              | String  | no  |
instructions | Aditional instrucctions for the address    | String  | no  |

# API

The full API documentation can be accessed in the microbase web http://docs.microbase.io