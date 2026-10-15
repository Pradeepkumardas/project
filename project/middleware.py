"""Cache-busting middleware: never let the browser cache pages.

Stops stale HTML (e.g. login page, old script.js references) from being
served from the browser cache during development.
"""


class NoCacheMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        response["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response["Pragma"] = "no-cache"
        response["Expires"] = "0"
        return response
