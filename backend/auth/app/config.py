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
    PROTOCOL=config.get('ft-transcendence', 'protocol'),
    DOMAIN=config.get('ft-transcendence', 'domain'),
)

FTAPI = namedtuple(
    'FT_API',
    (
        'AUTHORIZATION_URL',
        'CLIENT_ID',
        'CLIENT_SECRET',
    )
)(
    AUTHORIZATION_URL=config.get('ft-api', 'authorization-url'),
    CLIENT_ID=os.environ.get('AUTH_API_CLIENT_ID'),
    CLIENT_SECRET=os.environ.get('AUTH_API_CLIENT_SECRET'),
)