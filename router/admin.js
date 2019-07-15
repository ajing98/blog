const express = require('express');
const formidable = require('formidable');
const router = express.Router();
const article = require('../model/article');
const setting = require('../util/setting');
const db = require('../util/db');
const account = require('../util/account');
const tool = require('../util/tools');

//进入登录页 
router.get('/login', (req, res) => {
    //避免重复登录
    if (req.session.login_status) {
        res.redirect('/admin');
        return;
    }
    res.render('./admin/login', {
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    })
});

//后台登录 
router.post('/login', (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error(err);
            return;
        }
        //登录成功
        if (account.verify(fields)) {
            req.session.login_status = true;
            req.session.admin = fields.account;
            req.flash('success', '登录成功');
            res.redirect('/admin');
        } else { //登录失败
            req.flash('error', '帐号密码错误');
            res.redirect('/admin/login');
        }
    });
});

// 设置中间件，实现登录才能进入后台
router.use((req, res, next) => {
    if (req.session.login_status && req.session.admin) {
        next();
    } else {
        res.redirect('/admin/login');
    }
});

//管理首页
router.get('/', (req, res) => {
    db.connect();
    article.queryArticle((err, data) => {
        db.close();
        let count = 0; //记录总评论数
        if (err) {
            console.error(err);
            return;
        }
        for (let index = 0; index < data.length; index++) {
            count += data[index].message.length;
        }
        let len = data.length; //文章总数
        let categoryCount = setting.getSetting().category.length; //分类数  
        res.render('./admin/admin', {
            count: count,
            len: len,
            categoryCount: categoryCount,
            data: data.slice(0, 6), //截取数据，得到最新的5条
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
});

//后台设置
router.get('/setting', (req, res) => {
    let basic = setting.getSetting().basic;
    res.render('./admin/setting', {
        basic: basic
    });
});
//保存设置
router.post('/setting/save', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error(err);
            return;
        }
        //读取设置文件
        let settingJSON = setting.getSetting();
        settingJSON.basic = fields;
        //更新设置文件
        setting.setSetting(JSON.stringify(settingJSON));
        req.flash('success', '设置成功');
        res.redirect('/admin');
    });
});

//进入编辑页
router.get('/edit', (req, res) => {
    let category = setting.getSetting().category;
    res.render('./admin/edit', {
        category: category
    });
});
//保存编辑
router.post('/post', (req, res) => {
    var form = new formidable.IncomingForm();
    //设置编码
    form.encoding = 'utf-8';
    // 设置文件的保存路径(临时路径)
    form.uploadDir = './public/upload';
    //设置保留后缀
    form.keepExtensions = true;
    //获取提交奥数据
    form.parse(req, (err, fields, files) => {
        let item = {
            title: fields.article_title,
            author: setting.getSetting().basic.blog_account_name,
            time: tool.getTimeObj(fields.article_date),
            content: fields.article_content,
            category: fields.article_category,
            tags: fields.article_tag.split(/;|；/),
            file: {
                name: files.article_annex.name,
                url: files.article_annex.path.slice(7)
            },
        };
        db.connect();
        article.addArticle(item, (err, doc) => {
            db.close();
            if (err) {
                console.error(err);
                return;
            }
            console.log(doc);
            req.flash('success', '撰写成功')
            res.redirect('/admin');
        })
    });
});
//保存更新数据
router.post('/post/update', (req, res) => {
    let form = new formidable.IncomingForm();
    form.parse(req, (err, fields, file) => {
        if (err) {
            console.error(err);
            reture;
        }
        let item = {
            title: fields.article_title,
            content: fields.article_content,
            category: fields.article_category,
            tags: fields.article_tag.split(/;|；/),
        }
        let id = fields._id;
        db.connect();
        article.updateArticle(id, item, (err) => {
            db.close();
            if (err) {
                console.error(err);
                req.flash('error', '修改失败');
                res.redirect('/admin/manager')
                reture;
            }
            req.flash('success', '修改成功');
            res.redirect('/admin/manager');
        });
    })
});

//文章管理
router.get('/manager', (req, res) => {
    //获取当前页数
    let page = req.query.page == undefined ? 1 : parseInt(req.query.page);
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
            let sum = count % 6 == 0 ? count / 6 : parseInt(count / 6) + 1;
            res.render('./admin/manager', {
                sum: sum,
                data: data,
                page: page,
                success: req.flash('success').toString(),
                error: req.flash('error').toString()
            });
        })
    })

});
//获取单条数据
router.get('/api/article/one', (req, res) => {
    let id = req.query._id;
    db.connect();
    article.queryArticleOne(id, (err, data) => {
        db.close();
        if (err) {
            console.error(err);
            return;
        }
        let category = setting.getSetting().category;
        res.json({
            category: category,
            data: data
        });
    });
});
//删除文章
router.get('/manager/del', (req, res) => {
    let id = req.query._id;
    db.connect();
    article.deleteArticle(id, (err) => {
        db.close()
        if (err) {
            console.error(err);
            req.flash('error', '删除失败');
            res.redirect('/admin/manager');
            return;
        }
        req.flash('success', '删除成功');
        res.redirect('/admin/manager');
    })
});

//进入分类页
router.get('/category', (req, res) => {
    let category = setting.getSetting().category;
    res.render('./admin/category', {
        category: category,
        'success': req.flash('success').toString(),
        'error': req.flash('error').toString()
    });
});
//新增分类
router.post('/category/add', (req, res) => {
    var form = new formidable.IncomingForm();
    //获取提交数据
    form.parse(req, (err, fields, files) => {
        let settingJSON = setting.getSetting();
        for (let i = 0; i < settingJSON.category.length; i++) {
            //存在该分类，则不再保存
            if (settingJSON.category[i].category_name == fields.category_name) {
                req.flash('error', '已经存在该分类');
                res.redirect('/admin/category');
                return;
            }
        }
        settingJSON.category.push(fields);
        setting.setSetting(JSON.stringify(settingJSON));
        req.flash('success', '新增成功');
        res.redirect('/admin/category');
    });
});
//删除分类
router.get('/category/del', (req, res) => {
    let categoryName = req.query.category_name;
    let del = setting.delCategory(categoryName);
    req.flash(del.status, del.msg);
    res.redirect('/admin/category');
});

//进入修改登录信息页面
router.get('/change', (req, res) => {
    res.render('./admin/change', {
        currentAccount: req.session.admin,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});
//提交登录信息
router.post('/change', (req, res) => {
    var form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
        //验证成功
        console.log(fields);
        
        if (account.verify(fields)) {
            var item = {
                account: fields.new_account,
                passwd: fields.new_passwd
            }
            account.change(item);
            req.flash('success', '修改成功');
            req.session.login_status = false;
            req.session.admin = null;
            res.redirect('/admin/login');
        } //验证失败
        else {
            req.flash('error', '请输入正确的当前密码');
            res.redirect('/admin/change');
        }

    });
});

//退出登录
router.get('/outsign', (req, res) => {
    req.session.login_status = false;
    req.session.admin = null;
    res.redirect('/admin/login');
});

module.exports = router;