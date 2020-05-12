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
		if (currentModel.fields[n].default !== undefined) {
			const isDefaultName = document.createElement('span');
			isDefaultName.innerText = 'isDefault';
			const isDefault = document.createElement('input');
			isDefault.id = 'input-' + n + '-default';
			isDefault.type = 'checkbox';
			div.appendChild(isDefaultName);
			div.appendChild(isDefault);
		}
		elem.appendChild(div);
	})
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
		if (!currentModel.fields[p].notNull) {
			const isNull = document.getElementById('input-' + p + '-null');
			if (isNull.checked) {
				values.push(null);
				return;
			}
		}
		if (currentModel.fields[p].default !== undefined) {
			const isDefault = document.getElementById('input-' + p + '-default');
			if (isDefault.checked) {
				values.push({isDefault: true});
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

function addPlusButton(elem, callback) {
	const div = document.createElement('div');
	div.classList.add('dialog-field');
	div.classList.add('dialog-plus');
	div.innerText = '+';
	div.id = 'dialog-plus';
	div.onclick = callback;
	elem.appendChild(div);
}

function dropDialogChild(index) {
	console.log('dropping ', index);
	const dialog = document.getElementById('dialog-body');
	const toDrop = document.getElementById('dialog-field-' + index);
	dialog.removeChild(toDrop);
	reNumerateDialogElements(index);
}

function reNumerateDialogElements() {
	const dialog = document.getElementById('dialog-body');
	for (let i = 0; i < dialog.children.length - 1; i++) {
		const elem = dialog.children[i];
		elem.id = 'dialog-field-' + i;
		elem.lastChild.onclick = dropDialogChild.bind(null, i);
	}
	dialog.children
}

function addGroupParameter() {
	const dialog = document.getElementById('dialog-body');
	const div = document.createElement('div');
	div.classList.add('dialog-field');
	div.id = 'dialog-field-' + dialog.children.length;
	// input
	const select = document.createElement('select');
	const options = currentModelParamNames.map(p => {
		const opt = document.createElement('option');
		opt.value = p;
		opt.innerHTML = p;
		return opt;
	});
	options.forEach(o => {
		select.appendChild(o);
	});
	// delete
	const drop = document.createElement('div');
	drop.classList.add('dialog-plus');
	drop.innerText = 'drop param';
	drop.onclick = dropDialogChild.bind(this, dialog.children.length);
	div.appendChild(select);
	div.appendChild(drop);
	dialog.insertBefore(div, document.getElementById('dialog-plus'));
}

function getGroupParams() {
	const res = [];
	const dialog = document.getElementById('dialog-body');
	let valid = true;
	for (let i = 0; i < dialog.children.length - 1; i++) {
		const elem = dialog.children[i];
		const value = elem.children[0].value;
		if (!value) {
			valid = false;
			return;
		}
		res.push(new antiprism.GroupingParameter(provider, value));
	}
	if (!valid) {
		return;
	}
	groupParams = res;
	closeDialog();
}

function addSortParameter() {
	const dialog = document.getElementById('dialog-body');
	const div = document.createElement('div');
	div.classList.add('dialog-field');
	div.id = 'dialog-field-' + dialog.children.length;
	// input
	const select = document.createElement('select');
	const options = currentModelParamNames.map(p => {
		const opt = document.createElement('option');
		opt.value = p;
		opt.innerHTML = p;
		return opt;
	});
	options.forEach(o => {
		select.appendChild(o);
	});
	// delete
	const sortType = document.createElement('select');
	const asc = document.createElement('option');
	asc.value = 'asc';
	asc.innerHTML = 'asc';
	const desc = document.createElement('option');
	desc.value = 'desc';
	desc.innerHTML = 'desc';
	sortType.appendChild(asc);
	sortType.appendChild(desc);
	const drop = document.createElement('div');
	drop.classList.add('dialog-plus');
	drop.innerText = 'drop param';
	drop.onclick = dropDialogChild.bind(this, dialog.children.length);
	div.appendChild(select);
	div.appendChild(sortType);
	div.appendChild(drop);
	dialog.insertBefore(div, document.getElementById('dialog-plus'));
}

function getSortParams() {
	const res = [];
	const dialog = document.getElementById('dialog-body');
	let valid = true;
	for (let i = 0; i < dialog.children.length - 1; i++) {
		const elem = dialog.children[i];
		const value = elem.children[0].value;
		if (!value) {
			valid = false;
			return;
		}
		const sortType = elem.children[1].value;
		if (!sortType) {
			res.push(new antiprism.SortParameter(provider, value));
		} else {
			res.push(new antiprism.SortParameter(provider, value, sortType));
		}
	}
	if (!valid) {
		return;
	}
	sortParams = res;
	closeDialog();
}

function dropWhereParameter() {
	dropAllChilds(document.getElementById('dialog-body'));
	addPlusButton(document.getElementById('dialog-body'), addWhereParameter);
}

function whereArgument(id) {
	const div = document.createElement('div');
	div.id = id;
	div.classList.add('dialog-field');
	const typeSelector = document.createElement('select');
	typeSelector.id = 'type-' + id;
	typeSelector.onchange = () => {
		const selectorValue = document.getElementById('type-' + id).value;
		if (selectorValue === 'Literal') {
			const div = document.getElementById(id);
			if (div.children.length === 2) {
				div.removeChild(div.lastChild);
			}
			const input = document.createElement('input');
			div.appendChild(input);
		} else {
			const div = document.getElementById(id);
			if (div.children.length === 2) {
				div.removeChild(div.lastChild);
			}
			const selector = document.createElement('select');
			currentModelParamNames.forEach(p => {
				const opt = document.createElement('option');
				opt.value = p;
				opt.innerHTML = p;
				selector.appendChild(opt);
			});
			div.appendChild(selector);
		}
	};
	const opt = document.createElement('option');
	opt.value = 'Literal';
	opt.innerHTML = 'Literal';

	const fieldOpt = document.createElement('option');
	fieldOpt.value = 'Field';
	fieldOpt.innerHTML = 'Field';

	typeSelector.appendChild(opt);
	typeSelector.appendChild(fieldOpt);
	div.appendChild(typeSelector);
	return div;
}

function setUnaryWhere() {
	console.log('set unary');
	const elem = document.getElementById('where-insert');
	if (elem.children[1].children.length === 2) {
		return;
	} else {
		if (elem.children.length === 3) {
			elem.removeChild(elem.children[1]);
		}
	}
	const div = document.createElement('div');
	const opSelector = document.createElement('select');
	const opt = document.createElement('option');
	opt.value = '!';
	opt.innerHTML = '!';
	opSelector.appendChild(opt);
	div.appendChild(opSelector);
	div.appendChild(whereArgument('arg-1'));
	elem.insertBefore(div, elem.lastChild);
}

function setBinaryWhere() {
	console.log('set binary');
	const elem = document.getElementById('where-insert');
	if (elem.children[1].children.length === 3) {
		return;
	} else {
		if (elem.children.length === 3) {
			elem.removeChild(elem.children[1]);
		}
	}
	const div = document.createElement('div');
	const opSelector = document.createElement('select');
	['==', '!=', '<=', '>=', '>', '<', '&&', '||'].forEach(p => {
		const opt = document.createElement('option');
		opt.value = p;
		opt.innerHTML = p;
		opSelector.appendChild(opt);
	});
	div.appendChild(whereArgument('arg-1'));
	div.appendChild(opSelector);
	div.appendChild(whereArgument('arg-2'));
	elem.insertBefore(div, elem.lastChild);
}

function addWhereParameter() {
	dropAllChilds(document.getElementById('dialog-body'));
	const dialog = document.getElementById('dialog-body');
	const div = document.createElement('div');
	const selector = document.createElement('select');
	const unaryOpt = document.createElement('option');
	unaryOpt.id = 'opt-unary';
	unaryOpt.value = 'unary';
	unaryOpt.innerHTML = 'unary';
	const binaryOpt = document.createElement('option');
	binaryOpt.id = 'opt-binary';
	binaryOpt.value = 'binary';
	binaryOpt.innerHTML = 'binary';
	selector.onchange = () => {
		console.log(document.getElementById('where-insert').children[0].value);
		if (document.getElementById('where-insert').children[0].value === 'unary') {
			setUnaryWhere();
		} else {
			setBinaryWhere();
		}
	};
	selector.appendChild(unaryOpt);
	selector.appendChild(binaryOpt);
	div.appendChild(selector);
	div.id = 'where-insert';
	const drop = document.createElement('div');
	drop.innerText = 'drop';
	drop.classList.add('dialog-plus');
	drop.onclick = dropWhereParameter;
	div.appendChild(drop);
	dialog.appendChild(div);
}

function getWhereArgValue(id) {
	const arg = document.getElementById(id);
	if (!arg.children[0].value) {
		return null;
	}
	return {
		type: arg.children[0].value,
		value: arg.children[1].value
	};
}


function getWhereParam() {
	const param = document.getElementById('where-insert');
	let valid = true;
	let res;
	if (!param) {
		whereParam = null;
		return;
	}
	const whereValue = param.children[1];
	if (whereValue.children.length === 0) {
		valid = false;
	} else {
		if (param.children[0].value === 'unary') {
			if (!whereValue.children[0].value) {
				valid = false;
			} else {
				const arg = getWhereArgValue('arg-1');
				if (arg === null) {
					valid = false;
				} else {
					res = new antiprism.WhereCondition(provider, 'unary', whereValue.children[0].value, [arg]);
				}
			}
		} else if (param.children[0].value === 'binary') {
			if (!whereValue.children[1].value) {
				valid = false;
			} else {
				const arg1 = getWhereArgValue('arg-1');
				const arg2 = getWhereArgValue('arg-2');
				if (arg1 === null || arg2 === null) {
					valid = false;
				} else {
					if (arg1.type === 'Field' && arg2.type === 'Literal') {
						switch (currentModel.fields[arg1.value].typeName) {
							case "Int":
								arg2.value = Number(arg2.value);
								break;
							case "Float":
								arg2.value = Number(arg2.value);
								break;
							case "Boolean":
								arg2.value = arg2.value === 'true';
								break;
							case "DateTime":
								arg2.value = new Date(arg2.value);
								break;
						}
					} else if (arg2.type === 'Field' && arg1.type === 'Literal') {
						switch (currentModel.fields[arg2.value].typeName) {
							case "Int":
								arg1.value = Number(arg1.value);
								break;
							case "Float":
								arg1.value = Number(arg1.value);
								break;
							case "Boolean":
								arg1.value = arg1.value === 'true';
								break;
							case "DateTime":
								arg1.value = new Date(arg1.value);
								break;
						}
					}
					res = new antiprism.WhereCondition(provider, 'binary', whereValue.children[1].value, [arg1, arg2]);
				}
			}
		} else {
			valid = false;
		}
	}
	if (!valid) {
		return;
	}
	whereParam = res;
	closeDialog();
}

function getFieldsParam() {
	const dialog = document.getElementById('dialog-body');
	const res = [];
	tmpParamNames = [];
	let valid = true;
	for (let i = 0; i < dialog.children.length - 1; i++) {
		const elem = dialog.children[i];
		if (elem.children[0].value === 'field') {
			if (!elem.children[2].value) {
				res.push(new antiprism.GetParameter(provider, elem.children[1].value));
				tmpParamNames.push(elem.children[1].value);
			} else {
				res.push(new antiprism.GetParameter(provider, elem.children[1].value, null, elem.children[2].value));
				tmpParamNames.push(elem.children[2].value);
			}
		} else {
			if (!elem.children[2].value) {
				valid = false;
				break;
			}
			tmpParamNames.push(elem.children[2].value);
			res.push(new antiprism.GetParameter(provider, elem.children[1].value, elem.children[0].value, elem.children[2].value));
		}
	}
	if (!valid) {
		return;
	}
	fieldParams = res;
	closeDialog();
}

function addGetField(defaultType, defaultField) {
	const dialog = document.getElementById('dialog-body');
	const div = document.createElement('div');
	div.classList.add('dialog-field');
	div.id = 'dialog-field-' + dialog.children.length;
	const typeSelector = document.createElement('select');
	const options = ['field', 'sum', 'avg'].map(p => {
		const opt = document.createElement('option');
		opt.value = p;
		opt.innerHTML = p;
		if (defaultType && defaultType === p) {
			opt.selected = true;
		}
		return opt;
	});
	options.forEach(o => {
		typeSelector.appendChild(o);
	});
	const fieldSelect = document.createElement('select');
	const fieldOptions = currentModelParamNames.map(p => {
		const opt = document.createElement('option');
		opt.value = p;
		opt.innerHTML = p;
		if (defaultField && defaultField === p) {
			opt.selected = true;
		}
		return opt;
	});
	fieldOptions.forEach(o => {
		fieldSelect.appendChild(o);
	});
	const asInput = document.createElement('input');
	const drop = document.createElement('div');
	drop.classList.add('dialog-plus');
	drop.innerText = '-';
	drop.onclick = dropDialogChild.bind(this, dialog.children.length);
	div.appendChild(typeSelector);
	div.appendChild(fieldSelect);
	div.appendChild(asInput);
	div.appendChild(drop);
	dialog.insertBefore(div, document.getElementById('dialog-plus'));
}

function addGetFields() {
	currentModelParamNames.forEach(p => {
		addGetField('field', p);
	});
}

function openDialog(operation, index) {
	const elems = document.getElementsByClassName('dialog-background-back');
	for (let i = 0; i < elems.length; i++) {
		elems[i].classList.replace('dialog-background-back', 'dialog-background-front')
	}
	if (operation === 'insert') {
		addButtons(document.getElementById('dialog-control'), ['insert'], [insertModel]);
		addFields(document.getElementById('dialog-body'), currentModelParamNames);
	} else if (operation === 'item') {
		addButtons(document.getElementById('dialog-control'), ['update', 'delete'], [updateModel.bind(null, index), deleteModel.bind(null, index)]);
		addFields(document.getElementById('dialog-body'), currentModelParamNames, getModelValues(currentModel, objects[index]))
	} else if (operation === 'where') {
		addButtons(document.getElementById('dialog-control'), ['ok'], [getWhereParam]);
		addPlusButton(document.getElementById('dialog-body'), addWhereParameter);
	} else if (operation === 'sort') {
		addButtons(document.getElementById('dialog-control'), ['ok'], [getSortParams]);
		addPlusButton(document.getElementById('dialog-body'), addSortParameter);
	} else if (operation === 'group') {
		addButtons(document.getElementById('dialog-control'), ['ok'], [getGroupParams]);
		addPlusButton(document.getElementById('dialog-body'), addGroupParameter);
	} else if (operation === 'get') {
		addButtons(document.getElementById('dialog-control'), ['get'], [getModels]);
		addGetFields(document.getElementById('dialog-body'));
		addPlusButton(document.getElementById('dialog-body'), addGetField)
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