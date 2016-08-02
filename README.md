# Face Identification Service
[![Build Status](https://travis-ci.org/Reekoh/mnubo-connector.svg)](https://travis-ci.org/Reekoh/face-identification-service)
![Dependencies](https://img.shields.io/david/Reekoh/face-identification-service.svg)
![Dependencies](https://img.shields.io/david/dev/Reekoh/face-identification-service.svg)
![Built With](https://img.shields.io/badge/built%20with-gulp-red.svg)

Project Oxford Face Identification Service Plugin Reekoh IoT Platform. Integrates a Reekoh Instance to Project Oxford's Face Identification API.

## Description
This plugin sends images received from the Reekoh Instance to Project Oxford Face Identification API to verify if a certain person in the image is registered/verified.

## Configuration
To configure this plugin, a Microsoft Account is need to provide the following:

1. API Key - The Project Oxford Face API Key to use.

These parameters are then injected to the plugin from the platform.

## Sample input data for verifying faces
```
{
    image: <base64 image here>, // required
    personGroupId: 'group1' // required
}
```