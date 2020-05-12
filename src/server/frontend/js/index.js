const font = 'smaller';
const dataFont = '';
let config;
let wsProvider;
let provider;
let currentModel;
let currentModelParamNames = [];
let objects = [];
let fieldParams = [];
let whereParam = null;
let groupParams = [];
let sortParams = [];
let isTableTmp = false;
let tmpParamNames = [];

function fillSelector(config) {
	const selector = document.getElementById('model-select');
	config.models.forEach((m, index) => {
		const res = document.createElement('option');
		res.id = 'option-' + index;
		res.value = m.name;
		res.innerHTML = m.name;
		selector.appendChild(res);
	});
	chooseModel();
}

function getModelParams(model) {
	const res = [];
	for (const prop in model.fields) {
		res.push(prop);
	}
	return res;
}

function getModelValues(model, object) {
	if (tmpParamNames.length !== 0) {
		return tmpParamNames.map(p => object[p]);
	} else {
		return currentModelParamNames.map(p => object[p]);
	}
}

function calcText(text, fontSize) {
	const test = document.getElementById('Test');
	test.style.fontSize = fontSize;
	test.innerText = text;
	return [
		test.clientHeight + 1,
		test.clientWidth + 1
	]
}

function calcColumnMinWidth(prop, index) {
	let max = calcText(prop, font);
	const objectsMax = objects.map(o => calcText(o[prop] === null ? 'null' : o[prop].toString(), dataFont)).reduce((prev, current) => {
		return [Math.max(current[0], prev[0]), Math.max(current[1], prev[1])];
	}, [0, 0]);
	return [Math.max(max[0], objectsMax[0]), Math.max(max[1], objectsMax[1])];
}

function reCalcSize() {
	let params = currentModelParamNames;
	if (tmpParamNames.length !== 0) {
		params = tmpParamNames;
	}
	params.forEach((prop, index) => {
		const pixelMin = calcColumnMinWidth(prop, index);
		const elems = document.getElementsByClassName('col' + index);
		for (let i = 0; i < elems.length; i++) {
			const rel = [Math.round(elems[i].parentElement.clientHeight / 2), Math.round(elems[i].parentElement.clientWidth/20)];
			elems[i].style.height = Math.max(pixelMin[0], rel[0]) + 'px';
			elems[i].style.width = Math.max(pixelMin[1], rel[1]) + 'px';
		}
	});
}

function dropAllChilds(tag) {
	while (tag.firstChild) {
		tag.removeChild(tag.lastChild);
	}
}

async function chooseModel() {
	const value = document.getElementById('model-select').value;
	// unsub
	const model = config.models.find(m => m.name === value);
	if (!model) {
		return;
	}
	currentModel = model;
	currentModelParamNames = getModelParams(model);
	objects = [];
	await setModelHeader(currentModelParamNames);
}

async function setModelHeader(params) {
	if (document.getElementById('sub').innerText === 'unsub') {
		await subscribeModels();
	}
	const contents = document.getElementById('table-contents');
	dropAllChilds(contents);
	dropAllChilds(document.getElementById('table-data'));
	params.forEach((prop, index) => {
		const content = document.createElement('div');
		content.classList.add('col', 'col' + index);
		content.style.fontSize = font;
		content.innerText = prop;
		contents.appendChild(content);
	});
	reCalcSize();
}

function reRender() {
	const data = document.getElementById('table-data');
	dropAllChilds(data);
	objects.forEach((o, index) => {
		const elem = document.createElement('div');
		elem.id = 'row' + index;
		if (!isTableTmp) {
			elem.onclick = openDialog.bind(null, 'item', index);
		}
		elem.classList.add('row');
		let params = currentModelParamNames;
		if (tmpParamNames.length !== 0) {
			params = tmpParamNames;
		}
		params.forEach((p, index) => {
			const property = document.createElement('div');
			property.classList.add('col', 'col'+ index);
			const value = o[p];
			property.innerText = value !== null ? value : 'null';
			elem.appendChild(property);
		});
		data.appendChild(elem);
	});
	reCalcSize();
}

function addRowAnimation(index) {
	const row = document.getElementById('row' + index);
	row.classList.add('row-enter');
}

function updateRowAnimation(index) {
	const row = document.getElementById('row' + index);
	row.classList.remove('row-update');
	row.classList.add('row-update');
}

function deleteRowAnimation(index) {
	const row = document.getElementById('row' + index);
	row.classList.add('row-delete');
}

async function getModels() {
	getFieldsParam();
	isTableTmp = fieldParams.reduce((prev, current) => prev || current.as, false);
	const noTmp = fieldParams.length === currentModelParamNames.length &&
		fieldParams.reduce((prev, current, index) => prev && (!current.operation && !current.as && current.name === currentModelParamNames[index]), true);
	if (isTableTmp || !noTmp) {
		isTableTmp = true;
	} else {
		tmpParamNames = [];
		isTableTmp = false;
	}
	if (isTableTmp) {
		objects = await provider.getModels(currentModel.name, fieldParams, whereParam, groupParams, sortParams);
		await setModelHeader(tmpParamNames);
	} else {
		objects = await AllModels[currentModel.name].getModels(provider, fieldParams, whereParam, groupParams, sortParams);
		await setModelHeader(currentModelParamNames);
	}
	closeDialog();
	reRender();
	objects.forEach((o, index) => {
		addRowAnimation(index);
	});
}

async function insertModel() {
	const values = getSets();
	console.log(values);
	if (values === null) {
		// error validation message
		return ;
	}
	const res = await AllModels[currentModel.name].createModel(provider, ...values);
	const ind = objects.push(res) - 1;
	closeDialog();
	reRender();
	addRowAnimation(ind);
}

async function updateModel(index) {
	const values = getSets();
	console.log(values);
	if (values === null) {
		// error validation message
		return ;
	}
	const sets = currentModelParamNames.map((p, index) => {
		return new antiprism.SetParameter(provider, p, values[index]);
	});
	await objects[index].update(sets);
	closeDialog();
	applyUpdate({
		data: {
			sets: sets,
			where: objects[index].identWhereParams()
		}
	});
}

async function deleteModel(index) {
	await objects[index].delete();
	closeDialog();
	applyDelete({
		data: {
			where: objects[index].identWhereParams()
		}
	})
}

async function load() {
	config = await antiprism.fetchConfig('/config.json');
	fillSelector(config);
	provider = await NewHttpProvider(config);
	wsProvider = await NewWsProvider(config);
	console.log(provider);
}
