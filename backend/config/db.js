const mysql = require('mysql2');
const pool = mysql.createPool({
    host: 'gateway01.ap-northeast-1.prod.aws.tidbcloud.com',
    user: '4WkydtSj6FnS6oB.root',
    password: 'm2FIkbKHzeKQBAqC',
    database: 'english_learning_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        rejectUnauthorized: false
    }
});
module.exports = pool.promise();