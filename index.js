const net = require('net')
const server = net.createServer();
const readFile = require('fs').readFile;
const path = require('path');

const filePath = fileName => path.resolve(process.cwd(), `text/${fileName}.txt`)

server.on('connection', handleConnection);

server.listen(9000, function() {
  console.log('server listening to %j', server.address());
});

const clients = {}

// Socket comes into this function
function handleConnection(socket) {
  const remoteAddress = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`new client connection from ${remoteAddress}`);

  socket.setEncoding('utf8')

  clients[remoteAddress] = socket

  // Read File from another folder
  readFile(path.resolve(process.cwd(), `text/text.txt`), 'utf8', 
    (err,data) => {
      if (err) 
        return reject(err)
      socket.write(data)
  })

  socket.on('data', function handleData(data) {
    console.log('Got data', data)
    Object.keys(clients).forEach((client) => {
      if(client !== remoteAddress) {
        client[client].write(`${client}: ${data}`)
      }
    })
  }) ;

  socket.on('error', handleError);
  socket.on('close', handleClose);

  function handleData(data) {
    console.log('Got Data', data)
  }

  function handleError(error) {
    console.log('Got Error', error)
  }

  function handleClose(close) {
    Object.keys(clients).forEach((client) => {
      if(client !== remoteAddress) {
        client[client].write(`${remoteAddress} has disconnected...`)
      }
    })
    console.log(remoteAddress, 'has disconnected...')
  }
}


// Use "chrome://inspect" for Debugging
// "node --debug --inspect index.js" to run Node
// nc localhost:9000