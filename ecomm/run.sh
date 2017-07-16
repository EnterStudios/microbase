#!/usr/bin/env bash

if [ -z "$1" ]
then
  echo Usage: run.sh /tmp
  exit 1
fi

./install.sh $1 1

DEST=$1

cd $DEST

docker-compose down
docker rmi microbaseio/micro-docker-service:latest
docker rmi microbaseio/micro-docker-ngnix:latest
#docker rm $(docker ps -a -q -f name=micro_)
docker-compose up --build