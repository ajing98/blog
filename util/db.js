// 引入模块
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

module.exports = {
    //连接数据库
    connect() {
        var url = path.join(__dirname, '../config/db.json');
        var json = JSON.parse(fs.readFileSync(url).toString());
        const dburl = `${json.url}:${json.port}/${json.dbname}`
        const options = {
            useNewUrlParser: true
        };
        mongoose.connect(dburl, options, function (err) {
            if (err) {
                console.error('!!数据库连接失败!!');
            } else {
                console.log('⇊数据库连接成功⇊');
            }
        });
    },
    //关闭连接
    close() {
        mongoose.connection.close();
        console.log('⇈断开连接数据库⇈');
    },

}