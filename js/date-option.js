Date.prototype.addHours = function (h) {
	this.setHours(this.getHours() + h);
};

Date.prototype.addDays = function (d) {
	this.setDate(this.getDate() + d);
};

Date.prototype.addWeeks = function (w) {
	this.addDays(w * 7);
};

Date.prototype.addMonths = function (m) {
	var d = this.getDate();
	this.setMonth(this.getMonth() + m);

	if (this.getDate() < d)
		this.setDate(0);
};

Date.prototype.addYears = function (y) {
	var m = this.getMonth();
	this.setFullYear(this.getFullYear() + y);

	if (m < this.getMonth()) {
		this.setDate(0);
	}
};