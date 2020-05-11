let subId;

async function subscribeModels() {
	const element = document.getElementById('sub');
	if (element.innerText === 'sub') {
		// sub
		subId = await wsProvider.subscribeModels(currentModel.name, onMessage);
	} else {
		// unsub
		await wsProvider.unsubscribeModels(currentModel.name, subId)
	}
	element.innerText = element.innerText === 'sub' ? 'unsub' : 'sub';
}

function onMessage(msg) {
	console.log('receive msg', msg);
	if (msg.data.method === 'insert') {
		applyInsert(msg.data);
	} else if (msg.data.method === 'update') {
		applyUpdate(msg.data);
	} else if (msg.data.method === 'delete') {
		applyDelete(msg.data);
	} else {
		console.log('on sub unknown method', msg);
	}
}

function applyInsert(data) {
	const args = currentModelParamNames.map(p => {
		const res = data.data.sets.find(f => f.name === p);
		if (res === undefined) {
			return null;
		}
		return res;
	});
	const newModel = new AllModels[currentModel.name](provider, ...args);
	const ind = objects.push(newModel) - 1;
	reRender();
	addRowAnimation(ind);
}

function applyUpdate(data) {
	const toUpdate = objects.map((o, index) => {
		const ok = calcWhereOnObject(o, data.data.where);
		if (ok) {
			o.applySets(data.data.sets);
			return index;
		}
		return null;
	}).reduce((prev, current) => current === null ? prev : prev.concat([current]), []);
	reRender();
	toUpdate.forEach(t => {
		updateRowAnimation(t);
	});
	console.log('update data');
}

function applyDelete(data) {
	console.log('delete data');
	const filtered = objects.filter((o, index) => {
		const ok = calcWhereOnObject(o, data.data.where);
		if (ok) {
			deleteRowAnimation(index);
		}
		return !ok;
	});
	setTimeout(() => {
		objects = filtered;
		reRender();
	}, 600)
}

function getArgValue(o, arg) {
	if (arg.type === 'Literal') {
		return arg.value;
	} else if (arg.type === 'Field') {
		return o[arg.value];
	} else {
		return calcWhereOnObject(o, arg);
	}
}

function calcWhereOnObject(o, where) {
	if (!where) {
		return true;
	}
	if (where.opType === 'unary') {
		return !(getArgValue(o, where.args[0]));
	} else {
		const arg1 = getArgValue(o, where.args[0]);
		const arg2 = getArgValue(o, where.args[1]);
		switch (where.op) {
			case '==':
				return arg1 === arg2;
			case '>=':
				return arg1 >= arg2;
			case '<=':
				return arg1 <= arg2;
			case '>':
				return arg1 > arg2;
			case '<':
				return arg1 < arg2;
			case '&&':
				return arg1 && arg2;
			case '||':
				return arg1 || arg2;
			case '!=':
				return arg1 !== arg2;
		}
	}
}