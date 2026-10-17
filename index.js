const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// The dashboard is a static single-page app in web/ (add ?mode=firebase to use the real backend).
app.use(express.static(path.join(__dirname, 'web')));
app.use('/JS', express.static(path.join(__dirname, 'JS')));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
