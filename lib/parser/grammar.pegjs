Antiprism
	= AnyWhitespace datasource:Datasource AnyWhitespace models:((Model AnyWhitespace)*) {return { datasource: datasource, models: models.map(m => m[0])};}

Datasource
	= _ "datasource" _ "{" _ [\n] fields: ((Parameter[\n])+) "}" {const res = {}; fields.forEach(f => res[f[0].name] = f[0].value); return res;}

Parameter
	= _ name:Ident _ "=" _ value:(String / Number) {return {name: name, value: value};}

Model
	= _ "model" _ name:Ident _ "{" _ [\n] fields:((Field[\n])+) "}" {const res = {name: name, fields: {}}; fields.forEach(f => { if (res.hasOwnProperty(f[0].name)) {throw new Error('non unique field'); } res.fields[f[0].name] = f[0].type; }); return res;}

Field
	= _ name:Ident _ type:Type {return {name: name, type: type}}

Type
	= value:TypeName[?] {return {typeName: value, notNull: false};}
    / value:TypeName {return {typeName: value, notNull: true};}

TypeName
	= value:("Int" / "String" / "DateTime" / "Boolean" / "Float") {return value; }

Ident
	= value:([A-Za-z][A-Za-z0-9]*) {return text(); }

String
	= [\"]value:[^"]*[\"] {let res = text(); res = res.substring(1); return res.substring(0, res.length-1);}

Number
	= value:[0-9]+ {return parseInt(text(), 10);}

AnyWhitespace
	= [ \t\r\n]*

_ "whitespace"
  = [ \t\r]*