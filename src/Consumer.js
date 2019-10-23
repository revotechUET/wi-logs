//CONFIG
const amqp = require('amqplib');
const CONFIG_HEART_BEAT = 30;
const WI_LOG_CHANNEL_DEFAULT = 'wi_backend_log';
const DEFAULT_HOST = 'localhost';
const DEFAULT_PORT = 5672;
const DEFAULT_USERNAME = 'test_comsumer';
const DEFAULT_PASSWORD = '123456';

class Consumer {
    constructor(config, callback) {
        this.queueChannel = WI_LOG_CHANNEL_DEFAULT;
        this.queue = [];
        this.config = config || {};
        if (this.config.queue) {
            this.queueChannel = this.config.queue
        }
        //callback must be a promise :))
        this.callback = callback;
        this.connection = null;
        this.channel = null;
        this.init();
    }

    initConnection() {
        return new Promise((resolve, reject)=>{
            amqp.connect({
                hostname: this.config.host || DEFAULT_HOST,
                port: this.config.port || DEFAULT_PORT,
                heartbeat: CONFIG_HEART_BEAT,
                username: this.config.username || DEFAULT_USERNAME,
                password: this.config.password || DEFAULT_PASSWORD
            }).then(conn=>{
                //process.once('SIGINT', conn.close.bind(conn));
                //set up listener

                conn.on('close', ()=>{
                    this.closeThenInitConnection();
                });
                conn.on('error', ()=>{
                    this.closeThenInitConnection();
                });
                
                //resolve
                resolve(conn);
            }).catch(e => {
                reject(e);
            });
        });
    }

    closeThenInitConnection() {
        this.connection.close();
        this.channel.close();
        this.init();
    }

    closeThenInitChannel() {
        this.channel.close();
        this.initChannel()
        .then((channel)=>{
            this.channel = channel;
        })
        .catch(e=>{
            console.log(e.message);
        })
    }

    init() {
        this.initConnection()
        .then((conn)=>{
            this.connection = conn;
            this.initChannel()
            .then((channel)=>{
                this.channel = channel;
            })
            .catch(e=>{
                console.log(e.message);
            });
        })
        .catch(e=>{
            console.log(e.message);
        });
    }

    initChannel() {
        return new Promise((resolve, reject)=>{
            this.connection.createChannel()
            .then((channel)=>{
                //handle
                channel.on('error', ()=>{
                    this.closeThenInitChannel();
                });
                channel.on('close', () => {
                    this.closeThenInitChannel();
                });

                channel.assertQueue(this.queueChannel, {
                    durable: true
                }).then((ok)=>{
                    channel.consume(this.queueChannel, (msg)=>{
                        if (msg) {
                            this.callback(msg)
                            .then((result)=>{
                                channel.ack(msg);
                            })
                            .catch((e)=>{
                                console.log(e.message);
                            });
                        }
                    });
                })
                .catch(e=>{
                    this.closeThenInitChannel();
                    reject(e);
                })
                //resolve
                resolve(channel);
            })
            .catch(e=>{
                reject(e);
            });
        });
    }
}

module.exports = Consumer;