const db = require('../db');

class PostgresqlGetParameter extends db.GetParameter {

}

class PostgresqlSetParameter extends db.SetParameter {

}

class PostgresqlWhereCondition extends db.WhereCondition {

}

class PostgresqlSortCondition extends db.SortCondition {

}

class PostgresqlGroupingCondition extends db.GroupingCondition {

}

const exp = module.exports;

exp.PostgresqlGetParameter = PostgresqlGetParameter;
exp.PostgresqlSetParameter = PostgresqlSetParameter;
exp.PostgresqlWhereCondition = PostgresqlWhereCondition;
exp.PostgresqlSortCondition = PostgresqlSortCondition;
exp.PostgresqlGroupingCondition = PostgresqlGroupingCondition;