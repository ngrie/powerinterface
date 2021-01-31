# powerinterface

This is a simple web interface that shows statistics about your Nedap PowerRouter. It aims to serve as a self-hosted replacement for the discontinued mypowerrouter.com interface.

## Features

- Show current PowerRouter stats of your PowerRouter
- Forward data to an InfluxDB

## Requirements / prerequisites

To run this software you need a device in your local network which is capable of running Docker or NodeJS. This could be a Raspberry Pi, a modern NAS or any computer. On the device, port 80 must not already be in use.

Apart from that, you need to point the IP address of the PowerRouter logging server to an internal IP (the IP of your device to run this software on) in your local DNS resolver. Unfortunately, common routers used in home networks do not allow you overriding DNS entries. To solve this problem, you need to run your own DNS resolver. I recommend [Pi-hole](https://pi-hole.net) because it is a great piece of software and really easy to set up (e.g. on a Raspberry Pi). Please refer to existing documentation on the internet to read how to set Pi-hole up and how to announce it as primary DNS resolver in your local network.

Make sure to point the domain `logging1.powerrouter.com` to the local IP address of the device Powerinterface should run on. Using Pi-hole this would be done on the page "Local DNS Recods" in the admin interface.

## Installing

### Install using Docker (recommended)

Make sure to install [Docker](https://docs.docker.com/engine/install/) and [docker-compose](https://docs.docker.com/compose/install/).

Run the following commands:

```bash
mkdir powerinterface
cd powerinterface
wget https://raw.githubusercontent.com/ngrie/powerinterface/master/docker-compose.yml
docker-compose pull
docker-compose up -d
```

Enter `http://[IP of your devie running Powerinterface]` in your browser. You should see a message indicating that Powerinterface is awaiting data of your PowerRouter device. If not, run `docker-compose logs` to check for any errors.


## Updating

### Update docker installation

```bash
cd powerinterface
docker-compose pull
docker-compose up -d
```
