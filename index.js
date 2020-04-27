const postgresql = require('./src/postgresql/index');
const mongo = require('./src/mongo/index');
const db = require('./src/db/index');

const antiprism = module.exports;


antiprism.Parser = require('./src/parser/index');
antiprism.DatabaseProvider = db.DatabaseProvider;
antiprism.DatabaseModel = db.DatabaseModel;
antiprism.SetParameter = db.SetParameter;
antiprism.GetParameter = db.GetParameter;
antiprism.PostgresqlProvider = postgresql.PostgresqlProvider;
antiprism.PostgresqlModel = postgresql.PostgresqlModel;