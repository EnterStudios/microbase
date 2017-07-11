# Payment Service

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

[travis-url]:https://travis-ci.org/ncornag/micro-payment-service
[travis-image]:http://img.shields.io/travis/ncornag/micro-payment-service/develop.svg
[coveralls-url]:https://coveralls.io/r/ncornag/micro-payment-service
[coveralls-image]:https://img.shields.io/coveralls/ncornag/micro-payment-service/develop.svg

[bithound-url]:https://www.bithound.io/github/ncornag/micro-payment-service/develop
[bithound-overal-image]:https://www.bithound.io/github/ncornag/micro-payment-service/badges/score.svg
[bithound-image]:https://img.shields.io/bithound/dependencies/github/ncornag/micro-payment-service.svg
[bithound-dev-image]:https://img.shields.io/bithound/devDependencies/github/ncornag/micro-payment-service.svg
[bithound-code-image]:https://www.bithound.io/github/ncornag/micro-payment-service/badges/code.svg

Ecommerce Payments service, part of the [microbase](http://microbase.io) 
ecosystem.

# Features

* Default implementations for some providers
* Easy implement your own gateway

# Entities

## Payment Method

Field | Description| Type | Required | Default
------|------------|------|----------|--------
id      | Internal unique Cart identifier | String | yes | System generated
title   | The method description | String | yes | -
active  | The method is active or disabled | Boolean | yes | true
gateway | Processing gateway code | String | yes | -

# API

The full API documentation can be accessed in the microbase web http://docs.microbase.io
