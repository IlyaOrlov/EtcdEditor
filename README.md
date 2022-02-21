
# EtcdEditor

## To build and run locally
 * [Download](https://github.com/etcd-io/etcd/releases/) and run ETCD server
 * Run **npm i** and **npm run build** in /frontend-react
 * Run **server.js** and follow http://localhost:8000
 
## Inspirers
[http://henszey.github.io/etcd-browser/](http://henszey.github.io/etcd-browser/)
[https://github.com/josdejong/jsoneditor](https://github.com/josdejong/jsoneditor)

### Configuration
You can configure the builtin server using environment variables:
 * AUTH: boolean. enable, disable basic auth
 * AUTH_USER: Username for http basic auth (skip to disable auth)
 * AUTH_PASS: Password for http basic auth
 * ETCD_HOST: IP of the etcd host the internal proxy should use [172.17.42.1]
 * ETCD_PORT: Port of the etcd daemon [4001]
 * SERVER_PORT: Port of builtin server
 
If you use a secured etcd:
 * CERTH_AUTH: Boolean. enable, disable authorization by certs
 * ETCDCTL_CA_FILE
 * ETCDCTL_KEY_FILE
 * ETCDCTL_CERT_FILE

 ### ETCD CERT SETUP
 http://play.etcd.io/install
 https://github.com/coreos/docs/blob/master/os/generate-self-signed-certificates.md

# ETCD RUN 
 ./etcd --name infra0 --data-dir infra0   --client-cert-auth --trusted-ca-file=cert_example/etcd-root-ca.pem --cert-file=cert_example/server.pem --key-file=cert_example/server-key.pem   --advertise-client-urls https://127.0.0.1:2379 --listen-client-urls https://127.0.0.1:2379