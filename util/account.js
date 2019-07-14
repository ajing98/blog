const fs = require('fs');
const path = require('path');
const base64 = require('base-64');

module.exports = {
    /**
     * 帐号验证
     * @param {Object} item --登录信息JSON对象，{ account：xxx,passwd:xxx }
     */
    verify(item) {
        let url = path.join(__dirname, '../config/account.json');
        let admin = JSON.parse(fs.readFileSync(url).toString());
        if (admin.account == item.account && base64.decode(admin.passwd) == item.passwd) {
            return true;
        }
        return false;
    },
    /**
     * 修改登录信息
     * @param {Object} item --登录信息JSON对象，{ account：xxx,passwd:xxx } 
     */
    change(item) {
        let url = path.join(__dirname, '../config/account.json');
        item.passwd = base64.encode(item.passwd);
        fs.writeFile(url, JSON.stringify(item), (err) => {
            if(err){
                console.error(err);
            }
        })
    }
}