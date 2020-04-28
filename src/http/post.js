let httpId = 0;

module.exports = async function (url, method, data) {
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
	await response.json();
};