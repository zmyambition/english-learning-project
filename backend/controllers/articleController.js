const db = require('../config/db');
exports.getArticleList = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, title, summary, cover, created_at FROM articles ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: '获取列表失败' });
    }
};
exports.getArticleDetail = async (req, res) => {
    const { id } = req.query;
    try {
        const [rows] = await db.execute('SELECT * FROM articles WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: '文章不存在' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: '获取详情失败' });
    }
};