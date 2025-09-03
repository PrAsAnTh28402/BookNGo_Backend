require('dotenv').config();
const app = require('./src/app'); // Import app.js

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
