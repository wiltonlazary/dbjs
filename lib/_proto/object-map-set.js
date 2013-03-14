'use strict';

var callable  = require('es5-ext/lib/Object/valid-callable')
  , d         = require('es5-ext/lib/Object/descriptor')
  , extend    = require('es5-ext/lib/Object/extend')
  , forEach   = require('es5-ext/lib/Object/for-each')
  , memoize   = require('memoizee/lib/regular')
  , ParentSet = require('./object-set')

  , defineProperties = Object.defineProperties
  , ObjectSet;

require('memoizee/lib/ext/method');

module.exports = ObjectSet = function (set, cb) {
	ParentSet.call(this, set.obj);
	defineProperties(this, {
		_mapper: d(cb),
		_serialize: d(set._serialize)
	});
	forEach(set, function (value, key) {
		this[key] = cb.call(this.obj, value);
		++this.count;
	}, this);
	set.on('add', this._onAdd);
	set.on('delete', this._onDelete);
};

ObjectSet.prototype = Object.create(ParentSet.prototype, extend({
	constructor: d(ObjectSet)
}, d.binder({
	_onAdd: d(function (obj) {
		obj = this[this._serialize(obj)] = this._mapper.call(this.obj, obj);
		++this.count;
		this.emit('add', obj);
	}),
	_onDelete: d(function (obj) {
		var key = this._serialize(obj);
		obj = this[key];
		delete this[key];
		--this.count;
		this.emit('delete', obj);
	})
})));

Object.defineProperty(ObjectSet, 'defineOn', d(function (set) {
	defineProperties(set, memoize(function (cb) {
		return new ObjectSet(this, callable(cb));
	}, { method: 'liveSetMap' }));
}));

ObjectSet.defineOn(ParentSet.prototype);