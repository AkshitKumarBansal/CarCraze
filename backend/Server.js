require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { PORT, connectMongoDB } = require('./src/config');

connectMongoDB();

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`CarCraze server listening on http://localhost:${PORT}`);
});