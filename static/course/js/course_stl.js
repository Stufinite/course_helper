/*******嘗試函式化選修填入課程的功能！！*******/
var add_major = function(major, level) {
    $.each(course_of_majors[major][level], function(ik, iv) {
        //先這一年級的必修課全部跑過一次，計算重複課名的數量
        $.each(courses[iv], function(jk, jv) {
            if (jv.obligatory_tf == true && jv.for_dept == major && jv.class == level) { //這樣就可以保證我計算到的必修數量一定是該科系該年級該班級了
                check_optional_obligatory(jv);
                return false;
            }
        })
    });
    $.each(course_of_majors[major][level], function(ik, iv) { //知道那些課程會重複之後，再決定那些課程要填入課表
        $.each(courses[iv], function(jk, jv) {
            if (jv.for_dept == major && jv.class == level) {
                var title_short = return_optional_obligatory_course_name(jv);
                if (window.name_of_optional_obligatory[title_short] == 1) { //只有必修課會被函式計算數量，所以就不用再判斷是否為必修了，一定是
                    if (jv.time_parsed == 0) { //表示應該為實習課，所以無時間,他沒有正課時間和實習時間，反正就是都沒有時間，神奇的是[]在boolean判斷式中居然會被當作0
                        bulletin_post($(".optional"), jv, language);
                    } else {
                        window.timetable.addCourse(jv);
                        //如果這個課名只有出現過一次，就可以自動填入
                    }
                } else { //當出現不止一次的時候就丟到bulletin，但是只丟屬於這個班級的
                    if (jv.obligatory_tf == true) {
                        show_optional_obligatory(jv); //若重複出現，則讓使用者自己決定
                    }
                }
            }
        })
    });
    $.each(course_of_majors[major], function(ik, iv) { //系上所有的選修課都先填入bulletin
        if (check_if_two_class(level).length == 1) { //代表只有一個班
            $.each(iv, function(jk, jv) {
                $.each(courses[jv], function(kk, kv) {
                    if (kv.obligatory_tf == false && kv.for_dept == major && kv.class == level) {
                        /************************************************************
                        kv.class == level limits only optional class for that grade will show!!!!
                        ************************************************************/
                        check_which_bulletin(kv); //由fuction決定該貼到哪個年級的欄位
                    }
                })
            })
        } else { //代表有兩個班
            var class_EN = level.split("")[1]; //班級的A或B，就是最後那個代碼
            if (ik.split("")[1] == class_EN) {
                $.each(iv, function(jk, jv) {
                    $.each(courses[jv], function(kk, kv) {
                        if (kv.obligatory_tf == false && kv.for_dept == major && kv.class.split("")[1] == class_EN && kv.class.split("")[0] == ik.split("")[0]) {
                            //console.log(kv);
                            check_which_bulletin(kv); //由fuction決定該貼到哪個年級的欄位
                            return false;
                        }
                    })
                })
            }
        }
    })
};

var add_doublemajor = function(major, level) {
    reset_for_time_request();
    department_course_for_specific_search(major, level);
}


/**************改變側欄課程顏色**************/
var change_color = function($target, command) { //一旦添加了課程，則側欄的課名改了顏色
    if (command == "available") {
        $target.parents('tr').find('td').eq(0).css("color", "black");
    } else if (command == "used") {
        $target.parents('tr').find('td').eq(0).css("color", "red");
    } else if (command == "available2") {
        $target.parents('tr').find('td').eq(0).css("color", "#B53074");
    } else {
        alert("遇到不可預期的錯誤，請聯絡開發小組XD");
    }
}

/****把有abcd班別的必修課做判斷，讓使用這自己選擇**********/
var return_optional_obligatory_course_name = function(course) {
    var len = course.title_parsed["zh_TW"].length;
    if (isChar(course.title_parsed["zh_TW"][len - 1]) == true) {
        //check whether the last char is 'abcd' or not.
        //if so, return the title without char.
        return course.title_parsed["zh_TW"].substring(0, len - 1);
    } else {
        return course.title_parsed["zh_TW"];
    }

}

/*********確認系上必修有無重名*********/
var check_optional_obligatory = function(course) {
    //用來確認這個系有幾堂必修課是同名的
    course.title_short = return_optional_obligatory_course_name(course); //will make a new key called title_short, that contains a chinese title which dont contain a character at the end.(like 英文作文(二)a -> 英文作文(二))
    //title_short是會自動宣告的區域變數，存沒有英文的課名

    if (typeof(window.name_of_optional_obligatory[course.title_short]) == 'undefined') { //如果這一列(列的名稱為索引值key)是空的也就是undefined，那就對他進行初始化，{}物件裡面可以放任意的東西，在下面會把很多陣列塞進這個物件裡面
        window.name_of_optional_obligatory[course.title_short] = 1;
    } else {
        window.name_of_optional_obligatory[course.title_short]++;
    }
    //console.log(course.title_short+' '+window.name_of_optional_obligatory[course.title_short]);
}

/*********處理課名*********/
var show_optional_obligatory = function(course) {
    var trun_title = return_optional_obligatory_course_name(course);
    //cause the character at the end of title is truncate, so named it trun_title
    if (window.name_of_optional_obligatory[trun_title] > 1) {
        bulletin_post($("#obligatory-post"), course, language);
    }
}

