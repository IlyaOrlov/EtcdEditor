const conf = require('nconf');
const path = require('path');

conf.file({file: path.join(__dirname, '../config.json')});

conf.defaults(
    {
        'etcdHost': '127.0.0.1',
        'etcdPort': 2379,
        'serverPort': 8000,
        'publicDir': 'frontend',
        'auth': {
            'enabled': false,
            'user': '',
            'pass': '',
        },
        'certAuth': {
            'enabled': false,
            'caFile': '',
            'keyFile': '',
            'certFile': ''
        }
    }
);

module.exports = conf;
