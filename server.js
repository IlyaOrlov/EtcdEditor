const path = require('path');
const fs = require('fs');
const config = require('./utils/config');
const etcdApi = require('./etcd_api');
const express = require('express');
const bodyParser = require('body-parser');

require('./utils/validate_config')();

const serverPort = config.get('serverPort') || process.env.SERVER_PORT || 8000;
const publicDir = config.get('publicDir') || 'frontend';

const etcdHost = config.get('etcdHost') || process.env.ETCD_HOST || '0.0.0.0';
const etcdPort = config.get('etcdPort') || process.env.ETCD_PORT || 4001;

const auth_enabled = config.get('auth:enabled') || process.env.AUTH || false;
const certAuth_enabled = config.get('certAuth:enabled') || process.env.CCERT_AUTH || false;

const etcd_opts = (() => {

    etcd_opts.hosts = `${etcdHost}:${etcdPort}`;

    if (auth_enabled) {
        etcd_opts.auth = {
            username: client_request.auth.user,
            password: client_request.auth.password,
        };
    }

    if (certAuth_enabled) {

        const caFile = config.get('certAuth:caFile') || process.env.ETCDCTL_CA_FILE;
        const keyFile = config.get('certAuth:keyFile') || process.env.ETCDCTL_KEY_FILE;
        const certFile = config.get('certAuth:certFile') || process.env.ETCDCTL_CERT_FILE; // client certificate
    
        etcd_opts.credentials = {
            rootCertificate: fs.readFileSync(caFile),
            certChain: certFile,
            privateKey: fs.readFileSync(keyFile),
        };
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
        const res = await etcdClient.put({ key: key, val: JSON.stringify(request.body.value) });
        response.status(200).send(res);
    } catch (e) {
        console.error(e);
        response.status(500).send('Error while processing request');
    }
});

app.delete(/api\/v2\/keys\/([a-zA-Z0-9_]+)\/?/, async (request, response) => {
    try {
        const { 0: key } = request.params;
        const res = await etcdClient.del({ key: key });
        response.status(200).send(res);
    } catch (e) {
        console.error(e);
        response.status(500).send('Error while processing request');
    }
});
app.post(/\/api\/v2\/keys\/?/, async (request, response) => {
    console.log(request.body);
    try {
        const res = await etcdClient.getAll();
        response.status(200).send(res);
    } catch (e) {
        console.error(e);
        response.status(500).send('Error while processing request');
    };
});

app.listen(serverPort, () => {
    console.log(`proxy /api requests to etcd on ${etcdHost}:${etcdPort}`);
    console.log(`etc_viewer listening on port ${serverPort}`);
});

