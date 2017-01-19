from django.http import JsonResponse, HttpResponseRedirect, Http404, HttpResponse
from timetable.models import Department, Course, SelectedCourse


def build_department(school: str):
    Department.objects.all().delete()

    from cal import settings
    import json
    deptList = []
    with open(settings.STATICFILES_DIRS[0] + '/timetable/json/{}/Department.json'.format(school), 'r') as f:
        data = json.load(f)

        for dept_by_degree in data:
            for dept in dept_by_degree["department"]:
                print(dept_by_degree["degree"], dept[
                      "zh_TW"], dept["en_US"], dept["value"])
                deptList.append(
                    Department(
                        school=school,
                        degree=dept_by_degree["degree"],
                        code=dept["value"],
                        title="{},{}".format(dept["zh_TW"], dept["en_US"])
                    )
                )

        Department.objects.bulk_create(deptList)
        return JsonResponse({"state": "ok"})


def build_course(school: str, semester: str):
    Course.objects.all().delete()

    from cal import settings
    from os import listdir
    import json
    onlycourse = [x for x in listdir(settings.STATICFILES_DIRS[
                                     0] + '/timetable/json/{}/{}'.format(school.upper(), str(semester)))]
    CourseList = []
    CodeSet = set()

    for filename in onlycourse:
        with open(settings.STATICFILES_DIRS[0] + '/timetable/json/{}/{}/{}'.format(school.upper(), str(semester), filename), 'r') as f:
            data = json.loads(f)
            for c in data["course"]:
                try:
                    print(filename, c['code'], c['title'], c['professor'])

                    time = ''
                    for i in c['time_parsed']:
                        time += str(i['day']) + '-'
                        for j in i['time']:
                            time += str(j) + '-'
                        time = time[:-1]
                        time += ','

                    if c['code'] not in CodeSet:
                        CodeSet.add(c['code'])

                        CourseList.append( 
                            Course(
                                school=school.upper(),
                                semester=str(semester),
                                code=c['code'],
                                credits=c['credits'],
                                title='{},{}'.format(
                                    c['title_parsed']['zh_TW'],
                                    c['title_parsed']['en_US']
                                ),
                                department=c['department'],
                                professor=c['professor'],
                                time=time[:-1],
                                intern_location=c['intern_location'][0],
                                location=c['location'][0],
                                obligatory=c['obligatory_tf'],
                                language=c['language'],
                                prerequisite=c['prerequisite'],
                                note=c['note'],
                                discipline=c['discipline'],
                            )
                        )
                except Exception as e:
                    print(e)

    Course.objects.bulk_create(CourseList)
    return JsonResponse({"state": "ok"})