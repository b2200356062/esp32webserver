
var ws = null;
var name = null;

function OpenWebsocket() {
 
    const nameTextElement = document.getElementById("nameText");
 
    name = nameTextElement.value;
    nameTextElement.value = '';

    const url = `ws://${location.hostname}/chat`;   
    ws = new WebSocket(url);
 
    ws.onopen = function() {
        document.getElementById("inputText").disabled = false;
        document.getElementById("sendButton").disabled = false;
        document.getElementById("disconnectButton").disabled = false;
        document.getElementById("connectButton").disabled = true;
        document.getElementById("nameText").disabled = true;                    
    };
 
    ws.onclose = function() {
    
        document.getElementById("inputText").disabled = true;
        document.getElementById("sendButton").disabled = true;        
        document.getElementById("disconnectButton").disabled = true; 
        document.getElementById("connectButton").disabled = false;
        document.getElementById("nameText").disabled = false;
        document.getElementById("chatDiv").innerHTML = '';  
    };
    
    ws.onmessage = function(event) {
 
        const receivedObj = JSON.parse(event.data);
        const textToDisplay = `${receivedObj.name}: ${receivedObj.msg}`;
         
        const newChatEntryElement = document.createElement('p');
        newChatEntryElement.textContent = textToDisplay;
         
        const chatDiv = document.getElementById("chatDiv");         
        chatDiv.appendChild(newChatEntryElement);
 
    };
 }
 
function CloseWebsocket(){
    ws.close();
}
 
function SendData(){
  
    const inputTextElement = document.getElementById("inputText");
    const msg = inputTextElement.value;
    inputTextElement.value = '';
    const objToSend = {
        name: name,
        msg: msg
    }
    const serializedObj = JSON.stringify(objToSend);
    ws.send(serializedObj);
}