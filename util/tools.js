const path = require('path');
const fs = require('fs');

module.exports = {
    /**
     * @returns {String} --产生随机的唯一字符串
     */
    onlyId() {
        return Number(Math.random().toString().substring(2, 8) + new Date().valueOf()).toString(36);
    },
    /**
     * 
     * @param {String} date --格式为 ’yyyy-MM-dd :HH:mm‘ 的字符串
     * @returns {Object} --返回一个包含，year，month，day，time ...的JSON对象
     */
    getTimeObj(date) {
        let dateArr = date.split(/-|\s/); //截取返回数组 [y,M,d,HH:mm] => 0, 1, 2, 3
        let year = dateArr[0]; //年
        let month = dateArr[1]; //月
        let day = dateArr[2]; //日
        let time = dateArr[3]; //时间
        return {
            date: date,
            year: year,
            month: month,
            day: day,
            time: time
        }
    },
    /**
     * 处理文件对象
     * @param {Object} file --文件对象 
     * @returns {Object} 返回file的文件名，文件原路径，文件新路径
     */
    handlePath(file){
        //获取文件名
        let fileName = file.name;
        //获取文件扩展名
        let extName = path.extname(fileName);
        //生成随机id名
        let ranName = this.onlyId();
        //原路径
        var oldPath = '../'+path.normalize(file.path);
        oldPath = path.join(__dirname,oldPath);
        //新路径
        var newPath = `../public/upload/${extName.substring(1,extName.length)}/${ranName}${extName}`;
        newPath = path.join(__dirname,newPath);

        fs.renameSync(oldPath,newPath);
    }
}