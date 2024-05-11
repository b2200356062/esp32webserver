// import './style.css'
// import javascriptLogo from './javascript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.js'
import mqtt from "mqtt";

// document.querySelector('#app').innerHTML = `
//   <div>
//     <a href="https://vitejs.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//       <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
//     </a>
//     <h1>Hello Vite!</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite logo to learn more
//     </p>
//   </div>
// `

// setupCounter(document.querySelector('#counter'))

const mqtturl = 'ws://broker.emqx.io:8083/mqtt'

const options = {
  // Clean session
  clean: true,
  connectTimeout: 4000,
  // Authentication
  clientId: 'emqx_testzpopop',
  username: 'emqx_test',
  password: '12345678Aa',
}

var client;

const connectbutton = document.querySelector('#connectbutton');
const sendbutton = document.querySelector('#sendbutton');

connectbutton.addEventListener('click', function() {
  
  client = mqtt.connect(mqtturl, options)

  client.on('connect', function () {
    console.log('Connected')
    console.log('your name is: '+ document.getElementById("nametext").value);
  });

  client.subscribe('topic/mqttx');
  // Receive messages
  client.on('message', function (topic, message) {
    // message is Buffer
    topic = "topic/mqttx";
    console.log(message.toString())

  })

});

sendbutton.addEventListener('click', function() {
  // Subscribe to a topic
  client.subscribe('topic/mqttx', function (err) {
    if (!err) {
      // Publish a message to a topic
      client.publish('topic/mqttx', document.getElementById("messagetext").value);
    }
  })
});


  // client.on('connect', function () {
  //   console.log('Connected')
  //   // Subscribe to a topic
  //   client.subscribe('topic/mqttx', function (err) {
  //     if (!err) {
  //       // Publish a message to a topic
  //       client.publish('topic/mqttx', 'Hello mqtt')
  //     }
  //   })
  // })
  



// var ws = null;
// var name = null;
 
// function OpenWebsocket() {
 
//     const nameTextElement = document.getElementById("nameText");
 
//     name = nameTextElement.value;
//     nameTextElement.value = '';
     
//     const url = `ws://${location.hostname}/chat`;   


//     ws = new WebSocket(url);
 
//     ws.onopen = function() {
                 
//         document.getElementById("inputText").disabled = false;
//         document.getElementById("sendButton").disabled = false;
//         document.getElementById("disconnectButton").disabled = false;
//         document.getElementById("connectButton").disabled = true;
//         document.getElementById("nameText").disabled = true;                    
//     };
 
//     ws.onclose = function() {
    
//         document.getElementById("inputText").disabled = true;
//         document.getElementById("sendButton").disabled = true;        
//         document.getElementById("disconnectButton").disabled = true; 
//         document.getElementById("connectButton").disabled = false;
//         document.getElementById("nameText").disabled = false;
 
//         document.getElementById("chatDiv").innerHTML = '';  
//     };
    
//     ws.onmessage = function(event) {
 
//         const receivedObj = JSON.parse(event.data);
//         const textToDisplay = `${receivedObj.name}: ${receivedObj.msg}`;
         
//         const newChatEntryElement = document.createElement('p');
//         newChatEntryElement.textContent = textToDisplay;
         
//         const chatDiv = document.getElementById("chatDiv");         
//         chatDiv.appendChild(newChatEntryElement);
 
//     };
// }

// function CloseWebsocket(){
//     ws.close();
// }
 
// function SendData(){
  
//     const inputTextElement = document.getElementById("inputText");
  
//     const msg = inputTextElement.value;
//     inputTextElement.value = '';
  
//     const objToSend = {
//         msg: msg,
//         name: name
//     }

//     const serializedObj = JSON.stringify(objToSend);
//     client.publish('topic/mqttx', serializedObj);
     
//     ws.send(serializedObj);
// }
