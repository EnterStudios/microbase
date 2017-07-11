#!/usr/bin/env bash

if [ -z "$1" ]
then
  echo Usage: generatedocs.sh ../../ecomm
  exit 1
fi

DEST=$1

cp ../README.md docs/sources/index.md

cp $DEST/micro-catalog-service/README.md docs/sources/micro-catalog-service.md
cp $DEST/micro-customer-service/README.md docs/sources/micro-customer-service.md
cp $DEST/micro-stock-service/README.md docs/sources/micro-stock-service.md
cp $DEST/micro-cart-service/README.md docs/sources/micro-cart-service.md
cp $DEST/micro-tax-service/README.md docs/sources/micro-tax-service.md
cp $DEST/micro-payment-service/README.md docs/sources/micro-payment-service.md
cp $DEST/micro-promotion-service/README.md docs/sources/micro-promotion-service.md
cp $DEST/micro-promotion-service/Examples.md docs/sources/Examples.md
cp $DEST/micro-recommendation-service/README.md docs/sources/micro-recommendation-service.md
cp $DEST/micro-oauth-service/README.md docs/sources/micro-oauth-service.md

cp -R $DEST/micro-catalog-service/src/docs/api docs/sources
cp -R $DEST/micro-customer-service/src/docs/api docs/sources
cp -R $DEST/micro-stock-service/src/docs/api docs/sources
cp -R $DEST/micro-cart-service/src/docs/api docs/sources
cp -R $DEST/micro-tax-service/src/docs/api docs/sources
cp -R $DEST/micro-payment-service/src/docs/api docs/sources
cp -R $DEST/micro-promotion-service/src/docs/api docs/sources
cp -R $DEST/micro-recommendation-service/src/docs/api docs/sources
cp -R $DEST/micro-oauth-service/src/docs/api docs/sources

npm run doc
