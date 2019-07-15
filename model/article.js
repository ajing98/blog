// 引入模块
const mongoose = require('mongoose');
//定义结构
var articleSchema = new mongoose.Schema({
    title: String, //文章的标题
    author: String, //文章的作者
    time: Object, //文章的时间
    content: String, //文章的内容
    category: String, //文章的分类
    tags: Array, //文章的标签
    file: Object, //文章的附件
    message: Array //文章的留言
});
var ArticleModel = mongoose.model('article', articleSchema);

module.exports = {
    /**
     * 添加文章
     * @param {Object} item       --新增文章对象
     * @param {Function} callback --回调函数
     */
    addArticle (item, callback){
        //创建实体
        var saveEntity = new ArticleModel(item);
        saveEntity.save(callback);
    },
    /**
     * 查询文章总数
     * @param {Function} callback  --回调函数
     */
    queryArticleCount(callback){
        ArticleModel.countDocuments(callback);
    },
    /**
     * @param {Object} --查询条件，可选
     * 分类查询文章
     * @param {Function} callback --回调函数
     */
    queryArticle(option={},callback){
        ArticleModel.find(option).sort({_id:-1}).exec(callback);
    },
    /**
     * 查询最新的6条文章数据
     * @param {Number} skip       --当前页
     * @param {Function} callback --回调函数
     */
    queryArticleSix(skip, callback){
        ArticleModel.find({}).sort({
            _id: -1
        }).skip(skip).limit(6).exec(callback);
    },
    /**
     * 查询指定文章
     * @param {String} id           --查询文章的id
     * @param {Function} callback   --回调函数
     */
    queryArticleOne(id, callback){
        ArticleModel.findOne({
            _id: id
        }, callback);
    },
    /**
     * 更新指定文章
     * @param {Object} item         --更新文章对象
     * @param {Function} callback   --回调函数
     */
    updateArticle(id, item, callback){
        ArticleModel.updateOne({
            _id: id
        }, item, callback);
    },
    /**
     * 删除指定文章
     * @param {String} id           --删除文章的id
     * @param {Function} callback   --回调函数
     */
    deleteArticle (id, callback){
        ArticleModel.deleteOne({
            _id: id
        }, callback)
    },
    /**
     * 提交留言
     * @param {String} id         --对应的文章id
     * @param {Object} item       --提交留言对象
     * @param {Function} callback --回调函数
     */
    postMessage(id, item, callback){
        ArticleModel.updateOne({
            _id: id
        }, {
            $push: {
                message: item
            }
        }, callback);
    },
    /**
     * 删除留言
     * @param {String} id           --留言所在的文章id
     * @param {String} mid          --删除的留言的id
     * @param {Function} callback   --回调函数
     */
    delMessage(id, mid, callback){
        ArticleModel.updateOne({
            _id: id
        }, {
            $pull: {
                message: {
                    mid: mid
                }
            }
        }, callback);
    },
    /**
     * 根据文章id获取相应的留言信息
     * @param {String} id -文章id
     * @param {*} callback -回调函数
     */
    getMessage(id,callback){
        ArticleModel.find({_id:id},{message:1},callback);
    }
};