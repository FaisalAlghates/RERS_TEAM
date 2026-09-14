# RERS — Rapid Emergency Response System

RERS (Rapid Emergency Response System) is an IoT-enabled emergency monitoring platform designed to improve building safety through real-time monitoring of environmental sensors and security cameras.

The system provides a centralized interface for managing buildings, sensors, cameras, monitoring emergency conditions, and generating reports. It integrates a web-based dashboard with Firebase for real-time data synchronization and supports IoT sensor communication through an ESP32 device.

## Features

* User registration and authentication
* Building management
* Environmental sensor monitoring
* Gas-leak detection
* Temperature monitoring
* Humidity monitoring
* Camera management
* Real-time monitoring dashboard
* Emergency and monitoring reports
* Payment interface
* Firebase Realtime Database integration
* ESP32-based IoT sensor integration
* Responsive web interface

## System Modules

### Authentication

Users can register and log in before accessing the system's monitoring and management features.

### Building Management

Administrators can add and manage buildings with information such as:

* Building type
* Zone
* Number of floors
* Entrances
* Exits

### Sensor Management

The system supports adding and monitoring sensors associated with buildings and locations.

The IoT implementation demonstrates:

* Gas-leak detection
* Temperature measurement
* Humidity measurement

### Camera Management

Cameras can be registered and associated with buildings for centralized monitoring.

### Monitoring Dashboard

The monitoring interface provides a centralized view of connected sensors and cameras, allowing emergency conditions to be monitored from a single interface.

### Reports

The reports module provides access to monitoring and emergency-related information for analysis and review.

## Architecture

```text
                +---------------------+
                |   Web Application   |
                |  HTML / CSS / JS    |
                +----------+----------+
                           |
                           v
                +---------------------+
                |       Firebase      |
                |   Realtime Data     |
                +----------+----------+
                           ^
                           |
                +----------+----------+
                |        ESP32        |
                |  IoT Sensor Layer   |
                +------+---------+----+
                       |         |
                    DHT11    Gas Sensor
```

## Technologies

### Frontend

* HTML5
* CSS3
* JavaScript
* Font Awesome

### Backend / Server

* Node.js
* Express.js

### Cloud & Database

* Firebase
* Firebase Realtime Database

### IoT

* ESP32
* DHT11 Temperature & Humidity Sensor
* Gas Sensor
* Firebase ESP Client

## Project Structure

```text
RERS_TEAM/
├── web/
│   ├── login Page.html
│   ├── signup Page.html
│   ├── dashboard.html
│   ├── add_building.html
│   ├── add_sensor.html
│   ├── add_camera.html
│   ├── monitoring.html
│   ├── reports.html
│   ├── payment.html
│   └── logout.html
│
├── JS/
│   ├── firebase.js
│   ├── firebase.json
│   └── Y/
│
├── esp_code.txt
├── index.js
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have:

* Node.js
* npm
* A Firebase project
* Arduino IDE or another ESP32 development environment if using the IoT hardware

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd RERS_TEAM
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

Create your Firebase project and configure the Firebase credentials in the application.

For security, do not commit Firebase credentials, Wi-Fi passwords, API keys, or user credentials to GitHub.

### 4. Start the Application

```bash
npm start
```

The application will be available at:

```text
http://localhost:3000
```

## IoT Setup

The `esp_code.txt` file contains the ESP32 implementation for communicating sensor readings to Firebase.

The prototype uses:

* ESP32
* DHT11
* Gas sensor

The ESP32 periodically sends sensor values to Firebase, allowing the web application to retrieve and display the latest readings.

## Project Goals

RERS was developed to demonstrate how web applications, cloud databases, and IoT devices can work together to create a centralized emergency monitoring solution.

The main objectives are:

1. Improve real-time building monitoring.
2. Centralize sensor and camera information.
3. Detect potential environmental hazards.
4. Provide a dashboard for emergency monitoring.
5. Demonstrate IoT-to-cloud communication.

## Future Improvements

Potential future enhancements include:

* AI-powered video analysis
* Face recognition
* Automatic emergency notifications
* SMS and email alerts
* Advanced analytics
* Interactive 3D building visualization
* Mobile application
* Additional IoT sensors
* Role-based access control
* Scalable multi-building monitoring

## Security Notice

This repository contains an IoT/Firebase prototype. Before making the repository public, remove any:

* Firebase API keys and private configuration
* Wi-Fi SSIDs and passwords
* Firebase user credentials
* Other secrets or private project information

Use environment variables or a secure configuration system instead.

## License

This project is available for educational and portfolio purposes.
