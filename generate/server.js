const antiprism = require('antiprism');
const client = require('./client');
(async () => {
    const provider = await client.NewProvider('./config.json');
    new antiprism.HttpServer('/api/antiprism', provider);
})();