class StufiniteSearchbar {
    constructor() {
        this.isVisible = false;
        this.type = ['optional', 'human', 'society', 'nature', 'PE']
    }

    show() {
        $(".stufinite-app-searchbar-toggle").attr("data-toggle", "true")
        $(".stufinite-app-searchbar-container").animate({
            right: 0
        }, 200);
        this.isVisible = true;
    }

    hide() {
        $(".stufinite-app-searchbar-toggle").attr("data-toggle", "false")
        $(".stufinite-app-searchbar-container").animate({
            right: "-300px"
        }, 200);
        this.isVisible = false;
    }

    addResult(target, course, language) {
        let result = $(
            `<div class="stufinite-searchbar-result-item">
              <h4 class='title'></h4>
              <span class='info'></span>
              <div class="action-btn">
                <button><a class='join'>加入</a></button>
                <button><a class='review'>心得</a></button>
                <button><a class='detail'>詳細資料</a></button>
              </div>
            </div>`);

        result
            .find('h4.title').text(language == "zh_TW" ? course.title_parsed["zh_TW"] : course.title_parsed["en_US"]).end()
            .find('span.info').text(build_bulletin_time(course) + ' | ' + course.professor).end()
            .find('a.join').attr('code', course.code).bind('click', function() {
                let code = $(this).attr('code');
                course = courses[code][0];
                window.timetable.addCourse(course);
            }).end()
            .find('a.review').attr('href', 'http://feedback.nchusg.org/search/?q=' + course.title_short).end()
            .find('a.detail').attr('href', course.url).end()

        target.append(target, result);
    }

    clear() {
        $('.stufinite-searchbar-result-list').empty();
    }
}
