// server.js
const app = require('./app'); // Import the app from app.js

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
