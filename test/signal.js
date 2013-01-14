'use strict';

var Db    = require('../')
  , Event = require('../lib/event')

  , Base = Db.Base
  , keys = Object.keys;

module.exports = function (t) {
	return {
		"Events": function (a) {
			var ns = Base.create('SignalTest1')
			  , emitted = {}, event;

			t.on('update', function (data) {
				var name = '*';
				if (!emitted[name]) emitted[name] = [];
				emitted[name].push(data);
			});
			ns.on('update', function (data) {
				var name = 'SignalTest1*';
				if (!emitted[name]) emitted[name] = [];
				emitted[name].push(data);
			});
			ns._getRel_('fooSigTest').on('update', function (data) {
				var name = 'SignalTest1:fooSigTest*';
				if (!emitted[name]) emitted[name] = [];
				emitted[name].push(data);
			});

			ns._fooSigTest._signal_('trzy');
			ns._getRel_('fooSigTest2')._signal_(34);

			event = emitted['*'][0];
			a.deep(keys(emitted).sort(), ['*', 'SignalTest1*'].sort(), "Events");

			a(emitted['*'].length, 2, "* Events length");
			a.deep(emitted['*'][0], { stamp: event.stamp, obj: ns._fooSigTest,
				value: 'trzy', index: event.index }, "* Event #1");
			a.deep(emitted['*'][1], { stamp: event.stamp, obj: ns._fooSigTest2,
				value: 34, index: emitted['*'][1].index }, "* Event #2");

			a.deep(emitted['SignalTest1*'], emitted['*'], "NS* Events");
		},
		"Import": function (a) {
			var obj = Db();
			t._add(new Event(obj._getRel_('signalAddTest'), 34, 0));
			a(obj.signalAddTest, 34, "Import new");
			t._add(new Event(obj._signalAddTest, 58, 3));
			a(obj.signalAddTest, 58, "Import newer");
			t._add(new Event(obj._signalAddTest, 23, 1));
			a(obj.signalAddTest, 58, "Import older");
		},
		"Reverse": function (a) {
			var ns1, ns2, ns3, obj11, obj21, onassign = [], ondismiss = [], data = [];
			ns1 = Db.create('SignalReverseTest1');
			ns2 = Db.create('SignalReverseTest2');
			ns3 = Db.create('SignalReverseTest3', {
				revTest: ns1.rel({ multiple: true })
			});
			obj11 = ns1({ foo: 'bar' });
			obj11.on('assign', function (event) { onassign.push(event); });
			obj11.on('dismiss', function (event) { ondismiss.push(event); });

			obj21 = ns2({ rel: obj11 });

			obj11._forEachReverse_(function () { data.push(arguments); });
			a(data.length, 1, "Count");
			a.deep(data[0], [obj21._rel, obj21._rel._id_, obj11], "Content");
			a(onassign.length, 1, "Assign: On Assign: length");
			a(ondismiss.length, 0, "Assign: On Dismiss: length");
			a.deep(onassign[0], { stamp: onassign[0].stamp, obj: obj21._rel,
				value: obj11, index: onassign[0].index }, "Assign: On Assign: content");
			onassign.length = 0;
			obj21.rel = null;
			a(onassign.length, 0, "Dismiss: On Assign: length");
			a(ondismiss.length, 1, "Dismiss: On Dismiss: length");
			a.deep(ondismiss[0], { stamp: ondismiss[0].stamp, obj: obj21._rel,
				value: null, index: ondismiss[0].index },
				"Dismiss: On Assign: content");
		},
		"Remove": function (a) {
			var obj = Db(), events = [];
			t.on('remove', function (id) { events.push(id); });
			a(obj.ns, Db, "Before");
			t._remove(obj._id_);
			a(obj.ns, Db.Base, "After");
			a.deep(events, [obj._id_], "Event");
		}
	};
};
