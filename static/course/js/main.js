(function main() {
    var searchbar = new StufiniteSearchbar()
    var timetable = new StufiniteTimetable()

    $("#search-form").bind("focus", function() {
        searchbar.show();
    });

    $(".stufinite-app-searchbar-toggle").bind("click", function(e) {
        if (searchbar.isVisible) {
            searchbar.hide();
        } else {
            searchbar.show();
        }
    });

    window.user = return_init_user_json();
    window.week = ["一", "二", "三", "四", "五"];

    window.credits = 0 //一開始的學分數是0
    window.courses = {}; //宣告一個空的物件
    window.course_of_majors = {}; //宣告一個空的物件
    window.course_of_day = {}; //這是宣告日期的陣列
    window.teacher_course = {}; //這是以老師姓名為index的陣列
    window.name_of_course = {}; //這是以課程名稱為index的陣列
    window.name_of_optional_obligatory = [] //這是用來存系上的必修課，檢查有沒有課名是重複的，若有就讓使用者自行決定要上哪堂
    $("#class_credit").text(0);
    window.language = "zh_TW"; //固定顯示語言為中文
    window.url_base = ""; //used to be the url that link to the syllabus of that course.
    window.haveloadin = {
        D: false,
        G: false,
        N: false,
        O: false,
        U: false,
        W: false
    }; //used to checked whether that json of specific degree has been loaded in or not, if it did, the value turn to ture.
    window.lastupdatetime = ""; //show the update time on server.
    window.department_name = {};
    window.already_post = true; //check whether post of not.

    timetable.init("NCHU", "zh_TW");
})()
