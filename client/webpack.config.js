module.exports = {
  devServer: {
    allowedHosts: ['localhost', '127.0.0.1'],
    host: 'localhost',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        secure: false,
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        secure: false
      }
    },
    client: {
      overlay: true,
      progress: true,
      webSocketURL: 'ws://localhost:3000/ws'
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    }
  }
};
