// TODO change instantiate logic for multiuser system

const config = require('./utils/config');
const fs = require('fs');

const etcdHost = config.get('etcdHost') || process.env.ETCD_HOST || '0.0.0.0';
const etcdPort = config.get('etcdPort') || process.env.ETCD_PORT || 4001;

const { Etcd3, GRPCUnavailableError } = require('etcd3');

const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "X-Etcd-Cluster-Id": "7e27652122e8b2ae",
    "X-Etcd-Index": 0,
    'X-Raft-Index': 0,
    'X-Raft-Term': 0
};

const etcd_opts = {
    host: `${etcdHost}:${etcdPort}`,
};

if (config.get('certAuth:enabled') || process.env.CERT_AUTH) {
    const caFile = config.get('certAuth:caFile') || process.env.ETCDCTL_CA_FILE;
    const keyFile = config.get('certAuth:keyFile') || process.env.ETCDCTL_KEY_FILE;
    const certFile = config.get('certAuth:certFile') || process.env.ETCDCTL_CERT_FILE;

    etcd_opts.credentials = {
        rootCertificate: fs.readFileSync(caFile),
        certChain: fs.readFileSync(certFile),
        privateKey: fs.readFileSync(keyFile),
    };
}

if (config.get('auth:enabled') || process.env.AUTH) {
    etcd_opts.auth = {
        username: config.get('auth:user') || process.env.AUTH_USER,
        password: config.get('auth:pass') || process.env.AUTH_PASS,
    };
}

const etcdClient = new Etcd3(etcd_opts);

/**
 * can throw any other GRPC... kind of error 
 * @param {object} param
 * @returns {Promise<{}|Error|GRPCUnavailableError>}
 */
async function getAll() {
    const nodes = [];
    for (let idx in await etcdClient.getAll().all()) {
        let key =  {
            "key": idx,
            "value": kvs[idx],
            "modifiedIndex": 0,
            "createdIndex": 0
        };
        nodes.push(key);
    }
    return res = {
        "action": "get",
        "node": {
            "key": "",
            "dir": true,
            "nodes": nodes
        }
    };
}

/**
 * can throw any other GRPC... kind of error 
 * @param {object} param
 * @param {string} param.key
 * @returns {Promise<{}|Error|GRPCUnavailableError>}
 */
async function get({ key }) {
    const val = await etcdClient.get(key).string();
    return res = {
        "action": "get",
        "node": {
            "key": key,
            "value": val,
            "modifiedIndex": 0,
            "createdIndex": 0
        }
    };
}

/**
 * can throw any other GRPC... kind of error 
 * @param {object} param
 * @param {string} param.key
 * @param {any} param.value
 * @returns {Promise<{}|Error|GRPCUnavailableError>}
 */
async function put({ key, val }) {
    const status = await etcdClient.put(key).value(val);
    return res = {
        "action": "set",
        "node": {
            "key": key,
            "value": val,
            "modifiedIndex": 0,
            "createdIndex": 0
        }
    };
}

/**
 * can throw any other GRPC... kind of error 
 * @param {object} param
 * @param {string} param.key
 * @returns {Promise<{}|Error|GRPCUnavailableError>}
 */
async function del({ key }) {
    const status = await etcdClient.delete().key(key);
    return {
        "action": "delete",
        "node": {
            "key": key
        },
        "prevNode": {
            "key": key
        }
    };
}

module.exports = {
    getAll: getAll,
    get: get,
    put: put,
    del: del
};