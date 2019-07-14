/**
 * 引入模块
 *  */ 
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const web = require('./router/web');
const admin = require('./router/admin');

// 创建应用
const app = express();

//设置静态资源
app.use(express.static('public')); 

//识别ejs  
app.set('view engine','ejs');
app.set('views','views');

//设置session
app.use(session({
    secret:'blog session key',
    resave: false,
    saveUninitialized: true
}));

//设置falsh
app.use(flash());

//路由
app.use('/',web);  //前台路由
app.use('/admin',admin);


app.get('*', function (req, res){
    res.render('./webcontent/404');
});

//注册监听端口
app.listen(3000,function(){
    console.log('监听端口为3000');
});