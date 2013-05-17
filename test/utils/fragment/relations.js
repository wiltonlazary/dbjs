'use strict';

var Db = require('../../../')

  , getId = function (obj) { return obj._id_; };

module.exports = function (T, a) {
	var ns, obj, relEvents = [], setEvents = [], approve = [], fragment;

	ns = Db.create('ObjFragTest', { foo: Db.String.rel({ multiple: true }) });
	obj = ns({ marko: 12,
		pablo: Db.String.rel({ multiple: true, value: ['foo', 'bar'] }) });

	fragment = new T(obj, function (rel) {
		rel.tags.has('whatever');
		approve.push(rel);
		return true;
	});
	fragment.on('update', function (nu, old) {
		var obj = (nu || old).obj;
		if (obj._type_ === 'relation') relEvents.push(obj);
		else setEvents.push(obj);
	});
	fragment.init();

	a.deep(approve.map(getId).sort(), [obj._$construct, obj._marko, obj._pablo,
		obj._pablo._itemPrototype_._order,
		obj._pablo.getItem('foo')._order,
		obj._pablo.getItem('bar')._order].map(getId).sort(), "Approve");
	approve.length = 0;
	a.deep(relEvents.map(getId).sort(), [obj._marko, obj._pablo, obj._pablo._ns,
		obj._pablo._multiple, obj._pablo.getItem('foo')._order,
		obj._pablo.getItem('bar')._order].map(getId).sort(), "Rel events");
	relEvents.length = 0;
	a.deep(setEvents.map(getId).sort(), [obj._pablo.getItem('foo'),
		obj._pablo.getItem('bar')].map(getId).sort(), "Set items");
	setEvents.length = 0;

	obj.foo.add('dwa');
	a.deep(approve.map(getId).sort(), [obj._foo].map(getId).sort(),
		"Add multiple: Approve");
	approve.length = 0;
	a.deep(relEvents, [], "Add multiple: Rel events");
	relEvents.length = 0;
	a.deep(setEvents.map(getId).sort(),
		[obj._foo.getItem('dwa')].map(getId).sort(), "Add multiple: Set items");
	setEvents.length = 0;

	obj.marko = 'raz';
	a.deep(approve, [], "Set: Approve");
	approve.length = 0;
	a.deep(relEvents, [obj._marko], "Set: Rel events");
	relEvents.length = 0;
	a.deep(setEvents, [], "Set: Set items");
	setEvents.length = 0;

	obj.foo.getItem('test').get('testdeep').value = 'raz';
	a.deep(approve.map(getId).sort(),
		[obj.foo.getItem('test').get('testdeep')].map(getId).sort(),
		"Depp rel: Approve");
	approve.length = 0;
	a.deep(relEvents, [obj.foo.getItem('test').get('testdeep')],
		"Deep rel: Rel events");
	relEvents.length = 0;
	a.deep(setEvents, [], "Set: Set items");
	setEvents.length = 0;
};
