const createApp = require('./app');

const PORT = process.env.PORT || 3002;

// Create the app
const app = createApp();

// Start server
app.listen(PORT, () => {
  console.log(`Task Calendar API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down server...');
  try {
    await app.db.close();
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});
