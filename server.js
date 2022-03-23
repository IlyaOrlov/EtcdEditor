const path = require('path');
const fs = require('fs');
const config = require('./utils/config');
const etcdApi = require('./etcd_api');
const express = require('express');
const bodyParser = require('body-parser');
const child_process = require('child_process');

require('./utils/validate_config')();

const serverPort = config.get('serverPort') || process.env.SERVER_PORT || 8000;
const publicDir = config.get('publicDir') || 'frontend';

const etcdHost = config.get('etcdHost') || process.env.ETCD_HOST || '0.0.0.0';
const etcdPort = config.get('etcdPort') || process.env.ETCD_PORT || 4001;

const auth_enabled = process.env.AUTH || config.get('auth:enabled') || false;
const certAuth_enabled = process.env.CCERT_AUTH || config.get('certAuth:enabled') || false;

const etcd_opts = (() => {

    const etcd_opts = {};
    etcd_opts.hosts = `${etcdHost}:${etcdPort}`;

    if (certAuth_enabled) {
        if (!etcd_opts.hosts.startsWith('https://')) {
            throw new Error('Etcd host must be under the https\'s protocol');
        }
        /* child_process.exec(`./etcd --name infra0 --data-dir infra0   --client-cert-auth --trusted-ca-file=cert_example/etcd-root-ca.pem 
                           --cert-file=cert_example/server.pem --key-file=cert_example/server-key.pem   --advertise-client-urls`, 
                           (error, stdout, stderr) => {
                                console.log(error, stdout, stderr);
                           });
        */
        const caFile = process.env.ETCDCTL_CA_FILE || config.get('certAuth:caFile');
        const keyFile = process.env.ETCDCTL_KEY_FILE || config.get('certAuth:keyFile');
        const certFile = process.env.ETCDCTL_CERT_FILE || config.get('certAuth:certFile'); // client certificate
    
        etcd_opts.credentials = {
            rootCertificate: fs.readFileSync(caFile),
            certChain: fs.readFileSync(certFile),
            privateKey: fs.readFileSync(keyFile),
        };
    } else if (auth_enabled) {
        /* child_process.exec('./etcd && ./etcdctl auth enable --user root --password root',
         (error, stdout, stderr) => {
             console.log(error, stdout, stderr);
         }); */
        etcd_opts.auth = {
            username: process.env.AUTH_USER || config.get('auth:user:name'),
            password: process.env.AUTH_PASS || config.get('auth:user:pass'),
        };
    } else {
        /* child_process.exec('./etcd && ./etcdctl auth disable --user root --password root',
         (error, stdout, stderr) => {
             console.log(error, stdout, stderr);
         }); */
    }

    return etcd_opts;
})();


const etcdClient = etcdApi({ ...etcd_opts });

const MIME_TYPES = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"
};

const app = express();

app.use(express.static(publicDir, {
    extensions: Object.keys(MIME_TYPES),
}));

app.use(express.static(path.join(__dirname, 'frontend-react', 'build')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'frontend-react', 'build', 'index.html'));
});

app.put(/api\/v2\/keys\/([a-zA-Z0-9_]+)/, async (request, response) => {
    try {
        const { 0: key } = request.params;
        response.status(200).send(
            await etcdClient.put({ key: key, val: JSON.stringify(request.body.value) })
        );
    } catch (e) {
        console.error(e);
        response.status(500).send('Error while processing request');
    }
});

app.delete(/api\/v2\/keys\/([a-zA-Z0-9_]+)\/?/, async (request, response) => {
    try {
        const { 0: key } = request.params;
        response.status(200).send(await etcdClient.del({ key: key }));
    } catch (e) {
        console.error(e);
        response.status(500).send('Error while processing request');
    }
});
app.get(/api\/v2\/keys\/?/, async (request, response) => {
    try {
        response.status(200).send(await etcdClient.getAll());
    } catch (e) {
        console.error(e);
        response.status(500).send('Error while processing request');
    };
});

app.listen(serverPort, () => {
    console.log(`proxy /api requests to etcd on ${etcdHost}:${etcdPort}`);
    console.log(`etc_viewer listening on port ${serverPort}`);
});

