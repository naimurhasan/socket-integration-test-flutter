import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;

const int roomId = 1;
const String socketURL = 'http://localhost:4001/';

class MyHomePage extends StatefulWidget {
  const MyHomePage({
    Key? key,
  }) : super(key: key);

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  late IO.Socket socket;
  int liveCount = 0;
  List<String> messages = [];
  TextEditingController textController = TextEditingController();

  void initSocket() {
    socket = IO.io(socketURL);
    socket.onConnect((_) {
      debugPrint('connect');
      socket.emit('send-message', ["I'm joined!", roomId]);
    });
    socket.on('room_count', (data) {
      setState(() {
        liveCount = data;
      });
    });
    socket.onDisconnect((_) => debugPrint('disconnect'));
    socket.on('recieve-message', (msg) {
      debugPrint('recieved message ' + msg);
      setState(() {
        messages.insert(0, msg);
      });
    });
  }

  @override
  void initState() {
    initSocket();
    super.initState();
  }

  void _submitMessage() {
    String msg = textController.text;
    textController.text = "";
    if (msg.isNotEmpty) {
      socket.emit('send-message', [msg, roomId]);
      setState(() {
        messages.insert(0, msg);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('SOCKET TEST'),
        actions: [
          Center(
            child: Padding(
                padding: const EdgeInsets.only(right: 10.0),
                child: Text(
                  'Joined: $liveCount',
                  style: const TextStyle(fontSize: 18.0),
                )),
          )
        ],
      ),
      body: Column(children: [
        Expanded(
            child: ListView.builder(
          reverse: true,
          itemCount: messages.length,
          itemBuilder: (BuildContext ctx, int pos) {
            return Card(
              child: Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text(messages[pos]),
              ),
            );
          },
        )),
        SizedBox(
          height: 100,
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  onSubmitted: (value) => _submitMessage(),
                  controller: textController,
                  decoration: const InputDecoration(
                      label: Text("Message"),
                      border: OutlineInputBorder(
                          borderSide: BorderSide(color: Colors.grey))),
                ),
              ),
              const SizedBox(
                width: 5.0,
              ),
              ElevatedButton(
                onPressed: _submitMessage,
                child: const Icon(Icons.send),
                style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 21.0)),
              )
            ],
          ),
        )
      ]),
    );
  }
}
