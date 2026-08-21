require('dotenv').config();
const http = require('http');
const app = require('./src/app');
const { connectMongoDB } = require('./src/config');

const PORT = process.env.PORT || 5001;

connectMongoDB()
  .then(() => {
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`CarCraze server is running on port ${PORT}`);
    });

    server.on('error', (error) => {
      console.error('Server error:', error);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });