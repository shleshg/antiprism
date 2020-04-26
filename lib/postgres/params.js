const db = require('../db');

class PostgresGetParameter extends db.GetParameter {

}

class PostgresSetParameter extends db.SetParameter {

}

class PostgresWhereCondition extends db.WhereCondition {

}

class PostgresSortCondition extends db.SortCondition {

}

class PostgresGroupingCondition extends db.GroupingCondition {

}

const exp = module.exports;

exp.PostgresGetParameter = PostgresGetParameter;
exp.PostgresSetParameter = PostgresSetParameter;
exp.PostgresWhereCondition = PostgresWhereCondition;
exp.PostgresSortCondition = PostgresSortCondition;
exp.PostgresGroupingCondition = PostgresGroupingCondition;