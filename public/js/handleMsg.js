$(function () {
    let url = window.location.pathname.split('/');
    let id = url[url.length - 1];
    var data = null;
    //发起get请求
    $.getJSON('/api/get/message', {
        _id: id
    }, (json, status) => {
        if (!json.status) {
            return;
        }
        data = json.msg;
        showMessage({
            data: data
        });
    })

    $('.pagination li a').click(function (e) {
        e.preventDefault();
        console.log(data);
        $(this).parent().siblings('li').removeClass('active');
        $(this).parent().addClass('active');
        let $page = $(this).html();
        if ($page == '首页') {
            $page = 1;
        } else if ($page == '末页') {
            //获取长度
            let len = data.length;
            //求出总页数
            let sum = len % 5 == 0 ? len / 5 : parseInt(len / 5) + 1;
            $page = sum;
        } else {
            $page = parseInt($page);
        }
        showMessage({
            page: $page,
            data: data
        })
    });

});

/**
 * @param {Number} page -当前页数
 * @param {Array} data -留言信息数组
 */
function showMessage({ page = 1,data}) {
    let start =  (page - 1) * 5;
    let end = start + 5;
    let message = data.slice(start, end);
    //删除留言列表已有的留言信息
    $(".message-list").empty();
    //开始遍历刷新新一页的留言信息
    for (let i = 0; i < message.length; i++) {
        $('.message-list').append(`
                <div class="message-item">
                    <p class="text-warning message-user">
                        <span class="glyphicon glyphicon-user"></span>&nbsp; ${message[i].user}
                    </p>
                    <p class="message-content">${htmlEncodeByRegExp(message[i].content)}</p>
                    <p class="message-time">
                        <span class="glyphicon glyphicon-time"></span><small> ${message[i].time}</small>
                     </p>
                </div>
        `);
    }
}
/**
 * 预防XSS攻击
 * @param {String} str 
 */
function htmlEncodeByRegExp(str) {
    var s = "";
    if (str.length == 0) return "";
    s = str.replace(/&/g, "&amp;");
    s = s.replace(/</g, "&lt;");
    s = s.replace(/>/g, "&gt;");
    s = s.replace(/ /g, "&nbsp;");
    s = s.replace(/\'/g, "&#39;");
    s = s.replace(/\"/g, "&quot;");
    return s;
}