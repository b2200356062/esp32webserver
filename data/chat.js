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
 
        const objToSend = {
            type: 1,
            name: name
        }
         
        const serializedObj = JSON.stringify(objToSend);    
        ws.send(serializedObj);     
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
            
         const chatLine = GetChatLine(receivedObj);
            
         const chatDiv = document.getElementById("chatDiv");            
         chatDiv.appendChild(chatLine);
          
    };
 }
 
function CloseWebsocket(){
     
    const objToSend = {
        type: 2,
        name: name
    }
     
    const serializedObj = JSON.stringify(objToSend);
    ws.send(serializedObj);
 
    ws.close();
}
 
function SendData(){
  
    const inputTextElement = document.getElementById("inputText");
  
    const msg = inputTextElement.value;
    inputTextElement.value = '';
  
    const objToSend = {
        type: 3,
        msg: msg,
        name: name
    }
     
    const serializedObj = JSON.stringify(objToSend);
     
    ws.send(serializedObj);
}
 
function GetChatLine(event){
 
    const newTag = document.createElement('span');
    let newMsg = null;      
     
    newTag.classList.add('chat-tag');
     
    if(event.type === 1){
         
        newTag.classList.add('chat-tag--join');
        newTag.textContent = `${event.timestamp} ${event.name} has joined the chat.`;
         
    }else if(event.type === 2){
     
        newTag.classList.add('chat-tag--left');
        newTag.textContent = `${event.timestamp} ${event.name} has left the chat.`;
     
    }else{
     
        newTag.classList.add('chat-tag--message');
        newTag.textContent = `${event.timestamp} ${event.name}`;
 
        newMsg = document.createElement('span');
        newMsg.textContent = event.msg; 
    }
     
    const newChatEntryElement = document.createElement('div');
    newChatEntryElement.appendChild(newTag);
     
    if(newMsg != null){
        newChatEntryElement.appendChild(newMsg);
    }
         
    return newChatEntryElement;
 
}