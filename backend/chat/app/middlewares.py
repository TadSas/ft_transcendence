import zoneinfo

from django.utils import timezone


class TimezoneMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            if tzname := request.COOKIES.get("ft_timezone"):
                timezone.activate(zoneinfo.ZoneInfo(tzname))
            else:
                timezone.deactivate()
        except Exception:
            timezone.deactivate()

        return self.get_response(request)