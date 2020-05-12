Antiprism
	= AnyWhitespace datasource:Datasource AnyWhitespace models:((Model AnyWhitespace)*) {return { datasource: datasource, models: models.map(m => m[0])};}

Datasource
	= _ "datasource" _ "{" _ [\n] fields: ((Parameter[\n])+) "}" {const res = {}; fields.forEach(f => res[f[0].name] = f[0].value); return res;}

Parameter
	= _ name:Ident _ "=" _ value:(String / Number) {return {name: name, value: value};}

Model
	= _ "model" _ name:Ident _ "{" _ [\n] fields:((Field[\n])+) "}" {
	const res = {name: name, fields: {}};
	 fields.forEach(f => {
	    if (res.hasOwnProperty(f[0].name)) {
	        throw new Error('non unique field');
	    }
	    res.fields[f[0].name] = {};
	    for (const prop in f[0].type) {
	        res.fields[f[0].name][prop] = f[0].type[prop];
	    }
	    res.fields[f[0].name].tags = f[0].tags;
	 });
	 return res;
}

Field
	= _ name:Ident _ type:Type _ tags:((Tag _)*) {return {name: name, type: type, tags: tags.map(t => t[0])}}

Type
	= value:TypeName[?] {return {typeName: value, notNull: false};}
    / value:TypeName {return {typeName: value, notNull: true};}

TypeName
	= value:("Int" / "String" / "DateTime" / "Boolean" / "Float") {return value; }

Tag
	= [@]double:[@]? tagName:("relation" / "default" / "id" / "unique") tagArgs:("(" _ ("autoincrement()" / "now()" / Number / String / Boolean / TagParam) ")")? {
	 return {isDouble: double !== null, name: tagName, args: tagArgs ? tagArgs[2] : null};
}

TagParam
	= name:Ident ":" _ value:String {return {name: name, value: value}; }

Ident
	= value:([A-Za-z][A-Za-z0-9]*) {return text(); }

String
	= [\"]value:[^"]*[\"] {let res = text(); res = res.substring(1); return res.substring(0, res.length-1);}

Number
	= value:[0-9]+ {return parseInt(text(), 10);}

Boolean
	= value:("true" / "false") {return value === 'true';}

AnyWhitespace
	= [ \t\r\n]*

_ "whitespace"
  = [ \t\r]*