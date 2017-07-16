#!/usr/bin/env bash

cp README.md src/
cp CHANGELOG.md src/
cp LICENSE src/

cd src
npm add-user <<!
$NPM_USERNAME
$NPM_PASSWORD
$NPM_EMAIL
!
npm login <<!
$NPM_USERNAME
$NPM_PASSWORD
$NPM_EMAIL
!
npm publish

rm README.md
rm CHANGELOG.md
rm LICENSE