const express  = require('express');
const router = express.Router();

// 首页
router.get(/^((\/)|(\/index))$/,function(req,res){
    res.render('./webcontent/index');
});

module.exports = router;