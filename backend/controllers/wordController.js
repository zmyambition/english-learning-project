const axios = require('axios');
const md5 = require('md5');//用于签名加密
//百度翻译API配置
const BAIDU_APP_ID = '20251121002502740';
const BAIDU_KEY = 'hb_RAyz4zolCBIi7J5Ja';

/**
 * 单词搜索功能
 * 功能：接收前端单词，转发给百度翻译 API，返回结果
 */
exports.searchWord = async (req, res) => {
    const { word } = req.query;

    if (!word) {
        return res.status(400).json({ message: '请输入单词' });
    }
    if (!BAIDU_APP_ID || !BAIDU_KEY) {
        console.log('⚠️ 未检测到百度Key，使用模拟数据');
        return res.json({
            src: word,
            dst: `[模拟翻译] ${word} 的中文意思...`,
            is_mock: true
        });
    }
    try {
        // 1. 生成百度 API 所需的签名 (Sign)
        // 规则：appid + word + salt + key 的 MD5 值
        const salt = Math.random();
        const sign = md5(BAIDU_APP_ID + word + salt + BAIDU_KEY);
        
        // 2. 发起请求
        const response = await axios.get('http://api.fanyi.baidu.com/api/trans/vip/translate', {
            params: {
                q: word,
                from: 'en',
                to: 'zh',
                appid: BAIDU_APP_ID,
                salt: salt,
                sign: sign
            }
        });
        // 3. 处理返回结果
        const data = response.data;
        
        if (data.error_code) {
            throw new Error(`百度API错误: ${data.error_msg}`);
        }

        // 返回给前端
        res.json({
            src: data.trans_result[0].src,
            dst: data.trans_result[0].dst
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '翻译失败，请检查网络或Key' });
    }
};

const db = require('../config/db'); // 引入数据库连接

/**
 * 加入生词本
 * 逻辑：利用数据库 UNIQUE 索引防止重复收藏
 */
exports.addToNotebook = async (req, res) => {
    const { userId, word, translation } = req.body;

    if (!userId || !word) {
        return res.status(400).json({ message: '参数缺失' });
    }

    try {
        await db.execute(
            'INSERT INTO notebook (user_id, word, translation) VALUES (?, ?, ?)', 
            [userId, word, translation]
        );

        res.json({ message: '收藏成功！' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: '这个单词已经在生词本里啦' });
        }
        console.error(error);
        res.status(500).json({ message: '收藏失败' });
    }
};


exports.getNotebook = async (req, res) => {
    const { userId } = req.query; // 从 URL 参数获取
    try {
        const [rows] = await db.execute(
            'SELECT * FROM notebook WHERE user_id = ? ORDER BY created_at DESC', 
            [userId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: '获取失败' });
    }
};

// 新增：删除生词
exports.deleteFromNotebook = async (req, res) => {
    const { id } = req.body; // 获取生词表里的 ID
    try {
        await db.execute('DELETE FROM notebook WHERE id = ?', [id]);
        res.json({ message: '删除成功' });
    } catch (error) {
        res.status(500).json({ message: '删除失败' });
    }
};
/**
 * 获取词库列表
 * 功能：支持按分类筛选，并强制按字母顺序排序
 */
exports.getWordLibrary = async (req, res) => {
    const { category } = req.query;
    try {
        let sql = 'SELECT * FROM words';
        let params = [];
        
        if (category && category !== 'all') {
            sql += ' WHERE category = ?';
            params.push(category);
        }

        // 核心：使用 LOWER() 函数确保排序忽略大小写，保证字典序正确
        sql += ' ORDER BY LOWER(word) ASC'; 

        const [rows] = await db.execute(sql, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '获取词库失败' });
    }
};

/**
 * 生成测试题目
 * 算法：使用 SQL 的 ORDER BY RAND() 随机抽取
 */
exports.getTestWords = async (req, res) => {
    const { source, userId } = req.query;
    
    try {
        let sql = '';
        let params = [];
        
        if (source === 'notebook') {
            // 从生词本里随机取
            sql = 'SELECT * FROM notebook WHERE user_id = ? ORDER BY RAND() LIMIT 20';
            params.push(userId);
        } else {
            // 从词库里按分类随机取
            sql = 'SELECT * FROM words WHERE category = ? ORDER BY RAND() LIMIT 20';
            params.push(source);
        }

        const [rows] = await db.execute(sql, params);
        
        // 只有单词数够生成选项时才返回
        if (rows.length < 4) {
            return res.status(400).json({ message: '单词数量太少，无法生成测试题（至少需要4个）' });
        }
        
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '获取题目失败' });
    }
};