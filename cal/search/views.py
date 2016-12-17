from djangoApiDec.djangoApiDec import queryString_required
from django.http import JsonResponse
from .apps import SearchOb

# Create your views here.
@queryString_required(['keyword', 'school'])
def search(request):
	keyword = request.GET['keyword']
	school = request.GET['school']
	sob = SearchOb(keyword, school)
				
	return JsonResponse(sob.getResult(), safe=False)

def InvertedIndex(request):
	sob = SearchOb()
	sob.BuildIndex()
	return JsonResponse({"build Inverted index success":1}, safe=False)