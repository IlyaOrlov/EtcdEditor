const config = require('./utils/config');
const fs = require('fs');
const { Etcd3, GRPCUnavailableError } = require('etcd3');

const etcdHost = config.get('etcdHost') || process.env.ETCD_HOST || '0.0.0.0';
const etcdPort = config.get('etcdPort') || process.env.ETCD_PORT || 4001;

const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "X-Etcd-Cluster-Id": "7e27652122e8b2ae",
    "X-Etcd-Index": 0,
    'X-Raft-Index': 0,
    'X-Raft-Term': 0
};

let etcdClient;

const etcd_opts = {
    hosts: `${etcdHost}:${etcdPort}`,
};

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

module.exports = ({credentials = null, auth = null, hosts = ''} = {}) => {

    if (credentials) {
        etcd_opts.credentials = credentials;
    }   
    
    if (auth) {
        etcd_opts.auth = auth;
    }
    
    etcdClient = new Etcd3(etcd_opts);
    
    return {
        getAll: getAll,
        get: get,
        put: put,
        del: del
    }

};