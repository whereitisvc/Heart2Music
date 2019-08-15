// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

// Please use an Arduino IDE 1.6.8 or greater

#include <ESP8266WiFi.h>
#include <WiFiClientSecure.h>
#include <WiFiUdp.h>

#include <AzureIoTHub.h>
#include <AzureIoTProtocol_MQTT.h>
#include <AzureIoTUtility.h>

#include "config.h"

static bool messagePending = false;
static bool messageSending = true;

static char *connectionString;
static char *ssid;
static char *pass;

static int interval = INTERVAL;

void blinkLED()
{
    digitalWrite(LED_PIN, HIGH);
    delay(500);
    digitalWrite(LED_PIN, LOW);
}

void initWifi()
{
    // Attempt to connect to Wifi network:
    Serial.printf("Attempting to connect to SSID: %s.\r\n", ssid);

    // Connect to WPA/WPA2 network. Change this line if using open or WEP network:
    WiFi.begin(ssid, pass);
    while (WiFi.status() != WL_CONNECTED)
    {
        // Get Mac Address and show it.
        // WiFi.macAddress(mac) save the mac address into a six length array, but the endian may be different. The huzzah board should
        // start from mac[0] to mac[5], but some other kinds of board run in the oppsite direction.
        uint8_t mac[6];
        WiFi.macAddress(mac);
        Serial.printf("You device with MAC address %02x:%02x:%02x:%02x:%02x:%02x connects to %s failed! Waiting 10 seconds to retry.\r\n",
                mac[0], mac[1], mac[2], mac[3], mac[4], mac[5], ssid);
        WiFi.begin(ssid, pass);
        delay(10000);
    }
    Serial.printf("Connected to wifi %s.\r\n", ssid);
}

void initTime()
{
    time_t epochTime;
    configTime(0, 0, "pool.ntp.org", "time.nist.gov");

    while (true)
    {
        epochTime = time(NULL);

        if (epochTime == 0)
        {
            Serial.println("Fetching NTP epoch time failed! Waiting 2 seconds to retry.");
            delay(2000);
        }
        else
        {
            Serial.printf("Fetched NTP epoch time is: %lu.\r\n", epochTime);
            break;
        }
    }
}

static IOTHUB_CLIENT_LL_HANDLE iotHubClientHandle;
long pre_millis = 0;
void setup()
{
    pinMode(LED_PIN, OUTPUT);

    initSerial();
    delay(2000);
    //readCredentials();

    int ssidAddr = 0;
    int passAddr = ssidAddr + SSID_LEN;
    int connectionStringAddr = passAddr + SSID_LEN;
    
    ssid = "Cisco2.4G"; //"UCInet Mobile Access";
    EEPROMWrite(ssidAddr, ssid, strlen(ssid));

    pass = "Anteaters"; //"";
    EEPROMWrite(passAddr, pass, strlen(pass));

    connectionString = "HostName=heart-2-music.azure-devices.net;DeviceId=esp8266;SharedAccessKey=+hU5FTRLB++WU0qO/w+lA4uLG5dt6v9XOKBQze0gt4s=";
    //"HostName=heart2beats.azure-devices.net;DeviceId=ESP8266;SharedAccessKey=uwHk5/dgrjboQkWQrI0JEKK89LQ+PZULyQztHgj5h4E=";
    EEPROMWrite(connectionStringAddr, connectionString, strlen(connectionString));

    initWifi();
    initTime();
    initSensor();
    Serial.println("\ninit finish\n");
    /*
     * AzureIotHub library remove AzureIoTHubClient class in 1.0.34, so we remove the code below to avoid
     *    compile error
    */

    // initIoThubClient();
    iotHubClientHandle = IoTHubClient_LL_CreateFromConnectionString(connectionString, MQTT_Protocol);
    if (iotHubClientHandle == NULL)
    {
        Serial.println("Failed on IoTHubClient_CreateFromConnectionString.");
        while (1);
    }

    IoTHubClient_LL_SetOption(iotHubClientHandle, "product_info", "HappyPath_AdafruitFeatherHuzzah-C");
    IoTHubClient_LL_SetMessageCallback(iotHubClientHandle, receiveMessageCallback, NULL);
    IoTHubClient_LL_SetDeviceMethodCallback(iotHubClientHandle, deviceMethodCallback, NULL);
    IoTHubClient_LL_SetDeviceTwinCallback(iotHubClientHandle, twinCallback, NULL);

}

static int messageCount = 1;
void loop()
{

    processHeartBPM();
    processTapBPM();
  
    long current = millis();
    if(current - pre_millis > SEND_INTERVAL){
        pre_millis = millis();
        start();
        Serial.println("\nsend JSON");
    }

    // send JSON to iotHub
    if (!messagePending && messageSending)
    {
        char messagePayload[MESSAGE_MAX_LEN];
        bool temperatureAlert = readMessage(messageCount, messagePayload);
        sendMessage(iotHubClientHandle, messagePayload, temperatureAlert);
        messageCount++;

        stop();
        
        delay(interval);
    }
    IoTHubClient_LL_DoWork(iotHubClientHandle);
    delay(10);


    
//// origin code ////////////////
//
//    if (!messagePending && messageSending)
//    {
//        char messagePayload[MESSAGE_MAX_LEN];
//        bool temperatureAlert = readMessage(messageCount, messagePayload);
//        sendMessage(iotHubClientHandle, messagePayload, temperatureAlert);
//        messageCount++;
//        delay(interval);
//    }
//    IoTHubClient_LL_DoWork(iotHubClientHandle);
//    delay(10);
}
