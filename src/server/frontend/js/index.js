const font = 'smaller';
const dataFont = '';
let config;
let wsProvider;
let provider;
let currentModel;
let currentModelParamNames;
let objects = [];

function fillSelector(config) {
	const selector = document.getElementById('model-select');
	config.models.forEach((m, index) => {
		const res = document.createElement('option');
		res.id = 'option' + index;
		res.value = m.name;
		res.innerHTML = m.name;
		res.onclick = chooseModel;
		selector.appendChild(res);
	});
	document.getElementById('option0').click();
}

function getModelParams(model) {
	const res = [];
	for (const prop in model.fields) {
		res.push(prop);
	}
	return res;
}

function getModelValues(model, object) {
	return currentModelParamNames.map(p => object[p]);
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
	currentModelParamNames.forEach((prop, index) => {
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

async function chooseModel(ev) {
	console.log('clicked', ev.target.value);
	// unsub
	const model = config.models.find(m => m.name === ev.target.value);
	if (!model) {
		return;
	}
	currentModel = model;
	currentModelParamNames = getModelParams(model);
	objects = [];

	if (document.getElementById('sub').innerText === 'unsub') {
		await subscribeModels();
	}

	const contents = document.getElementById('table-contents');
	dropAllChilds(contents);
	dropAllChilds(document.getElementById('table-data'));
	currentModelParamNames.forEach((prop, index) => {
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
		elem.onclick = openDialog.bind(null, 'item', index);
		elem.classList.add('row');
		currentModelParamNames.forEach((p, index) => {
			const property = document.createElement('div');
			property.classList.add('col', 'col'+ index);
			const value = o[p];
			property.innerText = value ? value : 'null';
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

function addButtons(elem, names, callbacks) {
	names.forEach((n, ind) => {
		const div = document.createElement('div');
		div.classList.add(names.length === 1 ? 'dialog-single-button' : 'dialog-two-button');
		div.innerText = n;
		div.onclick = callbacks[ind];
		elem.appendChild(div);
	})
}

function addFields(elem, names, values) {
	names.forEach((n, index) => {
		const div = document.createElement('div');
		div.classList.add('dialog-field');
		const fieldName = document.createElement('span');
		fieldName.innerText = n;
		const input = document.createElement('input');
		input.id = 'input-' + n;
		const typeName = currentModel.fields[n].typeName;
		switch (typeName) {
			case "Int":
				input.type = 'number';
				input.pattern = '\d+';
				break;
			case "Float":
				input.type = 'float';
				input.pattern = '[+-]?([0-9]*[.])?[0-9]+';
				break;
			case "DateTime":
				input.type = 'datetime-local';
				break;
			case 'String':
				input.type = 'text';
				break;
			case 'Boolean':
				input.type = 'checkbox';
				break;
		}
		if (values && values[index] !== null) {
			if (typeName === 'DateTime') {
				input.value = values[index].toISOString().slice(0,16);
			} else if (typeName === 'Boolean') {
				input.checked = values[index];
			} else {
				input.value = values[index];
			}
		}
		div.appendChild(fieldName);
		div.appendChild(input);
		if (!currentModel.fields[n].notNull) {
			const isNullName = document.createElement('span');
			isNullName.innerText = 'isNull';
			const isNull = document.createElement('input');
			isNull.id = 'input-' + n + '-null';
			isNull.type = 'checkbox';
			if (values && values[index] === null) {
				isNull.checked = true;
			}
			div.appendChild(isNullName);
			div.appendChild(isNull);
		}
		elem.appendChild(div);
	})
}

function openDialog(operation, index) {
	const elems = document.getElementsByClassName('dialog-background-back');
	for (let i = 0; i < elems.length; i++) {
		elems[i].classList.replace('dialog-background-back', 'dialog-background-front')
	}
	if (operation === 'insert') {
		addButtons(document.getElementById('dialog-control'), ['insert'], [insertModel]);
		addFields(document.getElementById('dialog-body'), currentModelParamNames);
	} else if (operation === 'delete') {
		addButtons(document.getElementById('dialog-control'), ['delete']);
	} else if (operation === 'item') {
		addButtons(document.getElementById('dialog-control'), ['update', 'delete'], [updateModel.bind(null, index), deleteModel.bind(null, index)]);
		addFields(document.getElementById('dialog-body'), currentModelParamNames, getModelValues(currentModel, objects[index]))
	} else if (operation === 'where') {
		addButtons(document.getElementById('dialog-control'), ['ok']);
	} else if (operation === 'sort') {
		addButtons(document.getElementById('dialog-control'), ['ok']);
	}
}

function closeDialog() {
	console.log('click back');
	const elems = document.getElementsByClassName('dialog-background-front');
	for (let i = 0; i < elems.length; i++) {
		elems[i].classList.replace('dialog-background-front', 'dialog-background-back')
	}
	dropAllChilds(document.getElementsByClassName('dialog-body')[0]);
	dropAllChilds(document.getElementsByClassName('dialog-control')[0]);
}

function handleDialog(event) {
	console.log('click dialog');
	event.stopPropagation();
}

async function getModels() {
	const res = await AllModels[currentModel.name].getModels(provider, currentModelParamNames);
	objects = res;
	reRender();
	objects.forEach((o, index) => {
		addRowAnimation(index);
	});
}

function getSets() {
	const values = [];
	let valid = true;
	currentModelParamNames.forEach((p) => {
		const input = document.getElementById('input-' + p);
		if (!input.checkValidity()) {
			valid = false;
			return;
		}
		let value;
		if (!currentModel.fields[p].notNull) {
			const isNull = document.getElementById('input-' + p + '-null');
			if (isNull.checked) {
				values.push(null);
				return;
			}
		}
		if (currentModel.fields[p].typeName !== 'String' && input.value === '') {
			valid = false;
			return;
		}
		switch (currentModel.fields[p].typeName) {
			case "Float":
				values.push(Number(input.value));
				break;
			case "Int":
				values.push(Number(input.value));
				break;
			case "DateTime":
				values.push(new Date(input.value));
				break;
			case "Boolean":
				values.push(input.checked);
				break;
			case "String":
				values.push(input.value);
				break;
		}
	});
	if (!valid) {
		return null;
	}
	return values;
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
