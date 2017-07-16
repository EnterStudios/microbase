# MicroBase

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

[travis-url]:https://travis-ci.org/microbaseio/microbase
[travis-image]:http://img.shields.io/travis/microbaseio/microbase/develop.svg
[coveralls-url]:https://coveralls.io/r/microbaseio/microbase
[coveralls-image]:https://img.shields.io/coveralls/microbaseio/microbase/develop.svg

[bithound-url]:https://www.bithound.io/github/microbaseio/microbase/develop
[bithound-overal-image]:https://www.bithound.io/github/microbaseio/microbase/badges/score.svg
[bithound-image]:https://img.shields.io/bithound/dependencies/github/microbaseio/microbase.svg
[bithound-dev-image]:https://img.shields.io/bithound/devDependencies/github/microbaseio/microbase.svg
[bithound-code-image]:https://www.bithound.io/github/microbaseio/microbase/badges/code.svg

MicroBase is an ecommerce platform ecosystem that allows the development 
of the ecommerce store backends. The architecture embraces the 
microservices paradigm, so the services are organized as a separate 
projects.

# Architecture

Each service is executed in a separate environment and it communicates 
with the others via http and/or messaging. To know where the other 
service is, [Consul](https://www.consul.io/) is used as a registry.

To efectively reach the other service the calls are redirected via
an [NGINX](https://www.nginx.com/) gateway.

Example add to Cart call
![](https://www.websequencediagrams.com/cgi-bin/cdraw?lz=IyBGcm9tIGh0dHBzOi8vd3d3LndlYnNlcXVlbmNlZGlhZ3JhbXMuY29tLwp0aXRsZSBCb290c3RyYXAgUwAfBwoKcGFydGljaXBhbnQgVXNlcgAEDUdhdGV3YXkAGA1SZWdpc3RyAAcOQ2FydCBTZXJ2aWNlAEYNU3RvY2sAEQkKAAINLT4ARAg6AE8HZXIKAFcILT4Adgc6IFVwZGF0ZSBDb25maWcKAF8MAAw2VXNlcgBUC0FkZCBQcm9kdWN0IFJlcXVlc3QKAIFyBy0-AIFNDDogUm91dGVkAB0VAIEJDgCBMwlDaGVjawCBfwcATBEAghANAFUJAB8UAIIpDwCCEgkAglkGQXZhaWxhYmlsaXR5IFJlc3BvbnNlAIEsGAAXHACCTg4AgW4OAIIcCwCBVRgAgjwOAHcQVXNlcgANFw&s=napkin)

# Services
 
An updated version of the Services code are linked as submodules to this 
project. For the most up to date ones refer to the original repositories:

[Catalog Service](https://github.com/microbaseio/micro-catalog-service)

* Hierarchical Categories
* Category Classifications
* Variants
* Indexing and faceted search
* Taxes per product
* Stock status per product

[Cart Service](https://github.com/microbaseio/micro-cart-service)

* Single or bulk add to Cart
* Stock checking available per product
* Define max number of items items in Cart
* Define max number of items per Product in Cart
* Aggregate same products or add them as a single line each
* Fast Cart calculation
* Abandonment handling

[Customer Service](https://github.com/microbaseio/micro-customer-service)

* Customers and addresses management (create, read, update and delete operations).
* Check customers credentials.

[Stock Service](https://github.com/microbaseio/micro-stock-service)

* Warehose enabled
* Reservation system available with expiration times

[Tax Service](https://github.com/microbaseio/micro-tax-service)

* Net and gross calculations
* Easily creation of custom taxes, based on Cart, Products and User data

[Promotion Service](https://github.com/microbaseio/micro-promotion-service)

* Multiple promotions firing per cart
* Per Product, Product Category, Order or User data firing
* DSL to allow complex conditions, with "ALL" and/or "ANY" nested conditions
* Almost fullfilled promotion detection with optional thresholds
* Easily creation of custom firing conditions

[Payment Service](https://github.com/microbaseio/micro-payment-service)

* Default implementations for some providers
* Easy implement your own gateway

[Recommendation Service](https://github.com/microbaseio/micro-recommendation-service)

* gathers and process 'Also viewd' products

[Oauth Service](https://github.com/microbaseio/micro-oauth-service)

* API tokens
* User tokens

## Requisites to run the services

* The language choosen for the developments is ES6 (ES2015) Javascript, so
[Node](https://nodejs.org) 6.x is needed to run microbase.
* [MongoDB](https://www.mongodb.com/) is used to store data.
* [Elasticsearch](https://www.elastic.co/products/elasticsearch) indexes the product data.
* [RabbitMQ](https://www.rabbitmq.com/) is the preferred choice for messaging.

* If you want to run a service locally (not with the docker-compose provided), clone a repo
and run node.

```bash
mkdir /tmp/micro-repos
cd /tmp/micro-repos
git clone https://github.com/microbaseio/micro-catalog-service.git
cd micro-catalog-service/src
node index.js
```

Each service has in his own ```development``` configuration, so each service will start in his own
port.

Keep in mind that the infrastructure services needs some configuration (i.e. the host name). Out
 of the box you will need to add this to your `hosts` file:

```bash
127.0.0.1 gateway mongo elasticsearch bus redis
```

## Quick run

There is a docker compose file provided to run the ecomm services and the additional infrastructure
 services (NGINX, MongoDB, Consul). Clone the repo and execute the `run` shell script with a
 folder as a parameter. It will clone the services the repos, build the necesary
 images and start the containers.

```bash
git clone https://github.com/microbaseio/microbase.git
cd microbase/ecomm
./run.sh /tmp/micro
```

Test the installation using `curl`:

```bash
curl --request POST \
  --url http://localhost:80/services/catalog/v1/category \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header 'authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL21pY3JvYmFzZS5pbyIsInN1YiI6ImNsaWVudC9pbnRlcm5hbCIsInNjb3BlIjpbIklOVEVSTkFMIl0sImp0aSI6IjgyM2Y1MjY2LWEzYjEtNDkzNi1hMDk4LTc1Y2EzYzJlMmZmZSIsImlhdCI6MTQ5ODIwNTUwMX0.z3z2U_xTSSkLbB2e6WqV7ipidvGny7x6bZVm-mxMbU4' \
  --data '{"title": "Category 01", "description": "This is the Category 01", "slug": "category01", "parent": "ROOT"}'
```

The `authorizarion` header is based on the default security configuration. It should be changed in production.

More info about running the ecomm stack [here](./ecomm/README.md)

## Containers

The aforementioned docker configuration starts several containers:

* consul - The services registry. `http://localhost:8501`
* gateway - The API endpoint. `http://localhost:80`
* mongo - The database. `mongo://localhost:27018`
* bus - RabbitMQ messaging. `http://localhost:15673`
* elasticsearch - Search server. Logs aggregation server. `http://localhost:9201`
* redis - Cache server. `redis://localhost:6380`
* logstash - Logs redirection server. `localhost:5000`
* kibana - Logs visualization server: `http://localhost:5602/`
* *-service -  All the microbase ecomm services.


This docker compose configuration is only for development and demos, not for production.
In the unexpected case that you receive a `No available upstream servers at current route from consul`
error or `502 Bad Gateway` error trying to use the API, try to restart the consul and gateway servers:

```bash
docker restart micro_gateway_1
docker restart micro_consul_1
```

## Example data

You could add example data using the 'insertData' script.
 
```bash
cd ecomm/sampleData/src
NODE_ENV=docker node insertData.js Tax ./data/dataTaxes.json
NODE_ENV=docker node insertData.js Category ./data/dataCategories.json
NODE_ENV=docker node insertData.js Product ./data/dataProductsShoes.json
NODE_ENV=docker node insertData.js Product ./data/dataProductsFridges.json
NODE_ENV=docker node insertData.js Promotion ./data/dataPromotions.json
NODE_ENV=docker node insertData.js Shipping ./data/dataShippings.json
NODE_ENV=docker node insertData.js Payment ./data/dataPayments.json
NODE_ENV=docker node insertData.js OAuthClient ./data/dataOAuthClients.json
```

## Postman

API use examples can be found in a [Postman](https://www.getpostman.com) export file:

```bash
ls -l "ecomm/Postman Collection.json"
```

# The framework

Microbase is build on top of a a small framework developed as a Node.js 
module to define and call services, and give basic utilities like 
config, logging, jobs, cache and MongoDB access.

It can be used as a base to implement any application with a 
microservices style architecture.

## Examples:

[micro-math-service](https://github.com/microbaseio/microbase/tree/develop/examples/micro-math-service)

[micro-taxes-service](https://github.com/microbaseio/microbase/tree/develop/examples/micro-taxes-service)

### Run the examples:
```bash
cd examples
docker-compose up --build
```
The Consul services could be viewed at:
```
http://localhost:8500
```
The services endpoints are at:
```
http://localhost/services
```
ie:
```bash
curl --request POST \
  --url http://localhost:80/services/taxes/v1/vat \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --header 'authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL21pY3JvYmFzZS5pbyIsInN1YiI6ImNsaWVudC9pbnRlcm5hbCIsInNjb3BlIjpbIklOVEVSTkFMIl0sImp0aSI6IjgyM2Y1MjY2LWEzYjEtNDkzNi1hMDk4LTc1Y2EzYzJlMmZmZSIsImlhdCI6MTQ5ODIwNTUwMX0.z3z2U_xTSSkLbB2e6WqV7ipidvGny7x6bZVm-mxMbU4' \
  --data '{"net": "1000"}'
```

# Your own services

1. Install the framework:

  ```bash
  npm i -S microbase
  ```

2. Create an `index.js` file with the following content:

  ```javascript
  const base = require('microbase')();

  // Add operations
  base.services.add(require('./operations/new')(base));

  // Return express app for easy testing
  module.exports = base;
  ```

3. Configure the service in `config/defaults.json`

   ```json
   {
     "services": {
       "name": "cart",
       "version": "v1",
       "style": "RPC"
     }
   }
   ```

4. Create a `config/development.json` (to be used only in the local development environment)

   ```json
   {
     "logger": {
       "level": "debug"
     }
   }
   ```

5. Implement the `operations/new/index.js`

  ```javascript
  function opFactory(base) {
  
    const op = {
      name: 'new',
      handler: (msg, reply) => {
        // Implementation here. i.e.:
        // save(msg);
        reply(base.utils.genericResponse({ cart: msg }));
      }
    };
    return op;
  }
  
  // Exports the factory
  module.exports = opFactory;
  ```

6. Start the application

  ```bash
  node index.js
  ```

7. Access the service operations

  ```bash
  curl --request POST \
    --url http://localhost:3000/services/cart/v1/new \
    --header 'content-type: application/json' \
    --header 'accept: application/json' \
    --data '{user: '100'}'
  ```

8. Verify the response

  ```json
  {
    "ok": "true",
    "cart": {
      "user": "100"
    }
  }
  ```

# Modules

## config

The configuration properties are handled with `nconf`. Out of the box, when used in a service, the
framework reads the following files:

```
config/${NODE_ENV:development}.json
config/default.json
node_modules/microbase/modules/config/defaults.json
```

The service also reads the environment variables and command line parameters.

Each file in the list provides sensitive defaults for the previous one.
The first file can be customized changing the value of the `NODE_ENV` environment variable.
ie: If `NODE_ENV` is `prod`, the config file used will be `config/prod.json`. If unsetted, the file
`config/development.json`

### Use

In the application, get the configured values using the `nconf` interface:

```javascript
const maxQuantityPerProduct = base.config.get('hooks:preAddEntry:maxQuantityPerProduct');
```

## db

The service uses `Mongoose` framework. The connection configuration parameters must be set in the
`db` key of the configuration properties.

### Basic parameters

```json
"db": {
  "host": "localhost",
  "db": "micro"
}
```

### Full parameters

```json
"db": {
  "host": "localhost",
  "db": "micro",
  "port": 27017,
  "user": "xxxx",
  "password": "xxxx",
  "debug": false
}
```

When the `debug` configuration is set to `true`, the framework will logs the commands sent to the
database.

```
2016-05-18T23:22:01.321Z - debug: [db-mongo] reserves.find({"expirationTime":{"$lt":"2016-05-19T13:22:01.321Z"},"state":"ISSUED"})
```

### Use

In the application, use the `mongoose` interface to register and use the models.

Register the model in a module (i.e.: `cartModel.js`):
```javascript
function modelFactory(base) {
  const schema = base.db.Schema({
    userId: { type: String, required: true },
    items: [itemsSchema]
  });
  return base.db.model('Cart', schema);
}
module.exports = modelFactory;
```

and use the module directly:
```javascript
const Cart = require('./models/cartModel')(base);
```

or using config parameters:
```javascript
const Cart = require(base.config.get('models:cartModel'))(base);
```

To use the models, access the `base.db` property:
```javascript
base.db.models.Cart
.find({id: 'ByQpDBcM'})
.exec()
.then(reserves => {
  // Do something
})
.catch(error => {
  base.logger.error(error);
});

```

## logger

The service uses `Winston` to log messages to the console.

### Use

In the application, use the `winston` interface:

```javascript
base.logger.info(`[server-http] running at: [${server.info.uri}${base.config.get('services:path')}]`);
```

## logstash

The service uses `logstash` to log messages to the console, microbase sends logs to logstash via `winston-logstash`.

### Use

In the application, use the the configuration:

```json
"logstash": {
  "port": 28777,
  "host": "logstash",
  "node_name": "node_tax"
}
```

Basic logstash configuration:

```json
input {
  tcp {
    port => 28777
    type=>"sample"
  }
}

## Add your filters here

output {
  elasticsearch {
    hosts => "elasticsearch:9200"
  }
}
```

## events

Simpe wrapper over the `EventEmitter` to send and listen to messages.

### Use

Listen to a channel:

```javascript
base.events.listen(productsChannel, (msg) => {
  if (msg.type === 'CREATE') {
    base.workers.enqueue('indexProduct', msg.data);
  }
});
```

Send messages to a channel:

```javascript
base.events.send(productsChannel, 'CREATE', productData);
```

## workers

The service uses `monq` to configure and launch jobs.

### Use

Configure the job in the `workers` key:
```json
"workers": [
  {
    "worker": "unreserveExpired",
    "handler": "./jobs/unreserveExpired",
    "when": "0 */1 * * * *"
  }]
```

If you add the `when` key, the service will use the `cron` npm module to schedule the job. The time zone is UTC.

Configure the job in the application:
```javascript
function jobFactory(base) {
  return (params, done) => {
    // Do the work
    if (params.since) {
       ...
    } else {
       ...
    }
    // Call the callback when done.
    done();
  }
}
module.exports = jobFactory;
```

To manually launch a job (enqueue it for execution) use the `enqueue` method:

```javascript
base.workers.enqueue('unreserveExpired', {since: '2016-06-20T21:20:11.287Z'});
```

This service is best used with the events module. Listen to an event and launch a job:

```javascript
base.events.listen(productsChannel, (msg) => {
  base.workers.enqueue('indexProduct', msg);
});
```

## services

The services use the `Hapi` framework to expose and call the service operations.

### Use

You must register your operation in the framework with the `add` or the `addModule` methods.

### add method

```javascript
const operation = {
  name: 'set',
  schema: require('myJsonSchema'),
  handler: (msg, reply) => {
    // Do something
    reply();
  }
};

base.services.add(operation);
```

The framework creates a `Hapi` route with the following details:

* method: ['GET', 'POST', 'PUT']
* path: The path is built with the concatenation of the following data:
  * services base path: `base.config.get('services:path')` Default: `/services`
  * service name:  `base.config.get('services:name'`)
  * service version:  `base.config.get('services:version'`)
  * operation name: the provided `name`

  In example: `/services/cart/v1/new`

* handler: The provided `handler`
* config: The operation is also configured with the `ratify` json schema validator
  * schema: the `schema` provided

### addModule method

If all your operations are inside a module, you can add all of them at once:

```javascript
function cartService(base) {
  const new = {
    name: 'set'
    ...
  };
  const get = {
    name: 'get'
    ...
  };
  return [set, get]
}
```

```javascript
const cartFactory = require('./modules/cartService');
base.services.addModule(stockFactory(base));
```

### Calling another service

You can call another `microbase` services using the `call` method

```javascript
base.services.call('stock:reserve', {
  productId,
  quantity,
  warehouse,
  reserveStockForMinutes
}).then(response => {
  // Do something
});
```

* If there is only one word in the name of the service to call (ie: `'get'` ), or the name of the
service is the same as the name of the current service (ie `'cart:get'`) it's asumed as an
internal call (an operation hosted in the same application) and not an http connection.
* If the service name is not the one defined for this application (ie: `'stock:reserve'`)
* If you want to specify the service version to call, put the version after the service name (ie
`'stock:v2:reserve'`). The default is `v1`.

## cache (server side)

Server side cache for operations.

### Use

TODO

### Example

```javascript
const op = {
  name: 'getProduct',
  path: '/product/{id}',
  method: 'GET',
  cache: {
    options: {
      expiresIn: base.config.get('cache:products')
    },
    name: 'products',
    keyGenerator: payload => payload.id
  },
  handler: (params, reply) => {
    ...
  }
}
```
