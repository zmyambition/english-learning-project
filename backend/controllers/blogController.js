const db = require('../config/db');
exports.getAllBlogs = async (req, res) => {
    try {
        // 1. 先查出所有博客，并关联查出 发帖人信息
        const [blogs] = await db.execute(`
            SELECT blogs.*, users.username 
            FROM blogs 
            JOIN users ON blogs.user_id = users.id 
            ORDER BY blogs.created_at DESC
        `);

        // 2. 查出所有评论，并关联查出 评论人信息
        const [allComments] = await db.execute(`
            SELECT comments.*, users.username 
            FROM comments 
            JOIN users ON comments.user_id = users.id 
            ORDER BY comments.created_at ASC
        `);

        // 3. 在内存中把评论“塞”进对应的博客里 (数据组装)
        const result = blogs.map(blog => {
            // 找到属于这篇博客的所有评论
            const blogComments = allComments.filter(c => c.blog_id === blog.id);
            return {
                ...blog,
                comments: blogComments // 把评论数组挂载上去
            };
        });

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: '获取动态失败' });
    }
};

// 发布博客
exports.createBlog = async (req, res) => {
    const { userId, content } = req.body;
    try {
        await db.execute('INSERT INTO blogs (user_id, content) VALUES (?, ?)', [userId, content]);
        res.json({ message: '发布成功' });
    } catch (error) {
        res.status(500).json({ message: '发布失败' });
    }
};

// 删除博客 (只有作者自己能删)
exports.deleteBlog = async (req, res) => {
    const { blogId, userId } = req.body;
    try {
        // 1. 先检查这篇博客是不是这个人发的
        const [rows] = await db.execute('SELECT * FROM blogs WHERE id = ? AND user_id = ?', [blogId, userId]);
        if (rows.length === 0) {
            return res.status(403).json({ message: '你无权删除此博客' });
        }
        
        // 2. 先删评论，再删博客
        await db.execute('DELETE FROM comments WHERE blog_id = ?', [blogId]);
        await db.execute('DELETE FROM blogs WHERE id = ?', [blogId]);
        
        res.json({ message: '删除成功' });
    } catch (error) {
        res.status(500).json({ message: '删除失败' });
    }
};

// 发表评论
exports.createComment = async (req, res) => {
    const { blogId, userId, content } = req.body;
    try {
        await db.execute('INSERT INTO comments (blog_id, user_id, content) VALUES (?, ?, ?)', [blogId, userId, content]);
        res.json({ message: '评论成功' });
    } catch (error) {
        res.status(500).json({ message: '评论失败' });
    }
};

// 删除评论 (只有评论者自己能删)
exports.deleteComment = async (req, res) => {
    const { commentId, userId } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM comments WHERE id = ? AND user_id = ?', [commentId, userId]);
        if (rows.length === 0) {
            return res.status(403).json({ message: '无权删除' });
        }
        await db.execute('DELETE FROM comments WHERE id = ?', [commentId]);
        res.json({ message: '删除成功' });
    } catch (error) {
        res.status(500).json({ message: '删除失败' });
    }
};