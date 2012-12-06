'use strict';

var Base        = require('../../lib/types/base')
  , BooleanType = require('../../lib/types/boolean')
  , number      = require('../../lib/types/number');

module.exports = function (a) {
	var ns = Base.abstract('Reltransporttest', {
		foo: BooleanType.rel({ value: true, required: true })
	});

	a(ns.foo, true, "Value");
	a(ns._foo.ns, BooleanType, "Namespace");
	a(ns._foo.required, true, "Property");

	ns = Base.abstract('Reltransporttest2', {
		foo: BooleanType.rel(true)
	});

	a(ns.foo, true, "Direct Value: Value");
	a(ns._foo.ns, BooleanType, "Direct Value: Namespace");

	ns = Base.abstract('Reltransporttest3', {
		foo: number.rel([1, 0, '23', 134])
	});

	a.deep(ns.foo.values, [1, 0, 23, 134], "Multiple Value: Value");

	a.throws(function () {
		ns = Base.abstract('Reltransporttest4', {
			foo: number.rel([1, 0, '23', {}])
		});
	}, "Invalid value in set");
};
