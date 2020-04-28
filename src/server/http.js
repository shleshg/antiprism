const express = require('express');

class HttpServer {
	constructor(url, provider) {
		this.url = url;
		this.app = express();
		// this.app = require('express-ws')(this.app);
		this.app.use(express.json());
		this.app.use(express.static('frontend'));
		// this.app.ws('/connect', async (ws, req) => {
		//
		// });
		this.app.post(this.url, async (req, res) => {
			const body = req.body;
			console.log(body);
			const method = body.method;
			const resp = {
				method: method,
				id: body.id,
				result: null,
				error: null
			};
			if (method === 'insert') {
				resp.result = await provider.insertModel(body.data.model, body.data.sets);
			} else if (method === 'get') {
				resp.result = await provider.getModels(body.data.model, body.data.fields, body.data.where, body.data.group, body.data.sort);
			} else if (method === 'update') {
				resp.result = await provider.updateModels(body.data.model, body.data.sets, body.data.where);
			} else if (method === 'delete') {
				resp.result = await provider.deleteModels(body.data.model, body.data.where);
			} else if (method === 'ping') {
				resp.result = 'pong';
			} else {
				resp.error = {
					code: 400,
					message: 'unknown method'
				}
			}
			console.log(resp);
			res.status(200).json(resp);
		});
		this.app.listen(8030);
	}
}

module.exports = HttpServer;