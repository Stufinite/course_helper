$(document).ready(function() {
    /**一開始的簡易版使用說明**/
    //toastr.success("1. 請從選擇系級開始（未選擇系級，無法使用以下功能）<br />2. 點擊課表中的+字號，旁邊欄位會顯示可排的課程，請善加利用<br />3. 任何課程都可以使用課程查詢來找<br />特別小叮嚀(1)：課程查詢以各位輸入的條件篩選，條件越少，找到符合的課程就越多<br />特別小叮嚀(2)：如果有想要查詢其他系的必選修，也可以使用雙主修功能<br />4. 如果排好課，有需要請截圖來保留自己理想的課表（如果課表太大，可利用縮放功能來縮小視窗以利截圖）", "使用說明", {timeOut: 250000});
    $.when(get_json_when_change_degree("/static/course/json/O.json", null), $.getJSON("/static/course/json/new_department.json", function(depJson) {
        build_department_arr(depJson);
        return_url_and_time_base();
    })).then(function() {
        //when的功能註解就是下面這兩條
        //1. couse O.json is suitable for all kind of degree, so it will be loaded in automatically.
        //2. 當文件準備好的時候，讀入department的json檔, 因為這是顯示系所，沒多大就全部都載進來
        get_from_django();
    });
    $('#m_career').change(function() {
        var degree = $('#m_career').val();
        console.log("change_degree");
        load_json_for_user(degree, null);
        //cause O means other, general education, department class and others are all included, so this json is loaded in by default.
    })
    $(".search_result").delegate("button.btn-link", "click", function() { //delegate可以去抓到還不存在的東西，第一個$()是指作用的區域，delegate的()裡面就是option，dblclick是事件
        var code = $(this).val(); //this會代表我抓到的那個東西，也就是option
        course = courses[code][0];
        var check = add_course($('#time-table'), course, language);
        if (check == "available") {
            change_color($(this), "used"); //選過的課程就會改顏色
        }
    });
    /**********最主要的系級提交funciton，若要修改請謹慎小心!!!***********/
    $("#department_search").click(function() {
        get_major_and_level();
        var major2 = window.user['returnarr']['d_major'];
        var level2 = window.user['returnarr']['d_level'];
        add_doublemajor(major2, level2);
    });
    $('.ui.button.searchButton').click(function() {
        group_of_reset();
        var inputVal = $(this).siblings('input').val();
        console.log(inputVal)
        try {
            code_search(inputVal);
        } catch (err) {}
        try {
            title_search(inputVal);
            //這兩行分別是課名搜尋和教師名稱搜尋//把篩選學分的函式當作參數傳入
        } catch (err) {}
        try {
            teach_search(inputVal);
            //這兩行分別是課名搜尋和教師名稱搜尋//把篩選學分的函式當作參數傳入
        } catch (err) {}
        $('.searchInput').val("");
    })
    $("#clear-button").click(function() {
        reset();
    });
    $("#time-table").on("click", "button[class='close delete']", function() { //這是用來把一整個課程都刪掉的按鈕
        var code = $(this).children("input").val(); //找到子代的input，然後把裡面的代碼給取出來
        var major = window.user['returnarr']['major'];
        var level = window.user['returnarr']['level'];
        $.each(courses[code], function(ik, iv) {
            if (iv.obligatory_tf == true && iv.for_dept == major) {
                if (window.language == "zh_TW") {
                    toastr.warning("此為必修課，若要復原請點擊課表空格", {
                        timeOut: 2500
                    });
                } else {
                    toastr.warning("This is a required course, if you want to undo, please click the \"plus\" symbol", {
                        timeOut: 2500
                    });
                }
                delete_course($('#time-table'), iv); //就跟add_course一樣，只是把填東西改成刪掉
                return false;
            } else {
                delete_course($('#time-table'), iv) //就跟add_course一樣，只是把填東西改成刪掉
                return false;
            }
        })
    });
    $("#time-table").on("click", "span", function() { //按一下課表欄位就有課程彈出來了
        if ($(this).text() == "") { //我現在才知道null!=""
            var major = window.user['returnarr']['major'];
            var level = window.user['returnarr']['level'];
            var d_major = window.user['returnarr']['d_major'];
            var d_level = window.user['returnarr']['d_level'];
            var day = $(this).closest("td").attr("data-day"); //因為我把同一時段的課程塞進陣列裡，所以要用index去取
            var hour = $(this).closest("tr").attr("data-hour");
            reset_for_time_request();
            console.log(major + ' = ' + d_major + ' = ' + d_level);
            console.log(day + ' ' + hour);
            $.each(course_of_day[day][hour], function(ik, iv) {
                if (iv.for_dept == major || ((iv.for_dept == d_major) && (iv.class == d_level)) || iv.for_dept == "全校共同" || iv.for_dept == "共同學科(進修學士班)") { //判斷如果是主系的課就不分年級全部都會顯示出來，如果是輔系的就只顯示該年級的課；如果for_dept==undefined就代表是通識課；如果為全校共同或共同學科(進修學士班)就會是體育、國防、服務學習、全校英外語 or general education, chinese and english.
                    console.log(iv)
                    if (iv.obligatory_tf == false && iv.for_dept != major && iv.for_dept != d_major) {
                        //代表是教務處綜合課程查詢裡面的所有課、國防、師培、全校選修、全校英外語  (obligatory of 師培 can be true or false!!!)
                        check_which_common_subject(iv);
                    } else if (iv.obligatory_tf == true) {
                        check_which_bulletin_required(iv);
                        //判斷為國英文或是必修課和通識課!!!，包含體育
                        //(obligatory of 師培 can be true or false!!!)
                    } else if (iv.obligatory_tf == false) {
                        check_which_bulletin(iv);
                        //決定選修課該貼到哪個年級的欄位
                    }
                }

            })
            toggle_bulletin();
        }
    });
    $("#m_career").change(function() { //會動態變動系所與年級名稱
        //if the career(degree) has been changed, also change the level
        generate_major_level_option();
    })
    $(window).bind('beforeunload', function(e) {
        if (window.already_post == false) {
            return '請記得按上傳課表喔~';
        }
    })
    $('#post_for_course').click(function() { // if user already have clicked post button, unbind the action "beforeunload"
        $(window).unbind('beforeunload');
    });
});
/*******變換學制後，匯入該json檔*******/
var get_json_when_change_degree = function(path, time_table_from_django) {
    console.log(time_table_from_django == null);
    $.when($.getJSON(path, function(json) { //getJSON會用function(X)傳回X的物件或陣列
        //console.log(json);
        $.each(json.course, function(ik, iv) {
            if (typeof(window.course_of_majors[iv.for_dept]) == 'undefined') {
                //如果這一列(列的名稱為索引值key)是空的也就是undefined，那就對他進行初始化，{}物件裡面可以放任意的東西，在下面會把很多陣列塞進這個物件裡面
                window.course_of_majors[iv.for_dept] = {};
            }
            if (typeof(window.course_of_majors[iv.for_dept][iv.class]) == 'undefined') {
                window.course_of_majors[iv.for_dept][iv.class] = []; //如果這一行(列的名稱為索引值key)是空的也就是undefined，那就對他進行初始化，[]裡面的是放陣列
            }
            window.course_of_majors[iv.for_dept][iv.class].push(iv.code); //把東西推進這個陣列裡，概念跟stack一樣
            if (typeof(window.courses[iv.code]) == 'undefined') {
                window.courses[iv.code] = [];
            }
            window.courses[iv.code].push(iv); //這邊可以直接把選課號當作索引值key，裡面的值為object
            window.content.push({
                titile: iv.code
            });
            $.each(iv.time_parsed, function(jk, jv) { //建立日期的陣列
                $.each(jv.time, function(mk, mv) {
                    if (typeof(window.course_of_day[jv.day]) == 'undefined') {
                        window.course_of_day[jv.day] = {};
                    }
                    if (typeof(window.course_of_day[jv.day][mv]) == 'undefined') {
                        window.course_of_day[jv.day][mv] = [];
                    }
                    window.course_of_day[jv.day][mv].push(iv);
                })
            })
            if (typeof(window.teacher_course[iv.professor]) == 'undefined') { //建立老師名稱的陣列
                window.teacher_course[iv.professor] = [];
                window.content.push({
                    title: iv.professor
                });
            }
            window.teacher_course[iv.professor].push(iv);
            if (typeof(window.name_of_course[iv.title_parsed.zh_TW]) == 'undefined') { //中文課名陣列
                window.name_of_course[iv.title_parsed.zh_TW] = [];
                /**************************************************
                Window.content.push(the Chinese title of this class)
                will build a search index for Semantic Ui search bar
                可以自動補全文字
                **************************************************/
                window.content.push({
                    title: iv.title_parsed.zh_TW
                });
            }
            window.name_of_course[iv.title_parsed.zh_TW].push(iv);
            if (typeof(window.name_of_course[iv.title_parsed.en_US]) == 'undefined') { //英文課名陣列
                window.name_of_course[iv.title_parsed.en_US] = [];
                window.content.push({
                    title: iv.title_parsed.en_US
                });
            }
            window.name_of_course[iv.title_parsed.en_US].push(iv);
        });
    })).then(function() {
        if (time_table_from_django != null) {
            load_timetable(time_table_from_django);
        }

        /*****************************************************************
        Search bar from Semantic Ui
        *****************************************************************/
        $('.ui.search')
            .search({
                source: window.content
            });
    })

}

