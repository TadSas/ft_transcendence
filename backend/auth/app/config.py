import os

from collections import namedtuple

from configparser import ConfigParser


config = ConfigParser(interpolation=None)
config.read('/var/www/auth/config/config.ini', encoding='utf-8')

FTTRANSCENDENCE = namedtuple(
    'FT_TRANSCENDENCE',
    (
        'PROTOCOL',
        'DOMAIN',
    )
)(
    PROTOCOL=os.environ.get('AUTH_API_PROTOCOL'),
    DOMAIN=os.environ.get('AUTH_API_DOMAIN'),
)

FTAPI = namedtuple(
    'FT_API',
    (
        'AUTHORIZATION_URL',
        'CLIENT_ID',
        'CLIENT_SECRET',
    )
)(
    AUTHORIZATION_URL=os.environ.get('AUTH_API_URL'),
    CLIENT_ID=os.environ.get('AUTH_API_CLIENT_ID'),
    CLIENT_SECRET=os.environ.get('AUTH_API_CLIENT_SECRET'),
)
