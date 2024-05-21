var socket = null;
var name = null;
 
function OpenWebSocket() {
 
    const nameElement = document.getElementById("nameText");
    name = nameElement.value;
    nameElement.value = '';

    const passwordElement = document.getElementById("password");
    let password = passwordElement.value;
    passwordElement.value = '';

    if (!name || !password) {
        alert("Please enter both username and password.");
        return;
    }

    const url = `ws://${location.hostname}/chat`;   
    socket = new WebSocket(url);
 
    socket.onopen = function() {

        // send authentication request
        const authMessage = JSON.stringify({
            type: 0,
            name: name,
            password: password
        });

        socket.send(authMessage);
    };
 
    socket.onclose = function() 
    {
        document.getElementById("inputText").disabled = true;
        document.getElementById("sendButton").disabled = true;        
        document.getElementById("disconnectButton").disabled = true; 
        document.getElementById("connectButton").disabled = false;
        document.getElementById("nameText").disabled = false;
        document.getElementById("password").disabled = false; 
        document.getElementById("chatDiv").innerHTML = '';  
    };
    
    socket.onmessage = function(event) {

        // check if the message is a response to authentication request
        if (event.data.includes("\"type\":0"))
        {
            const data = JSON.parse(event.data);

            if (data.success === false)
            {
                alert("Wrong login!");
                socket.close();
                return;
            } 
            else 
            {
                // open if successful
                document.getElementById("inputText").disabled = false;
                document.getElementById("sendButton").disabled = false;
                document.getElementById("disconnectButton").disabled = false;
                document.getElementById("connectButton").disabled = true;
                document.getElementById("nameText").disabled = true;
                document.getElementById("password").disabled = true;  

                // send join message after successful authentication
                const joinMessage = JSON.stringify({
                    type: 1,
                    name: name
                });
                socket.send(joinMessage);

            }

        } else {
            // for every other type of message
            console.log(event.data);

            const lastSpaceIndex = event.data.lastIndexOf(' ');
            const jsonString = event.data.substring(0, lastSpaceIndex);
            const timestamp = event.data.substring(lastSpaceIndex + 1) || ""; // if there's no timestamp, set it to an empty string
    
            // parse the JSON string
            const receivedObj = JSON.parse(jsonString);
    
            // add the timestamp to the parsed object
            receivedObj.timestamp = timestamp;
    
            const chatLine = GetChatLine(receivedObj);
    
            const chatDiv = document.getElementById("chatDiv");      

            chatDiv.appendChild(chatLine);

            chatLine.scrollIntoView({ behavior: 'smooth' }); 
        }
    };
 }
 
function CloseWebSocket(){
     
    // disconnect message
    const objToSend = 
    {
        type: 2,
        name: name
    }
     
    const serializedObj = JSON.stringify(objToSend);
    socket.send(serializedObj);
 
    socket.close();
}
 
function SendData(){
  
    const inputElement = document.getElementById("inputText");
  
    const msg = inputElement.value;
    inputElement.value = '';
  
    const objToSend = {
        type: 3,
        msg: msg,
        name: name
    }
     
    const serializedObj = JSON.stringify(objToSend);
     
    socket.send(serializedObj);

    serializedObj.scrollIntoView({ behavior: 'smooth' }); 
}
 
function GetChatLine(event){
 
    const newTag = document.createElement('span');
    let newMsg = null;      
     
    newTag.classList.add('chat-tag');
     
    if(event.type === 1)
    {
        // join message
        newTag.classList.add('chat-tag--join');
        newTag.textContent = `${event.timestamp} ${event.name} has joined the chat.`;
    }
    else if(event.type === 2)
    {
        // disconnect message
        newTag.classList.add('chat-tag--left');
        newTag.textContent = `${event.timestamp} ${event.name} has left the chat.`;
    }
    else
    {
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