/************從翔宇那邊接user資料過來自動填系所必修課**********/
var new_get_json_when_change_degree = function(path, dept, grade) {
    $.when($.getJSON(path, function(json) { //getJSON會用function(X)傳回X的物件或陣列
        //console.log(json);
        $.each(json.course, function(ik, iv) {
            if (typeof(window.course_of_majors[iv.for_dept]) == 'undefined') //如果這一列(列的名稱為索引值key)是空的也就是undefined，那就對他進行初始化，{}物件裡面可以放任意的東西，在下面會把很多陣列塞進這個物件裡面
                window.course_of_majors[iv.for_dept] = {};
            if (typeof(window.course_of_majors[iv.for_dept][iv.class]) == 'undefined') {
                window.course_of_majors[iv.for_dept][iv.class] = []; //如果這一行(列的名稱為索引值key)是空的也就是undefined，那就對他進行初始化，[]裡面的是放陣列
            }
            window.course_of_majors[iv.for_dept][iv.class].push(iv.code); //把東西推進這個陣列裡，概念跟stack一樣
            if (typeof(window.courses[iv.code]) == 'undefined') {
                window.courses[iv.code] = [];
            }
            window.courses[iv.code].push(iv); //這邊可以直接把選課號當作索引值key，裡面的值為object
            window.content.push({
                title: iv.code
            });
            $.each(iv.time_parsed, function(jk, jv) { //建立日期的陣列
                $.each(jv.time, function(mk, mv) {
                    if (typeof(window.course_of_day[jv.day]) == 'undefined') {
                        window.course_of_day[jv.day] = {};
                    }
                    if (typeof(window.course_of_day[jv.day][mv]) == 'undefined') {
                        window.course_of_day[jv.day][mv] = [];
                    }
                    window.course_of_day[jv.day][mv].push(iv);
                })
            })
            if (typeof(window.teacher_course[iv.professor]) == 'undefined') { //建立老師名稱的陣列
                window.teacher_course[iv.professor] = [];
                window.content.push({
                    title: iv.professor
                });
            }
            window.teacher_course[iv.professor].push(iv);
            if (typeof(window.name_of_course[iv.title_parsed.zh_TW]) == 'undefined') { //中文課名陣列
                window.name_of_course[iv.title_parsed.zh_TW] = [];
                /**************************************************
                Window.content.push(the Chinese title of this class)
                will build a search index for Semantic Ui search bar
                可以自動補全文字
                **************************************************/
                window.content.push({
                    title: iv.title_parsed.zh_TW
                });
            }
            window.name_of_course[iv.title_parsed.zh_TW].push(iv);
            if (typeof(window.name_of_course[iv.title_parsed.en_US]) == 'undefined') { //英文課名陣列
                window.name_of_course[iv.title_parsed.en_US] = [];
                window.content.push({
                    title: iv.title_parsed.en_US
                });
            }
            window.name_of_course[iv.title_parsed.en_US].push(iv);
        });
    })).then(function() {
        add_major(dept, grade);
        /*****************************************************************
        Search bar from Semantic Ui
        *****************************************************************/
        $('.ui.search')
            .search({
                source: window.content
            });
    })

}

