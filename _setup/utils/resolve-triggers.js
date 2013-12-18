'use strict';

var remove         = require('es5-ext/array/#/remove')
  , isObservable   = require('observable-value/is-observable')
  , resolveStatic  = require('./resolve-static-triggers')
  , resolveDynamic = require('./resolve-dynamic-triggers');

module.exports = function (obj, getter, update) {
	var result, clear = [], origin = getter
	  , isDynamic = (getter.$dbjs$getter === 2);

	resolveStatic(getter).forEach(function (name) {
		var observable, current, listener, value, listeners;
		if (name[0] === '_') return;
		observable = obj._get(name);
		observable._dynamicListeners_.push(listener = function (event, held) {
			var listeners, nu = observable.value;
			if (current) {
				listeners = current._dynamicListeners_;
				if (listeners) remove.call(listeners, update);
				else current.off('change', update);
			}
			if (isObservable(nu)) {
				if (nu._makeObservable_) nu._makeObservable_();
				listeners = nu._dynamicListeners_;
				if (listeners) listeners.push(update);
				else nu.on('change', update);
				current = nu;
			}
			return update(event, held);
		});
		value = observable.value;
		if (isObservable(value)) {
			listeners = value._dynamicListeners_;
			if (listeners) listeners.push(update);
			else value.on('change', update);
			current = value;
		}
		clear.push(function () {
			if (current) {
				listeners = current._dynamicListeners_;
				if (listeners) remove.call(listeners, update);
				else current.off('change', update);
			}
			remove.call(observable._dynamicListeners_, listener);
		});
	});
	if (isDynamic) {
		result = resolveDynamic(obj.database, getter, update);
		getter = result.getter;
		clear.push(result.clear);
	}

	return {
		origin: origin,
		getter: getter,
		clear: function () {
			if (!clear) return;
			while (clear.length) clear.pop()();
			clear = null;
		}
	};
};
