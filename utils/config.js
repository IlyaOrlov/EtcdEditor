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
            'user' : {
                'name': 'root', 
                'pass': 'root',
            }   
        },
        'certAuth': {
            'enabled': false,
            'caFile': path.join(__dirname, '..', 'cert_example', 'etcd-root-ca.pem'),
            'keyFile': path.join(__dirname, '..', 'cert_example', 'client-key.pem'),
            'certFile': path.join(__dirname, '..', 'cert_example', 'client.pem')
        }
    }
);

module.exports = conf;