/*********獲得課程最後的更新時間*********/
var return_url_and_time_base = function() {
    // this function will return a string, url base, which will link to syllabus of that course. and assign it to a global variable.
    $.when(
        $.getJSON("/static/course/json/url_base.json", function(json) {
            window.url_base = json[0];
            window.lastupdatetime = json[1];
            $('#updatetime').text(window.lastupdatetime);
        })
    ).then(function() {

    });
}
var get_from_django = function() {
    /**********************************************************
    user_info_arr 會回傳使用者的grade和major，注意是按照這樣的順序喔
    **********************************************************/
    window.user = return_init_user_json();
    console.log(window.user);
    user_info_arr = return_major_and_level("{{ userDept_from_request | escapejs }}", "{{ userGrade_from_request | escapejs }}");
    window.user['returnarr']['degree'] = "{{ userDegree_from_request | escapejs }}";
    window.user['returnarr']['major'] = "{{ userDept_from_request | escapejs }}";
    window.user['returnarr']['level'] = "{{ userGrade_from_request | escapejs }}";
    user_degree_json_path = "/static/course/json/" + "{{ userDegree_from_request | escapejs }}" + ".json"; //userDegree_from_request is "Degree Character" from user session
    hadSaved_from_request = {
        {
            hadSaved_from_request | yesno: "1,0"
        }
    };
    window.user['user_name'] = "{{ email | escapejs }}";
    if (hadSaved_from_request == true) {
        if ("{{ time_table | escapejs }}" == "") {
            redirect_loc = "/course/course_zh_TW/?name=" + window.user['user_name'];
            document.location.href = redirect_loc;
            //重導向頁面到get的網址，這樣django template才能把使用者的書單丟進
        } else {
            window.user['user_dept'] = "{{ user_dept | escapejs }}";
            window.time_table_from_django = JSON.parse("{{ time_table | escapejs }}");
            // cause load_timetable func will call add_course, which will insert course into window.user['time_table']. The consequence is every course will be duplicated!! So time_table data got from django cannot be assign into window.user['time_table'] at the first time.
            load_json_for_user('U', window.time_table_from_django);
            /***********************************************************************
            把屬於使用者學制的json檔load進來，例如載入學士班的json
            the argument "time_table_from_django" is the data which is use "get" from db, contains user's timetable info.
            ***********************************************************************/
        }
    } else {
        console.log(user_degree_json_path)
        new_get_json_when_change_degree(user_degree_json_path, user_info_arr[1], user_info_arr[0]);
    }
}
