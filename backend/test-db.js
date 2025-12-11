const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
    user: '4WkydtSj6FnS6oB.root',
    password: 'm2FIkbKHzeKQBAqC',
    database: 'english_learning_db',
    port: 4000,
    ssl: {
        rejectUnauthorized: false 
    }
});

console.log('正在尝试连接数据库...');

connection.connect((err) => {
    if (err) {
        console.error('❌ 连接失败！', err.message);
    } else {
        console.log('✅ 连接成功！(SSL加密模式)');
    }
    connection.end();
});