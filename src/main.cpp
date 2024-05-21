#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
#include <algorithm>
#include <PubSubClient.h>
#include <nlohmann/json.hpp>
 
const char* ssid = "YourSSID";                  //CHANGE
const char* password =  "YourPassword";         //CHANGE 

const char* mqttServer = "broker.emqx.io";
const char* mqttUsername = "emqx";
const char* mqttPassword = "public";
const char* topic = "topic/mqttx";
const int mqttPort = 1883;

const char* ntpServer = "time.google.com";

AsyncWebServer server(80);
AsyncWebSocket socket("/chat");

std::string timeObject = "";

WiFiClient espClient;
PubSubClient mqttClient(espClient);

struct User {
  std::string username;
  std::string password;
};

User validUsers[] = {
  {"admin", "admin"},
  {"user1", "user1"},
  {"melih", "12345"},
  {"mcoach", "56789"}
};

bool checkCredentials(std::string username, std::string password) {
    
    for (User user : validUsers) {
        if (user.username == username && user.password == password) {
            return true;
        }
    }
    
    return false;
}

void onSocketEvent(AsyncWebSocket * server, AsyncWebSocketClient * client, AwsEventType type, void * arg, uint8_t *data, size_t len){
  
  uint8_t* message = nullptr;

  if(type == WS_EVT_CONNECT)
  {
    Serial.println("Websocket client connection received.");
  } 
  else if(type == WS_EVT_DISCONNECT)
  {
    Serial.println("Client disconnected.");
  } 
  else if(type == WS_EVT_DATA)
  {
    Serial.print("Data received: ");

    String messageText = "";
    
    for(size_t i=0; i < len; i++) {
      messageText += (char) data[i];
    }

    nlohmann::json receivedObj = nlohmann::json::parse(messageText.c_str());
    int msgType = receivedObj["type"];

    if (msgType == 0) {
      // Authentication request
      std::string username = receivedObj["name"];
      std::string password = receivedObj["password"];
      nlohmann::json response;
      response["type"] = 0;

      if (checkCredentials(username, password)) {
        response["success"] = true;
        client->text(response.dump().c_str());

        /*
        struct tm timeinfo;
        if (getLocalTime(&timeinfo)) {
          char buffer[80];
          strftime(buffer, sizeof(buffer), "%H:%M:%S", &timeinfo);
          String timestamp = buffer;

          nlohmann::json joinMessage;
          joinMessage["type"] = 1;
          joinMessage["name"] = username;
          String joinMsgWithTimestamp = joinMessage.dump() + " " + timestamp;
          ws.textAll(joinMsgWithTimestamp.c_str());
        }
        */
      } else {
        response["success"] = false;
        client->text(response.dump().c_str());
        client->close();
      }

    } else {
      struct tm time;
    
    if(!getLocalTime(&time))
    {
      Serial.println("Could not obtain time info");
      return;
    }

    message = (uint8_t*) malloc((len+1) * sizeof(uint8_t));
  
    for(int i=0; i < len; i++) 
    {
      Serial.print((char) data[i]);
      message[i] = data[i];
    }

    message[len] = '\0'; 

    if(mqttClient.connected())
    {
      mqttClient.publish("topic/mqttx", (const char*)message);
    }

    free(message); 
    message = nullptr; 

    Serial.println();
    }
    
    
  }
}
  
void callback(char *topic, byte *payload, unsigned int length) 
{
  
  // get message from javascript
  String message;
  for (int i = 0; i < length; i++) {
    message += (char) payload[i];
  }

  struct tm timeinfo;
  if(!getLocalTime(&timeinfo)){
    Serial.println("Failed to obtain time.");
    return;
  }

  char buffer[80];

  strftime(buffer, sizeof(buffer), "%H:%M:%S", &timeinfo);
  String timestamp = buffer;

  message += " ";
  message += timestamp;

  socket.textAll(message);
}

void setup(){
  Serial.begin(115200);
  
  if(!SPIFFS.begin())
  {
    Serial.println("An error has occurred while mounting SPIFFS.");
    return;
  }
 
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) 
  {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println(WiFi.localIP());
  
  // UTC+3
  configTime(10800, 0, ntpServer);

  // Setup local server
  socket.onEvent(onSocketEvent);
  server.addHandler(&socket);
 
  server.on("/chat", HTTP_GET, [](AsyncWebServerRequest *request)
  {
    request->send(SPIFFS, "/chat.html", "text/html");
  });
  
  server.on("/chat.js", HTTP_GET, [](AsyncWebServerRequest *request)
  {
    request->send(SPIFFS, "/chat.js", "text/javascript");
  });

  server.on("/chat.css", HTTP_GET, [](AsyncWebServerRequest *request)
  {
    request->send(SPIFFS, "/chat.css", "text/css");
  });
 
  server.begin();

  // Setup MQTT
  mqttClient.setServer(mqttServer, mqttPort);

  mqttClient.setCallback(callback);
  
  while (!mqttClient.connected()) {

      String client_id = "esp32-client-";
      client_id += String(WiFi.macAddress());
      Serial.printf("The client %s connects to the public MQTT broker...\n", client_id.c_str());

      if (mqttClient.connect(client_id.c_str(), mqttUsername, mqttPassword)) 
      {
        Serial.println("Public EMQX MQTT broker connected.");
      } 
      else 
      {
        Serial.print("failed with state ");
        Serial.print(mqttClient.state());
        Serial.print(" ");
        delay(2000);
      }
  }  
  mqttClient.subscribe(topic);
}

void loop(){
  mqttClient.loop();
}