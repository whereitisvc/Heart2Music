#include <ESP8266WiFi.h>
#include <Wire.h>

int fsrAnalogPin = 0; // FSR is connected to analog 0

const byte RATE_SIZE_T = 4; //Increase this for more averaging. 4 is good.
byte rates_T[RATE_SIZE_T]; //Array of tap rates
byte rateSpot_T = 0;
long lastBeat_T = 0; //Time at which the last beat occurred

float beatsPerMinute_T;
int beatAvg_T;

void forceSetup(){
    Serial.println("\nforce sensor set!\n");
}

int readTapBPM(){
  return beatAvg_T;
}

void processTapBPM(){
  int fsrReading = analogRead(fsrAnalogPin);
  if(fsrReading >= 1000){
   
    long delta = millis() - lastBeat_T;
    lastBeat_T = millis();
    beatsPerMinute_T = 60 / (delta / 1000.0);

    if (beatsPerMinute_T < 255 && beatsPerMinute_T > 20)
    {
      rates_T[rateSpot_T++] = (byte)beatsPerMinute_T; //Store this reading in the array
      rateSpot_T %= RATE_SIZE_T; //Wrap variable

      //Take average of readings
      beatAvg_T = 0;
      for (byte x = 0 ; x < RATE_SIZE_T ; x++)
        beatAvg_T += rates_T[x];
      beatAvg_T /= RATE_SIZE_T;
    }
  }
}
