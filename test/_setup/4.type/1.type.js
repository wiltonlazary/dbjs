'use strict';

var toArray  = require('es6-iterator/to-array')
  , Database = require('../../../')

  , getPrototypeOf = Object.getPrototypeOf;

module.exports = function (a) {
	var db = new Database(), Base = db.Base, TestType = Base.extend('TestType');

	a(Base.__id__, 'Base', "Id");
	a(Base.call, Function.prototype.call, "Function prototype methods");
	return {
		"Extend": function (a) {
			var TestType0, TestType1;

			a.throws(function () { Base.extend('0sdfs'); }, 'INVALID_TYPE_NAME',
				"Name: Digit first");
			a.throws(function () { Base.extend('sdsdfs'); }, 'INVALID_TYPE_NAME',
				"Name: No capital");
			a.throws(function () { Base.extend('Raz dwa'); }, 'INVALID_TYPE_NAME',
				"Name: Inner space");
			a.throws(function () { Base.extend('_foo'); }, 'INVALID_TYPE_NAME',
				"Name: Underscore");

			TestType0 = Base.extend('Extendtest0', { trzy: { type: db.DateTime,
				required: true } });
			a.throws(function () { TestType0.extend('Extendtest1',
				{ trzy: { value: 'foo' } }); }, 'TYPE_CONSTRUCTION_ERROR', "Validate");
			TestType0.extend('Extendtest2', {});
			TestType0.extend('Extendtest3');

			TestType0.prototype.define('foo', { type: db.DateTime, required: true });
			a.throws(function () {
				TestType0.extend('Extendtest4', { trzy: { value: function () {} } },
					{ foo: { value: 'foo' } });
			}, 'TYPE_CONSTRUCTION_ERROR', "Validate Prototype");

			TestType0.extend('Extendtest5', { trzy: { value: function () {} } },
				{});
			TestType0.extend('Extendtest6', { trzy: { value: function () {} } },
				{ foo: { value: function () {} } });

			TestType1 = TestType.extend('Extendtest7', { other: { value: 15 } },
				{ foo: { value: 'raz' } });

			a(TestType1.other, 15, "Type property");
			a(TestType1.prototype.foo, 'raz', "Prototype property");

			TestType1 = Base.extend('Test22', { other: { value: 14 } },
				{ foo: { value: 'raz' } });

			a(TestType1.other, 14, "Type property");
			a(TestType1.prototype.foo, 'raz', "Prototype property");
			a(TestType1.prototype.constructor, TestType1, "Constructor property");

			TestType1 = Base.extend('Test3', {});
			a(db.Test3, TestType1, "Set on Base");
			a(TestType1.__id__, 'Test3', "Id");
		},
		"Proto change": function (a) {
			var TestType1 = db.Object.extend('Prototest1')
			  , TestType2 = db.Object.extend('Prototest2')
			  , TestType3 = TestType1.extend('Prototest3')

			  , obj1, obj2;

			TestType3._setValue_(TestType2);
			a(getPrototypeOf(TestType3), TestType2, "Constructor");
			a(getPrototypeOf(TestType3.prototype), TestType2.prototype, "Prototype");

			TestType3._setValue_();
			a(getPrototypeOf(TestType3), Base, "Constructor");
			a(getPrototypeOf(TestType3.prototype), Base.prototype, "Prototype");

			TestType2.define('indtest', { type: db.String });

			obj1 = new db.Object({ indtest: 'foo' });
			obj1._setValue_(TestType2.prototype);

			obj1 = new db.Object({ valueTest: 'foo' });
			obj2 = new db.Object({});
			obj2.define('valueTest2', { type: TestType2 });
			obj2.$valueTest2._setValue_(obj1);
			a(obj2.valueTest2, null, "Value: Before");
			obj1._setValue_(TestType2.prototype);
			a(obj2.valueTest2, obj1, "Value: After");
		},
		"Proto handling": function (a) {
			var TestType1 = db.Object.extend('IndexObjRelTest1')
			  , TestType2 = db.Object.extend('IndexObjRelTest2',
					{ foo: { type: TestType1 } })
			  , obj, obj1, obj2;
			obj = new db.Object();
			obj2 = new db.Object();
			obj2.foo = obj;
			obj2._setValue_(TestType2.prototype);
			a(obj2.foo, null, "Invalid cleared");
			obj1 = new TestType1();
			obj2.foo = obj1;
			a(obj2.foo, obj1, "Assign good");
		},
		"Proto handling: multiple": function (a) {
			var TestType1 = db.Object.extend('IndexObjRelTest3')
			  , TestType2 = db.Object.extend('IndexObjRelTest4',
					{ bar: { type: TestType1, multiple: true } })
			  , item, obj1, obj2;
			obj2 = new db.Object();
			item = obj2._getMultiple_('3bar').$get(new db.Object());
			item._setValue_(true);
			obj2._setValue_(TestType2.prototype);
			a.deep(toArray(obj2.bar), [], "Invalid cleared");
			obj1 = new TestType1();
			obj2.bar = [obj1];
			a.deep(toArray(obj2.bar), [obj1], "Assigned");
		},
		"Proto handling: multiple: false": function (a) {
			var TestType1 = db.Object.extend('IndexObjRelTest5')
			  , TestType2 = db.Object.extend('IndexObjRelTest6',
					{ bar: { type: TestType1, multiple: true } })
			  , obj11, obj12, obj2;
			obj11 = new TestType1();
			obj12 = new TestType1();
			obj2 = new TestType2();
			obj2.bar.add(obj11);
			obj2.bar.delete(obj11);
			obj2.bar.$get(obj12);
			obj2._setValue_();
			a(obj2.$bar.multiple, false, "");
		},
		"Proto: Multiple handling": function () {
			var obj, emitted, TestType = db.Object.extend('MultipleObjRelTest1',
				{ foo: { type: db.String, multiple: true } });

			obj = new db.Object({ foo: 'raz' });
			obj._foo.once('change', function (event) {
				emitted = event;
			});
			obj._setValue_(TestType.prototype);
			a.deep(emitted, { type: 'change', newValue: obj.foo, oldValue: 'raz'  });
		},
		"Constructor": function (a) {
			var x;
			a.throws(function () { Base(undefined); }, 'NOT_SUPPORTED_VALUE',
				"Undefined");
			a(Base(null), null, "Null");
			a(Base(false), false, "Boolean (primitive)");
			a.throws(function () { Base(new Boolean(false)); }, //jslint: skip
				'NOT_SUPPORTED_VALUE', "Primitive object");
			a.throws(function () { Base({}); }, 'NOT_SUPPORTED_VALUE',
				"Foreign object");
			a(Base('false'), 'false', "String");
			a(Base(''), '', "String");
			a(Base(0), 0, "Number");
			x = new Date();
			a(Base(x), x, "Date");
			x = /raz/;
			a(Base(x), x, "RegExp");
			x = function (foo) {};
			a(Base(x), x, "Function");
			x = new db.Object();
			a(Base(x), x, "Db object");
		},
		"Is": function (a) {
			var x;
			a(Base.is(undefined), false, "Undefined");
			a(Base.is(null), true, "Null");
			a(Base.is(false), true, "Boolean (primitive)");
			a(Base.is(new Boolean(false)), false, "Primitive object"); //jslint: skip
			a(Base.is({}), false, "Foreign object");
			a(Base.is('false'), true, "String");
			a(Base.is(0), true, "Number");
			x = new Date();
			a(Base.is(x), true, "Date");
			x = /raz/;
			a(Base.is(x), true, "RegExp");
			x = function (foo) {};
			a(Base.is(x), true, "Function");
			x = new db.Object();
			a(Base.is(x), true, "Db object");
		},
		"Normalize": function (a) {
			var x;
			a(Base.normalize(undefined), null, "Undefined");
			a(Base.normalize(null), null, "Null");
			a(Base.normalize(false), false, "Boolean (primitive)");
			a(Base.normalize(new Boolean(false)), null, //jslint: skip
				"Primitive object");
			a(Base.normalize({}), null, "Foreign object");
			a(Base.normalize('false'), 'false', "String");
			a(Base.normalize(''), '', "String");
			a(Base.normalize(0), 0, "Number");
			x = new Date();
			a(Base.normalize(x), x, "Date");
			x = /raz/;
			a(Base.normalize(x), x, "RegExp");
			x = function (foo) {};
			a(Base.normalize(x), x, "Function");
			x = new db.Object();
			a(Base.normalize(x), x, "Db object");
		},
		"Validate": function (a) {
			var x;
			a.throws(function () { Base.validate(undefined); }, 'NOT_SUPPORTED_VALUE',
				"Undefined");
			a(Base.validate(null), null, "Null");
			a(Base.validate(false), false, "Boolean (primitive)");
			a.throws(function () {
				Base.validate(new Boolean(false)); //jslint: skip
			}, 'NOT_SUPPORTED_VALUE', "Primitive object");
			a.throws(function () { Base.validate({}); }, 'NOT_SUPPORTED_VALUE',
				"Foreign object");
			a(Base.validate('false'), 'false', "String");
			a(Base.validate(''), '', "String");
			a(Base.validate(0), 0, "Number");
			x = new Date();
			a(Base.validate(x), x, "Date");
			x = /raz/;
			a(Base.validate(x), x, "RegExp");
			x = function (foo) {};
			a(Base.validate(x), x, "Function");
			x = new db.Object();
			a(Base.validate(x), x, "Db object");
		},
		"Create": function (a) {
			var x;
			a.throws(function () { Base.create(undefined); }, 'NOT_SUPPORTED_VALUE',
				"Undefined");
			a(Base.create(null), null, "Null");
			a(Base.create(false), false, "Boolean (primitive)");
			a.throws(function () {
				Base.create(new Boolean(false)); //jslint: skip
			}, 'NOT_SUPPORTED_VALUE', "Primitive object");
			a.throws(function () { Base.create({}); }, 'NOT_SUPPORTED_VALUE',
				"Foreign object");
			a(Base.create('false'), 'false', "String");
			a(Base.create(''), '', "String");
			a(Base.create(0), 0, "Number");
			x = new Date();
			a(Base.create(x), x, "Date");
			x = /raz/;
			a(Base.create(x), x, "RegExp");
			x = function (foo) {};
			a(Base.create(x), x, "Function");
			x = new db.Object();
			a(Base.create(x), x, "Db object");
		},
		"Nested": function () {
			var obj = new db.Object(), obj1, obj2;
			a.h1("Base object");
			a(obj.__object__, obj, "__object__");
			a(obj.__master__, obj, "__master__");
			a(obj.__parent__, undefined, "__parent__");
			a(obj.__sKey__, undefined, "__sKey__");
			obj1 = obj._getObject_('3foo');
			a(obj1.__object__, obj1, "__object__");
			a(obj1.__master__, obj, "__master__");
			a(obj1.__parent__, obj, "__parent__");
			a(obj1.__sKey__, '3foo', "__sKey__");
			obj2 = obj1._getObject_('3foor');
			a(obj2.__object__, obj2, "__object__");
			a(obj2.__master__, obj, "__master__");
			a(obj2.__parent__, obj1, "__parent__");
			a(obj2.__sKey__, '3foor', "__sKey__");
		}
	};
};
