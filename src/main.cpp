#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
#include <algorithm>
#include <PubSubClient.h>
 
const char* ssid = "telefon";
const char* password =  "123456789";

const char* mqtt_server = "broker.emqx.io";
const char* mqttusername = "emqx";
const char* mqttpassword = "public";
const char* topic = "topic/mqttx";
const int mqttport = 1883;
  
AsyncWebServer server(80);
AsyncWebSocket ws("/chat");

WiFiClient espClient;
PubSubClient mqttclient(espClient);

void onWsEvent(AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len){
  
  uint8_t* message = nullptr;

  if(type == WS_EVT_CONNECT){
  
    Serial.println("Websocket client connection received");
     
  } else if(type == WS_EVT_DISCONNECT){
 
    Serial.println("Client disconnected");
  
  } else if(type == WS_EVT_DATA){

    Serial.print("Data received: ");

    message = (uint8_t*) malloc((len+1) * sizeof(uint8_t));
  
    for(int i=0; i < len; i++) {
      Serial.print((char) data[i]);
      message[i] = data[i];
    }
    message[len] = '\0'; 

    if(mqttclient.connected()) {
      mqttclient.publish("topic/mqttx", (const char*)message);
    }

    free(message); 
    message = nullptr; 

    Serial.println();
  }
}
  
void callback(char *topic, byte *payload, unsigned int length) {

    String message;
    for (int i = 0; i < length; i++) {
        message += (char) payload[i];
    }
    ws.textAll(message);
}

void setup(){
  Serial.begin(115200);
  
  if(!SPIFFS.begin()){
     Serial.println("An Error has occurred while mounting SPIFFS");
     return;
  }
 
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }
  
  Serial.println(WiFi.localIP());
  
  ws.onEvent(onWsEvent);
  server.addHandler(&ws);
 
  server.on("/chat", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/chat.html", "text/html");
  });
  
  server.on("/chat.js", HTTP_GET, [](AsyncWebServerRequest *request){
    request->send(SPIFFS, "/chat.js", "text/javascript");
  });
 
  server.begin();

  mqttclient.setServer(mqtt_server, mqttport);

  mqttclient.setCallback(callback);
  
  while (!mqttclient.connected()) {
      String client_id = "esp32-client-";
      client_id += String(WiFi.macAddress());
      Serial.printf("The client %s connects to the public MQTT broker\n", client_id.c_str());
      if (mqttclient.connect(client_id.c_str(), mqttusername, mqttpassword)) {
          Serial.println("Public EMQX MQTT broker connected");
      } else {
          Serial.print("failed with state ");
          Serial.print(mqttclient.state());
          Serial.print(" ");
          delay(2000);
      }
  }  
  mqttclient.subscribe(topic);
}

void loop(){
  mqttclient.loop();
}