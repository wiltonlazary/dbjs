'use strict';

var isDate = require('es5-ext/lib/Date/is-date');

module.exports = require('../../types-base/date-time').create('Date',
	function (value) {
		if (value == null) {
			value = new Date();
		} else {
			if (!isDate(value)) value = new Date(value);
			if (isNaN(value)) throw new TypeError(value + " is invalid date value");
		}
		return this.normalize(value);
	}, {
		$construct: function (value) {
			return this.normalize((value == null) ? new Date() : new Date(value));
		},
		is: function (value) {
			return isDate(value) && (value.getUTCHours() === 12) &&
				(value.getUTCMinutes() === 0) && (value.getUTCSeconds() === 0) &&
				(value.getUTCMilliseconds() === 0);
		},
		normalize: function (value) {
			if (this.is(value)) return value;
			if (!isDate(value)) value = new Date(value);
			return isNaN(value) ? null : new Date(Date.UTC(value.getFullYear(),
				value.getMonth(), value.getDate(), 12));
		}
	});