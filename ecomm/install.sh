#!/usr/bin/env bash

if [ -z "$1" ]
then
  echo Usage: run.sh /tmp [depth]
  exit 1
fi

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

DEST=$1
ORIG="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

updateRepo() {
  REPO=micro-$1-service
  cd $DEST
  echo "-----------------------";
  if [ -d "$REPO" ]; then
    cd $REPO
    echo -e "⚡ Updating ${GREEN}$REPO${NC}"
    git pull
  else
    echo -e "⚡ Cloning repository from git ${GREEN}microbaseio/$REPO${NC}"
    if [ -z "$2" ]; then
        git clone https://github.com/microbaseio/$REPO.git
    else
        echo "Installing with depth $2"
        git clone --depth $2 https://github.com/microbaseio/$REPO.git
    fi
  fi
}

mkdir -p $DEST
echo "⚡ Creating project folder $DEST"
cp $ORIG/docker-compose*.yml $DEST
cp -R $ORIG/dockerConf $DEST

REPOS=( "catalog" "stock" "cart" "tax" "promotion" "recommendation" "customer")
for i in "${REPOS[@]}"
do
	updateRepo $i $2
done

echo "-----------------------";
echo -e "${GREEN}√ Repository installation finished. Project installed in folder $DEST${NC}"
echo ""
echo -e "Access project folder at: "
echo -e "                          ${BLUE}cd $DEST${NC}"
echo ""

