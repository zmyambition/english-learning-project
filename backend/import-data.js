const fs = require('fs');
const path = require('path');
const db = require('./config/db');

const FILE_NAME = 'ky.txt'; 

const CATEGORY_TAG = 'KY'; 

const importData = async () => {
    try {
        console.log(`🚀 开始读取 ${FILE_NAME} ...`);
        
        // 1. 读取文件内容
        const filePath = path.join(__dirname, FILE_NAME);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        
        // 2. 按行切割
        const lines = fileContent.split(/\r?\n/);
        console.log(`📦 检测到 ${lines.length} 行数据，准备解析...`);

        const values = [];

        // 3. 逐行解析
        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            const match = line.match(/^([a-zA-Z-]+)\s+(.*)/);

            if (match) {
                const word = match[1];
                const definition = match[2];
                
                const phonetic = ''; 

                values.push([word, phonetic, definition, CATEGORY_TAG]);
            }
        }

        console.log(`🔍 解析成功: ${values.length} 个有效单词`);

        // 4. 批量插入数据库
        const BATCH_SIZE = 1000;
        let totalInserted = 0;

        for (let i = 0; i < values.length; i += BATCH_SIZE) {
            const batch = values.slice(i, i + BATCH_SIZE);
            if (batch.length === 0) continue;

            const sql = 'INSERT IGNORE INTO words (word, phonetic, definition, category) VALUES ?';
            const [result] = await db.query(sql, [batch]);
            totalInserted += result.affectedRows;
            console.log(`   ⏳ 已处理 ${Math.min(i + BATCH_SIZE, values.length)} / ${values.length} ...`);
        }

        console.log(`✅ ${CATEGORY_TAG} 导入完成！`);
        console.log(`🎉 实际成功插入: ${totalInserted} 条`);
        process.exit();

    } catch (error) {
        console.error('❌ 导入出错:', error);
        console.error('建议检查文件名是否正确，或者文件是否放在 backend 目录下');
        process.exit(1);
    }
};

importData();