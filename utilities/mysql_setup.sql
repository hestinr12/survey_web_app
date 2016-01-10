CREATE DATABASE IF NOT EXISTS sumo_dev;

GRANT ALL ON sumo_dev.* TO 'sumo'@'localhost' IDENTIFIED BY 'sumodev';

FLUSH PRIVILEGES;