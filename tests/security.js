var Model = require('perstore/model').Model;
var Foo = new Model({});
var Bar1 = new Model({});
var Bar2 = new Model({});
var pintura = require('pintura/pintura');
var registerModels = pintura.registerModels;
var	assert = require('assert');
exports.testGroup = function(){
	pintura.configure({
		security: {
			groupsUsers: {
				user: ['john'],
				public: [null]
			}
		}
	});
	var groups = pintura.config.security.getGroupsForUser('john');
	assert.equal(groups.length, 1);
	assert.equal(groups[0], 'user');
	groups = pintura.config.security.getGroupsForUser(null);
	assert.equal(groups.length, 1);
	assert.equal(groups[0], 'public');
	groups = pintura.config.security.getGroupsForUser('mike');
	assert.equal(groups.length, 0);
};
exports.testModel = function(){
	pintura.configure({
		security: {
			groupsUsers: {
				user: ['john'],
				public: [null]
			}
		}
	});
	registerModels({
		Foo: Foo,
		Bar: [
			{
				model: Bar1,
				groups: ['user']
			},
			{
				model: Bar2,
				groups: ['public']
			}
		]
	});
	var model = pintura.config.security.getModelForUser('john');
	assert.equal(model.Foo, Foo);
	assert.equal(model.Bar, Bar1);
	var model = pintura.config.security.getModelForUser(null);
	assert.equal(model.Foo, Foo);
	assert.equal(model.Bar, Bar2);
	var model = pintura.config.security.getModelForUser('mike');
	assert.equal(model.Foo, Foo);
	assert.equal(model.Bar, undefined);
};
exports.testModel = function(){
	pintura.configure({
		security: {
			groupsUsers: {
				user: ['john'],
				public: [null]
			}
		}
	});
	registerModels({
		groups: ['user', 'public'],
		models: {
			Bar: Bar1
		}
	});
	var model = pintura.config.security.getModelForUser('john');
	assert.equal(model.Bar, Bar1);
	var model = pintura.config.security.getModelForUser(null);
	assert.equal(model.Bar, Bar1);
	var model = pintura.config.security.getModelForUser('mike');
	assert.equal(model.Bar, undefined);
};


if (require.main === module)
    require('patr/runner').run(exports);