/********確認此系有沒有分AB班(選修用)********/
var check_if_two_class = function(level) { //為了讓我確認他是不是有分AB班，這個是用在選修課的填入判斷上
    level = level.split("");
    return (level); //可以從回傳的長度判斷是否有兩個班
}

/********確定有無分AB班********/
var check_which_class = function(major, level) { //確定他是不是有分A、B班
    if (major == "獸醫學系學士班 A" || major == "獸醫學系學士班 B" || major == "應用數學系學士班 A" || major == "應用數學系學士班 B" || major == "機械工程學系學士班 A" || major == "機械工程學系學士班 B" || major == "土木工程學系學士班 A" || major == "土木工程學系學士班 B" || major == "電機工程學系學士班 A" || major == "電機工程學系學士班 B") {
        var subclass = major.split(" "); //A班或B班
        subclass = subclass[1];
        var level = level; //取到年級
        level = (level + subclass);
        return level;
    } else {
        return (level); //取到年級
    }
}

/*********搜尋用*********/
var department_course_for_specific_search = function(major, level) {
    $.each(course_of_majors[major][level], function(ik, iv) { //因為這種輔系的課一定是交給使用者自己選，所以就不自動填入
        console.log(iv)
        $.each(courses[iv], function(jk, jv) {
            console.log(jv)
            if (jv.for_dept == major) { //這個判斷是為了像景觀學程那種專門上別的科系的課的系而設計的
                if (jv.obligatory_tf == true && jv.class == level) {
                    bulletin_post($(".optional"), jv, language);
                    return false;
                }
                if (jv.obligatory_tf == false && jv.class == level) { //因為輔系的查詢只能查一個年級，所以就可以只判斷是否為level
                    check_which_bulletin(jv);
                    return false;
                }
            }
        })
    });
}


var credits_filter = function() {
    var credits = $("#credits").val();
    if (credits != "") {
        return credits;
    } else {
        return true;
    } //到時候把整個credits_filter當成參數傳入搜尋的函式
    //參數會return東西到if判斷式，如果沒有輸入學分，就return TRUE就不會有任何影響了
}

/*******課程代碼搜尋*******/
var code_search = function(code) {
    if (code != "") {
        bulletin_post($(".optional"), courses[code][0], language);
    }
}

/********課程名稱搜尋********/
var title_search = function(class_title) {
    var posted_code = [];
    if (class_title != "") { //class_title is 課程名稱搜尋的字串
        $.each(name_of_course, function(ik, iv) {
            if (ik.search(class_title) != -1) {
                $.each(iv, function(jk, jv) {
                    if (posted_code.indexOf(jv.code) == -1) {
                        //indexOf will find whether jv.code is in posted_code this array.
                        // if it already exist, then i wont post this course into bulletin.
                        bulletin_post($(".optional"), jv, language);
                        console.log(jv)
                        posted_code.push(jv.code);
                    }
                });
            }
        })
    }
}

/********授課教授搜尋*********/
var teach_search = function(teacher) {
    if (teacher != "") { //teacher is 老師名稱搜尋的字串
        $.each(teacher_course[teacher], function(ik, iv) {
            bulletin_post($(".optional"), iv, language);
        });
    }
}

/*********教室資訊**********/
var fill_loction = function(course) { //回傳教室資訊，型態為string
    //course是課程物件
    var location = "";
    if (course.location != [""] && course.location != undefined) {
        //要確保真的有location這個key才可以進if，不然undefined進到each迴圈
        // 就會跳 [Uncaught TypeError: Cannot read property 'length' of undefined]這個error
        $.each(course.location, function(ik, iv) {
            location = location + " " + iv;
        })
    }
    if (course.intern_location != [""] && course.intern_location != undefined) {
        $.each(course.intern_location, function(ik, iv) {
            location = location + " " + iv;
        })
    }
    return location; //回傳字串
}

/*******獲得使用者選擇的主修資訊與年級*******/
var get_major_and_level = function() {
    //這會回傳一個major和level的陣列，供全域呼叫使用
    var arr = $('form').serializeArray(); //this is a jQuery function
    // will select all form of this html Document, and build and array of object
    window.user['returnarr']['degree'] = arr[0]['value'];
    var temp;
    temp = arr[1]['value'].split('-')[1];
    // window.user['returnarr']['level']=check_which_class(temp,arr[2]['value']);
    // window.user['returnarr']['major']=temp.split(' ')[0];
    temp = arr[1]['value'].split('-')[1];
    window.user['returnarr']['d_level'] = check_which_class(temp, arr[2]['value']);
    window.user['returnarr']['d_major'] = temp.split(' ')[0];
}

/******************************************************
把django回傳的使用者系所年級、修改成小幫手能使用的
******************************************************/
var return_major_and_level = function(major, level) {
    var temp;
    var returnarr = [];
    temp = major.split('-')[1];
    returnarr.push(check_which_class(temp, level));
    if (temp != undefined) {
        returnarr.push(temp.split(' ')[0]);
    }
    return returnarr;
}

var cal_possibility = function(course) {
    var pos = (course.number - course.enrolled_num) / course.number * 100;
    pos = new Number(pos);
    pos = pos.toFixed(2);
    if (pos < 0) {
        return 0;
    }
    return pos;
}

var isChar = function(input) {
    //input is the last character of short title.
    var code = input.charCodeAt(0);
    if (((code >= 65) && (code <= 90)) || ((code >= 97) && (code <= 122))) {
        // it is a letter
        return true;
    } else {
        return false;
    }
}
