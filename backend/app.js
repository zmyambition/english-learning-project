const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const authRoutes = require('./routes/authRoutes');
const wordRoutes = require('./routes/wordRoutes');
const articleRoutes = require('./routes/articleRoutes');
const blogRoutes = require('./routes/blogRoutes'); 
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/word', wordRoutes);
app.use('/api/article', articleRoutes);
app.use('/api/blog', blogRoutes);
/*app.listen(port, () => {
  console.log(`后端跑起来了: http://localhost:${port}`);
});*/
if (require.main === module) {
    app.listen(port, () => {
        console.log(`后端服务器正在运行: http://localhost:${port}`);
    });
}

module.exports = app;