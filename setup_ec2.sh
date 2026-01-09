#!/bin/bash
# EC2 Setup Script for InterfaceHive (Amazon Linux 2023)

echo "Updating system..."
sudo dnf update -y

echo "Installing Docker..."
sudo dnf install -y docker
sudo systemctl enable --now docker

echo "Setting up Docker permissions for ec2-user..."
sudo usermod -aG docker ec2-user

echo "Installing Docker Compose..."
# Download latest Docker Compose v2
DOCKER_CONFIG=${DOCKER_CONFIG:-$HOME/.docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose

# Also install as standalone to ensure 'docker-compose' command works
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "Installing Git..."
sudo dnf install -y git

# Create project directory
mkdir -p ~/InterfaceHive

echo "EC2 Setup Complete! PLEASE LOG OUT AND LOG BACK IN so that Docker permissions take effect."
