let httpId = 0;

async function fetchConfig(path) {
	const resp = await fetch(path);
	return await resp.json();
}

async function PostData(url, method, data) {
	const requestId = ++httpId;
	const response = await fetch(url, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		credentials: 'omit',
		headers: {
			'Content-Type': 'application/json'
		},
		redirect: 'follow',
		body: JSON.stringify({
			method: method,
			id: requestId,
			data: data
		})
	});
	return response.json();
}

module.exports.PostData = PostData;
module.exports.fetchConfig = fetchConfig;