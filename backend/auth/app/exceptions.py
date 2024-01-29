from rest_framework.response import Response
from rest_framework.views import exception_handler


class AuthException(Exception):
    def __init__(self, message, errors = ''):
        super().__init__(message)

        self.errors = errors


def auth_exception_handler(exc: Exception, context: None) -> Response:
    """ Cusutom exception handler to catch and return appropriate error type

    Parameters
    ----------
    exc : Exception
    context : None

    Returns
    -------
    Response

    """
    response = exception_handler(exc, context)

    if response.status_code == 403:
        authenticated = str(response.data['authenticated'])

        try:
            response.data['authenticated'] = eval(authenticated)
        except SyntaxError:
            response.data['authenticated'] = authenticated

    return response
