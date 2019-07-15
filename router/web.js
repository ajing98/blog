const express = require('express');
const formidable = require('formidable');
const dateTime = require('date-time');
const router = express.Router();
const db = require('../util/db');
const article = require('../model/article');
const setting = require('../util/setting');

// 首页
router.get(/^((\/)|(\/index))$/, (req, res) => {
    //获取当前页数
    let page = req.query.page == undefined ? 1 : parseInt(req.query.page);
    console.log(page);
    //更具当前页求出跳过查询数据,每页显示6条数据
    let skip = (page - 1) * 6;
    db.connect(); //连接数据库
    article.queryArticleSix(skip, (err, data) => {
        if (err) {
            console.error(err);
        }
        //查询文章总数
        article.queryArticleCount((err, count) => {
            db.close();
            if (err) {
                console.error(err);
                return;
            }
            //每6个一页，多出另算一页，求总页数
            var sum = count % 6 == 0 ? count / 6 : parseInt(count / 6) + 1;
            res.render('./webcontent/index', {
                sum: sum,
                data: data,
                page: page,
                category:''
            });
        })
    })
});

//分类显示
router.get('/article/:category',(req,res)=>{
    //获取查询的分类
    let category = req.params.category;
    db.connect();
    article.queryArticle({category:category},(err,data)=>{
        db.close();
        if (err) {
            console.error(err);
            return;
        }
        if(data.length==0){
            res.render('./webcontent/404.ejs');
            return;
        }
        res.render('./webcontent/index', {
            sum:0,
            page:0,
            data: data,
            category:category
        });
    })
    
});

//进入文章详情
router.get('/article/:category/:id', (req, res) => {
    db.connect();
    //查询数据
    article.queryArticleOne(req.params.id, (err, data) => {
        db.close();
        if (err) {
            console.error(err);
            res.render('./webcontent/404');
            return;
        }
        //留言的总页数
        let len = data.message.length;
        let sum = len % 5 == 0 ? len / 5 : parseInt(len / 5) + 1;
        
        res.render('./webcontent/article', {
            data: data,
            sum:sum
        })

    });
});

//提交留言
router.post('/message/:category/:id/post',(req,res)=>{
    var form = new formidable.IncomingForm();
    form.parse(req,(err,fileds,files)=>{
        if(err){
            console.error(err);
            return;
        }
        let id = req.params.id;
        let item = {
            user:fileds.post_user,
            email:fileds.user_email,
            content:fileds.post_content,
            time:dateTime()
        }
        db.connect();
        article.postMessage(id,item,(err)=>{
            db.close();
            if(err){
                console.error(err);
                return;
            }
            console.log(`/article/${req.params.category}/${id}`);
            res.redirect(`/article/${req.params.category}/${id}`);
        });
    });
});

//获取评论
router.get('/api/get/message', (req, res) => {
    db.connect();
    article.getMessage(req.query._id, (err, list) => {
        db.close();
        if (err) {
            res.json({
                status: false
            });
            return;
        }
        //获取留言信息
        let array = list.length==0 ? list:list[0].message.reverse();
        
        // //求总页数，五个一页，不够5为一页
        let len = array.length;
        let sum = len % 5 == 0 ? len / 5 : parseInt(len / 5) + 1;
        
        res.json({
            status: true,
            msg:array,
            sum:sum
        })
    });

});
//获取博客设置信息
router.get('/api/get/setting',(req,res)=>{
    res.json({
        setting:setting.getSetting()
    });
});

module.exports = router;