const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the 'web' directory
app.use(express.static(path.join(__dirname, 'web')));

// Route for the login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'login Page.html'));
});

// Catch-all route for other HTML files
app.get('/*.htm*', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', req.path));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
