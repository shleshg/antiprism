const font = 'smaller';
let config;
let provider;
let currentModel;
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

function getModelProperty(model, index) {
	let i = 0;
	for (const prop in model.fields) {
		if (i === index) {
			return prop;
		}
		i++;
	}
	return null;
}

function getModelParams(model) {
	const res = [];
	for (const prop in model.fields) {
		res.push(prop);
	}
	return res;
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
	const objectsMax = objects.map(o => calcText(o[prop], font)).reduce((prev, current) => {
		return [Math.max(current[0], prev[0]), Math.max(current[1], prev[1])];
	}, [0, 0]);
	return [Math.max(max[0], objectsMax[0]), Math.max(max[1], objectsMax[1])];
}

function reCalcSize() {
	let index = 0;
	for (const prop in currentModel.fields) {
		const pixelMin = calcColumnMinWidth(prop, index);
		const elems = document.getElementsByClassName('col' + index);
		for (let i = 0; i < elems.length; i++) {
			const rel = [Math.round(elems[i].parentElement.clientHeight / 2), Math.round(elems[i].parentElement.clientWidth/20)];
			elems[i].style.height = Math.max(pixelMin[0], rel[0]) + 'px';
			elems[i].style.width = Math.max(pixelMin[1], rel[1]) + 'px';
		}
		index++;
	}
}

function dropAllChilds(tag) {
	while (tag.firstChild) {
		tag.removeChild(tag.lastChild);
	}
}

function chooseModel(ev) {
	console.log('clicked', ev.target.value);
	// unsub
	const model = config.models.find(m => m.name === ev.target.value);
	if (!model) {
		return;
	}
	currentModel = model;
	objects = [];

	const contents = document.getElementById('table-contents');
	dropAllChilds(contents);
	dropAllChilds(document.getElementById('table-data'));
	let index = 0;
	for (const prop in model.fields) {
		const content = document.createElement('div');
		content.classList.add('col', 'col' + index);
		content.style.fontSize = font;
		content.innerText = prop;
		contents.appendChild(content);
		index++;
	}
	reCalcSize();
}

function reRender() {
	const params = getModelParams(currentModel);
	const data = document.getElementById('table-data');
	dropAllChilds(data);
	objects.forEach(o => {
		const elem = document.createElement('div');
		elem.classList.add('row');
		params.forEach((p, index) => {
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

async function getModels() {
	const res = await AllModels[currentModel.name].getModels(provider, getModelParams(currentModel));
	objects = res;
	reRender();
}

async function insertModel() {

}

async function deleteModels() {

}

(async () => {
	config = await antiprism.fetchConfig('/config.json');
	fillSelector(config);
	provider = await NewProvider(config);
	console.log(provider);
	const inserted = await test.createModel(provider, 14, 88);
	console.log(inserted);
	const models = await test.getModels(provider, ['a', new antiprism.GetParameter(provider, 'b')]);
	console.log(models);
})();
