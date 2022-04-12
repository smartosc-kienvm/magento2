# Installation

## Prerequisites

Before proceeding, make sure you have [Node 16](https://nodejs.org/en/) installed. You can this by running the following command:

```bash
node -v
```

## Installation steps

### Magento instance

#### Setup Magento server

You need to setup a Magento server if you don't already have one. There are many ways you could do that, but for the sake of simplicity, we will only explain how to do it using a Docker.

If you don't know what Docker is, see the [Docker overview](https://docs.docker.com/get-started/overview/) page and follow the [Docker installation](https://docs.docker.com/get-docker/) guide.

If you don't want or can't use Docker, feel free to follow other Magento 2 installation guides available on the Internet.

Run the following commands to create a Docker image in the `magento-docker` folder:

```bash
mkdir magento-docker
cd magento-docker
curl -s https://raw.githubusercontent.com/markshust/docker-magento/master/lib/onelinesetup | bash -s -- magento.dev 2.4.3-p1
```

After the setup script is finished, you can visit the [https://magento.dev](https://magento.dev) page to see if it works.

:::warning
If you use Mac and get an error that ports 80 and/or 443 are already in use by other processes, run the `killall httpd` command to free them up..
:::

#### Install sample data (optional)

If you followed the step above to setup a Magento server, you will notice that the store is empty and doesn't have any products. You can configure it yourself or use the following commands to install sample data:

```bash
bin/magento sampledata:deploy
bin/magento setup:upgrade
```

#### Change GraphQL Query Complexity and Depth values

By default, Magento 2 allows maximum GraphQL query complexity of 300 and depth of 20 (see [#32427](https://github.com/magento/magento2/issues/32427#issuecomment-860478483)). You need to change these values using the [GraphQL CustomConfig](https://github.com/caravelx/module-graphql-config) module, which adds configuration panel for it to the admin panel.

To install the Magento 2 GraphQL Config module, run the following commands on your Magento installation:

```bash
composer require caravelx/module-graphql-config
php bin/magento module:enable Caravel_GraphQlConfig
php bin/magento setup:upgrade
php bin/magento setup:di:compile
php bin/magento setup:static-content:deploy
```

Then go to the admin panel, find the configuration panel of the `GraphQL CustomConfig` module and set:

* **complexity** to 1500,
* **depth** to 20.
