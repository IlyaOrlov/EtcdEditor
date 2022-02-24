const url = require('url');
const path = require('path');
const fs = require('fs');
const http = require('http');
const config = require('./utils/config');
const etcdApi = require('./etcd_api');
const express = require('express');
const bodyParser = require('body-parser');
const basicAuth = require('express-basic-auth');

require('./utils/validate_config')();

const etcdHost = config.get('etcdHost') || process.env.ETCD_HOST || '0.0.0.0';
const etcdPort = config.get('etcdPort') || process.env.ETCD_PORT || 4001;

const serverPort = config.get('serverPort') || process.env.SERVER_PORT || 8000;

const publicDir = config.get('publicDir') || 'frontend';

const etcd_opts = {};

const auth_enabled = config.get('auth:enabled') || process.env.AUTH || false;
const certAuth_enabled = config.get('certAuth:enabled') || process.env.CCERT_AUTH || false;

// Single user or Multiuser?
if (certAuth_enabled) {
    const caFile = config.get('certAuth:caFile') || process.env.ETCDCTL_CA_FILE;
    const keyFile = config.get('certAuth:keyFile') || process.env.ETCDCTL_KEY_FILE;
    const certFile = config.get('certAuth:certFile') || process.env.ETCDCTL_CERT_FILE;

    etcd_opts.credentials = {
        rootCertificate: fs.readFileSync(caFile),
        certChain: fs.readFileSync(certFile),
        privateKey: fs.readFileSync(keyFile),
    };
}

const buildEtcdOptsByConfig = ({ client_params, etcd_opts = {} }) => {

    if (auth_enabled) {
        etcd_opts.auth = {
            username: client_params?.user,
            password: client_params?.password,
        };
    }

    if (certAuth_enabled) {
        etcd_opts.credentials = {

        }
    }

    console.log(etcd_opts);

    return etcd_opts;
};

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

// Basic authorization middleware
if (auth_enabled) {

    app.use(basicAuth({
        users: config.get('auth:users')
    }));

}

app.use(express.static(path.join(__dirname, 'frontend-react', 'build')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'frontend-react', 'build', 'index.html'));
});

app.get('/api\/v2/keys', async (request, response) => {
    try {
        const etcd_opts = buildEtcdOptsByConfig({ client_params: { ...request.body, ...request.auth } });
        const res = await etcdApi({ ...etcd_opts }).getAll();
        response.status(200).send(res);
    } catch (e) {
        console.error(e);
        response.status(500).send('Error while processing request');
    }
});

app.put(/api\/v2\/keys\/([a-zA-Z0-9_]+)/, async (request, response) => {
    try {
        const { 0: key } = request.params;
        const res = await etcdApi.put({ key: key, val: JSON.stringify(request.body.value) });
        response.status(200).send(res);
    } catch (e) {
        console.error(e);
        response.status(500).send('Error while processing request');
    }
});

app.delete(/api\/v2\/keys\/([a-zA-Z0-9_]+)/, async (request, response) => {
    try {
        const { 0: key } = request.params;
        const res = await etcdApi(etcd_opts).del({ key: key });
        response.status(200).send(res);
    } catch (e) {
        console.error(e);
        response.status(500).send('Error while processing request');
    }
});

app.listen(serverPort, () => {
    console.log(`proxy /api requests to etcd on ${etcdHost}:${etcdPort}`);
    console.log(`etc_viewer listening on port ${serverPort}`);
});

