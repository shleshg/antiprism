const postgresql = require('./lib/postgresql/index');
const mongo = require('./lib/mongo/index');
const db = require('./lib/db/index');

const antiprism = module.exports;


antiprism.Parser = require('./lib/parser/index');
antiprism.DatabaseProvider = db.DatabaseProvider;
antiprism.DatabaseModel = db.DatabaseModel;
antiprism.SetParameter = db.SetParameter;
antiprism.GetParameter = db.GetParameter;
antiprism.PostgresqlProvider = postgresql.PostgresqlProvider;
antiprism.PostgresqlModel = postgresql.PostgresqlModel;