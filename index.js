const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// تقديم الملفات الثابتة
app.use(express.static(__dirname + '/web'));

// التوجيه للصفحة الرئيسية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'web', 'login Page.html'));
});

// بدء تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
