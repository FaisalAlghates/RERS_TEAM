RERS – Rapid Emergency Response System

RERS (Rapid Emergency Response System) is a web-based emergency monitoring platform designed to help monitor buildings, sensors, and cameras from a centralized dashboard.

Overview

The system provides a responsive interface for managing emergency-related infrastructure and monitoring real-time sensor and camera data. It also includes authentication, reporting, payment/subscription pages, and Firebase integration.

Features

User login and registration

Building management

Sensor management

Camera management

Centralized monitoring dashboard

Emergency and sensor status monitoring

Reports page

Subscription/payment interface

Firebase Authentication and Firestore integration

Firebase Realtime Database integration for IoT sensor data

ESP32 integration with DHT11 and gas sensor

Responsive web interface

Technology Stack

HTML5

CSS3

JavaScript

Node.js

Express.js

Firebase Authentication

Firebase Firestore

Firebase Realtime Database

ESP32

DHT11 Temperature & Humidity Sensor

System Structure

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
│   └── payment.html
├── JS/
│   └── firebase.js
├── esp_code.txt
├── index.js
└── package.json

Run Locally

1. Install dependencies

npm install

2. Start the server

npm start

The application will be available at:

http://localhost:3000

IoT Component

The ESP32 code connects to Wi-Fi and sends sensor readings to Firebase Realtime Database. The current implementation includes:

Gas leak detection

Temperature monitoring

Humidity monitoring

Security Note

Before making this repository public, remove or replace any Firebase credentials, Wi-Fi credentials, email addresses, and passwords contained in source files. Store sensitive configuration in environment variables or a secure configuration system.

Project Purpose

RERS demonstrates the integration of a web monitoring interface, cloud services, and IoT sensors into an emergency-response monitoring solution.
