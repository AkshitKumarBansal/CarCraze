require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { PORT, connectMongoDB } = require('./src/config');

connectMongoDB()
  .then(() => {
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`CarCraze server listening on http://localhost:${PORT}`);
    });

    server.on('error', (error) => {
      console.error('Server error:', error);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });