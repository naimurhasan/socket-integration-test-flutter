const io = require('socket.io')(4001, { 
    cors: {    
      origin: "*",    
      methods: ["GET", "POST"]  
    },
	allowEIO3: true})

let ROOMS = {
    "1": 0
}

io.on('connect', socket => {
    /// maintain global  user count
    console.log('An user connected '+socket.id)
    ROOMS["1"]++;
    socket.join("1")
    io.in("1").emit('room_count', ROOMS["1"])
    
    socket.on('disconnecting', function(){
        console.log('diconnecting')
        var self = this;
        let rooms = self.rooms
        for(let room of rooms){
            ROOMS[room] = (ROOMS[room] ?? 1)-1;
            self.to(room).emit('room_count', ROOMS[room]);
        }
    });

    socket.on('join-room', function(newRoom){
        console.log('switching room')
        console.log('a user joinig to '+newRoom)
        var self = this;
        let rooms = self.rooms
        // skip self socket
        let skipInt = 0;
        for(let room of rooms){
            if(skipInt==0){
                skipInt++;
                continue;
            }
            ROOMS[room] = (ROOMS[room] ?? 1)-1;
            self.leave(room);
            self.to(room).emit('room_count', ROOMS[room]);
        }
        ROOMS[String(newRoom)] = (ROOMS[String(newRoom)] ?? 0)+1;
        io.in(String(newRoom)).emit('room_count', ROOMS[String(newRoom)]);
    });

    socket.on('disconnect', ()=>{
        console.log('An user disconnected '+socket.id)
    })

    // maintain global message
    socket.on('send-message', function(msg, room){
		console.log('send message triggered '+msg+' '+room)
        socket.broadcast.to(String(room)).emit('recieve-message', msg)
    })
    
})