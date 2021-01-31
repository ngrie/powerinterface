# powerinterface

This is a simple web interface that shows statistics about your Nedap PowerRouter. It aims to serve as a self-hosted replacement for the discontinued mypowerrouter.com interface.

## Features

- Show current PowerRouter stats of your PowerRouter
- Forward data to an InfluxDB

## Documentation

- [Requirements / prerequisites](#requirements--prerequisites)
- [Installing](#installing)
- [Updating](#updating)
- [Send data to an InfluxDB](#send-data-to-an-influxdb)

### Requirements / prerequisites

To run this software you need a device in your local network which is capable of running Docker or NodeJS. This could be a Raspberry Pi, a modern NAS or any computer. On the device, port 80 must not already be in use.

Apart from that, you need to point the IP address of the PowerRouter logging server to an internal IP (the IP of your device to run this software on) in your local DNS resolver. Unfortunately, common routers used in home networks do not allow you overriding DNS entries. To solve this problem, you need to run your own DNS resolver. I recommend [Pi-hole](https://pi-hole.net) because it is a great piece of software and really easy to set up (e.g. on a Raspberry Pi). Please refer to existing documentation on the internet to read how to set Pi-hole up and how to announce it as primary DNS resolver in your local network.

Make sure to point the domain `logging1.powerrouter.com` to the local IP address of the device Powerinterface should run on. Using Pi-hole this would be done on the page "Local DNS Recods" in the admin interface.

### Installing

#### Install using Docker (recommended)

Make sure to install [Docker](https://docs.docker.com/engine/install/) and [docker-compose](https://docs.docker.com/compose/install/). An easy way to install Docker (docker-compose must be installed afterwards):

```bash
# run as root:
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
usermod -aG docker [your username]
# logout and re-login to use Docker
```

Run the following commands:

```bash
mkdir powerinterface
cd powerinterface
wget https://raw.githubusercontent.com/ngrie/powerinterface/master/docker-compose.yml
docker-compose pull
docker-compose up -d
```

Enter `http://[IP of your devie running Powerinterface]` in your browser. You should see a message indicating that Powerinterface is awaiting data of your PowerRouter device. If not, run `docker-compose logs` to check for any errors.

#### Install without Docker / run from source

Make sure to have NodeJS and Git installed.

```bash
git clone https://github.com/ngrie/powerinterface.git
cd powerinterface
npm install
node server.js
```

Running Powerinterface this way will stop the software when you exit the terminal. To avoid this, create a service definition for your system's service manager. For distributions using systemd, you can use the following file (place at `/etc/systemd/system/powerinterface.service`):

```
[Unit]
Description=Powerinterface
Documentation=https://github.com/ngrie/powerinterface
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/path/to/your/powerinterface
ExecStart=/usr/bin/node /path/to/your/powerinterface/server.js
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Run afterwards:

```bash
systemctl daemon-reload
systemctl enable powerinterface
systemctl start powerinterface
```

### Updating

#### Update docker installation

```bash
cd powerinterface
docker-compose pull
docker-compose up -d
```

#### Update installation without docker

```bash
cd powerinterface
git pull
npm install
systemctl restart powerinterface
```

### Send data to an InfluxDB

Powerinterface just shows you the current data from your PowerRouter. You can use InfluxDB to continuously store the data and then e.g. create graphs from it using Grafana. You could run InfluxDB and Grafana on the same device you run Powerinterface on, e.g. in Docker containers.

This guide assumes you have InfluxDB up and running. In the Powerinterface directory, place the following in the `config.yml` file (create it if not existing already):

```yaml
actions:
  - type: influxdb
    host: 127.0.0.1
    database: powerinterface
    username: root
    password: root
    port: 8086
```

Of course, adjust host, database, username, password and port as needed (if you run InfluxDB on the same device without changing any configs the above values should work).

Afterwards, restart Powerinterface (Docker: `docker-compose restart`, systemd: `systemctl restart powerinterface`).
