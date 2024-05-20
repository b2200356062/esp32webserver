var ws = null;
var name = null;
 
function OpenWebsocket() {
 
    const nameTextElement = document.getElementById("nameText");
 
    name = nameTextElement.value;
    nameTextElement.value = '';

    const passTextElement = document.getElementById("passText");

    let password = passTextElement.value;
    passTextElement.value = '';

    if (!name || !password) {
        alert("Please enter both username and password");
        return;
    }

    const url = `ws://${location.hostname}/chat`;   
    ws = new WebSocket(url);
 
    ws.onopen = function() {

        const authMessage = JSON.stringify({
            type: 0,
            name: name,
            password: password
        });

        ws.send(authMessage);
   
    };
 
    ws.onclose = function() {
    
        document.getElementById("inputText").disabled = true;
        document.getElementById("sendButton").disabled = true;        
        document.getElementById("disconnectButton").disabled = true; 
        document.getElementById("connectButton").disabled = false;
        document.getElementById("nameText").disabled = false;
        document.getElementById("passText").disabled = false; 
 
        document.getElementById("chatDiv").innerHTML = '';  
    };
    
    ws.onmessage = function(event) {

        if (event.data.includes("\"type\":0")) {
            const data = JSON.parse(event.data);
            if (data.success === false) {
                alert("Wrong login");
                ws.close();
                return;
            } else {
                document.getElementById("inputText").disabled = false;
                document.getElementById("sendButton").disabled = false;
                document.getElementById("disconnectButton").disabled = false;
                document.getElementById("connectButton").disabled = true;
                document.getElementById("nameText").disabled = true;
                document.getElementById("passText").disabled = true;  

                // Send type 1 message after successful authentication
                const joinMessage = JSON.stringify({
                    type: 1,
                    name: name
                });
                ws.send(joinMessage);
            }
        } else {
            console.log(event.data);

            const lastSpaceIndex = event.data.lastIndexOf(' ');
            const jsonString = event.data.substring(0, lastSpaceIndex);
            const timestamp = event.data.substring(lastSpaceIndex + 1) || ""; // If there's no timestamp, set it to an empty string
    
            // Parse the JSON string
            const receivedObj = JSON.parse(jsonString);
    
            // Add the timestamp to the parsed object
            receivedObj.timestamp = timestamp;
    
            const chatLine = GetChatLine(receivedObj);
    
            const chatDiv = document.getElementById("chatDiv");            
            chatDiv.appendChild(chatLine);
        }

        
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