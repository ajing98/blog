$.getJSON('/api/get/setting', (json, status) => {
    $("#blogName").html(json.setting.basic.blog_name);
    for (let i = 0; i < json.setting.category.length; i++) {
        $(".dropdown-menu").append(`
        <li>
            <a href="/article/${json.setting.category[i].category_name}">${json.setting.category[i].category_name}</a>
        </li>
    `)
    }  
});