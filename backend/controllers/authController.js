const db = require('../config/db');

exports.register = async (req, res) => {
    const { username, password } = req.body;
    try {
        // 查重
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0) return res.status(400).json({ message: '该用户名已被注册' });
        // 插入
        await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
        res.status(201).json({ message: '注册成功' });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        if (rows.length === 0) return res.status(401).json({ message: '用户名或密码错误' });
        
        // 登录成功，返回用户ID
        res.json({ message: '登录成功', user: rows[0] });
    } catch (error) {
        res.status(500).json({ message: '服务器错误', error });
    }
};