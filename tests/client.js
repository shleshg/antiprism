const antiprism = require('antiprism');
class test extends antiprism.PostgresqlModel {
    constructor(provider, a, b) {
        super(provider, {
            name: 'test',
            fields: {
                a: {
                    typeName: 'Int',
                    notNull: true
                },
                b: {
                    typeName: 'Float',
                    notNull: true
                }
            }
        });
        this._value = {
            a: a,
            b: b
        };
    }
    static async createModel(provider, a, b) {
        (await provider.insertModel('test', [
            new antiprism.SetParameter(provider, 'a', a),
            new antiprism.SetParameter(provider, 'b', b)
        ]))
        return new test(provider, a, b);
    }
    static async getModels(provider, fields, where, group, sort) {
        const values = await provider.getModels('test', fields, where, group, sort);
        return values.map(v => new test(provider, v.a, v.b, true));
    }
    async update(sets) {
        await this._provider.updateModels('test', sets, []);
    }
    async delete() {
        await this._provider.deleteModels('test', []);
    }
    get a() {
        return this._value.a;
    }
    set a(a) {
        return new Promise(async (resolve, reject) => {
            await this.update([new antiprism.SetParameter(this._provider, 'a', a)]);
            resolve();
        });
    }
    get b() {
        return this._value.b;
    }
    set b(b) {
        return new Promise(async (resolve, reject) => {
            await this.update([new antiprism.SetParameter(this._provider, 'b', b)]);
            resolve();
        });
    }
}
class test2 extends antiprism.PostgresqlModel {
    constructor(provider, s) {
        super(provider, {
            name: 'test2',
            fields: {
                s: {
                    typeName: 'DateTime',
                    notNull: false
                }
            }
        });
        this._value = { s: s };
    }
    static async createModel(provider, s) {
        (await provider.insertModel('test2', [new antiprism.SetParameter(provider, 's', s)]))
        return new test2(provider, s);
    }
    static async getModels(provider, fields, where, group, sort) {
        const values = await provider.getModels('test2', fields, where, group, sort);
        return values.map(v => new test2(provider, v.s, true));
    }
    async update(sets) {
        await this._provider.updateModels('test2', sets, []);
    }
    async delete() {
        await this._provider.deleteModels('test2', []);
    }
    get s() {
        return this._value.s;
    }
    set s(s) {
        return new Promise(async (resolve, reject) => {
            await this.update([new antiprism.SetParameter(this._provider, 's', s)]);
            resolve();
        });
    }
}
const _exp = module.exports;
_exp.test = test;
_exp.test2 = test2;
_exp.NewProvider = async function (config) {
    const res = new antiprism.PostgresqlProvider(config.datasource.user, config.datasource.password, config.datasource.database, config.datasource.port, config.models);
    await res.connect();
    return res;
};