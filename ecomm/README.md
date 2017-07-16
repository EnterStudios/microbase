#Installation

First clone this repo:

```bash
export MICROBASE_HOME=~/micro
mkdir $MICROBASE_HOME
cd $MICROBASE_HOME
git clone https://github.com/microbaseio/microbase.git
cd $MICROBASE_HOME/microbase
```

##Option 1: running all the stack via docker

Download the ecomm repos into `$MICROBASE_HOME`, build the images and start docker
 with all the infrastructure services (NGINX, MongoDB, Consul).

```bash
cd $MICROBASE_HOME/microbase/ecomm
./run.sh <deploy folder>
```

##Option 2: running in developer mode

Clone the ecomm services into the `$MICROBASE_HOME` folder:

```bash
cd $MICROBASE_HOME/microbase/ecomm
./developerSetup.sh $MICROBASE_HOME/ecomm
```

Run the infrastructure services inside docker:

```bash
cd $MICROBASE_HOME/microbase/ecomm
docker-compose --file docker-compose-dev.yml up -d
```

Go to the a service src folder and execute Node:

```bash
cd $MICROBASE_HOME/microbase/ecomm/micro-cart-service
node .
```

###Miscellaneous

*Aliases*

A useful set of aliases to add to your `.bash_profile` or `.zshrc`

```
export MICROBASE_HOME=~/micro;
alias micro-tool='cd $MICROBASE_HOME/microbase/ecomm;docker-compose --file docker-compose-dev.yml up';
alias micro-cart-service='export NODE_ENV=development;cd $MICROBASE_HOME/ecomm/micro-cart-service/src;node .'
alias micro-catalog-service='export NODE_ENV=development;cd $MICROBASE_HOME/ecomm/micro-catalog-service/src;node .'
alias micro-oauth-service='export NODE_ENV=development;cd $MICROBASE_HOME/ecomm/micro-oauth-service/src;node .'
alias micro-promotion-service='export NODE_ENV=development;cd $MICROBASE_HOME/ecomm/micro-promotion-service/src;node .'
alias micro-stock-service='export NODE_ENV=development;cd $MICROBASE_HOME/ecomm/micro-stock-service/src;node .'
alias micro-tax-service='export NODE_ENV=development;cd $MICROBASE_HOME/ecomm/micro-tax-service/src;node .'
```

*Itermocil*

If you use [Itermocil](https://github.com/TomAnthony/itermocil), this configuration will allow you to easly
 open terminals and run all the services (using the aforementioned aliases):


`itermocil --edit  microbase`

```
windows:
  - name: Microbase Development
    root: ~
    layout: tiled
    panes:
      - micro-tool
      - micro-cart-service
      - micro-catalog-service
      - micro-promotion-service
      - micro-stock-service
      - micro-tax-service
```

Add this to your `.bash_profile` or `.zshrc`:

```
alias microbase="itermocil --here microbase"
```
