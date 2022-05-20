var ROOM_ID = 1;
const socket = io('http://localhost:4001');
socket.on('connect', function(){
    console.log(socket.id)
})

// the number of member in this room
socket.on('room_count', function(msg){
    document.getElementById('room-count').innerHTML=msg;
})


socket.on('recieve-message', function(msg){
    console.log('broadcast recieved')
    apppendMessage(msg)
})

function apppendMessage(msg){
    var theParent = document.getElementById("messages");
    var theKid = document.createElement("p");
    theKid.innerHTML = msg;
    // prepend theKid to the beginning of theParent
    if(theParent.children.length>0){
        theParent.insertBefore(theKid, theParent.firstChild);
    }else{
        theParent.append(theKid)
    }
}

/// on submit
document.getElementById('message-form').addEventListener('submit', function(evt){
    evt.preventDefault()
    var msgInput = document.getElementsByName('message')[0]
    var msg = msgInput.value
    socket.emit('send-message', msg, ROOM_ID)
    msgInput.value = ""
    apppendMessage(msg)
})

/// on join room
document.getElementById('select-room').addEventListener('click', function(evt){
    evt.preventDefault()
    var roomId = document.getElementById('room-options').value
    if(ROOM_ID!= roomId){
        socket.emit('join-room', roomId)
        console.log('room id '+roomId)
        document.getElementById("messages").innerHTML = ""
        ROOM_ID = roomId
    }
})
