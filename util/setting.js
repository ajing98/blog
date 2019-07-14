const fs = require('fs');
const path = require('path');

module.exports = {  
    /**
     * 读取后台设置文件
     * @returns {Object} --返回一个JSON对象
     */
    getSetting(){
        let url = path.join(__dirname , '../config/setting.json');
        return settingJSON = JSON.parse(fs.readFileSync(url).toString());       
    },
    /**
     * 更新设置文件
     * @param {String} data 
     */
    setSetting(data){
        let url = path.join(__dirname , '../config/setting.json');
        fs.writeFileSync(url,data);
    },
    /**
     * 删除分类
     * @param {String} name 
     * @returns {Object} --返回一个对象，status状态，info提示信息
     */
    delCategory(name){
        let url = path.join(__dirname , '../config/setting.json');
        let settingJSON = JSON.parse(fs.readFileSync(url).toString());
        for (let i = 0; i < settingJSON.category.length; i++) {
            if(settingJSON.category[i].category_name == name){
                settingJSON.category.splice(i,1);
                this.setSetting(JSON.stringify(settingJSON));
                return {
                    status:'success',
                    msg:"删除成功"
                }; 
            }
            
        }
        return {
            status:'error',
            msg:"删除失败，不存在该分类"
        };
    }
}