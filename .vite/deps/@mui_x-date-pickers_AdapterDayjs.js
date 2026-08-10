import {
  require_advancedFormat,
  require_weekOfYear
} from "./chunk-FYIKSOPB.js";
import {
  require_customParseFormat
} from "./chunk-WRMKSIO2.js";
import {
  warnOnce
} from "./chunk-AVBJDU3V.js";
import {
  require_dayjs_min
} from "./chunk-XFICPL23.js";
import {
  _extends
} from "./chunk-HQ6ZTAWL.js";
import {
  __commonJS,
  __toESM
} from "./chunk-V4OQ3NZ2.js";

// node_modules/dayjs/plugin/localizedFormat.js
var require_localizedFormat = __commonJS({
  "node_modules/dayjs/plugin/localizedFormat.js"(exports, module) {
    !(function(e, t) {
      "object" == typeof exports && "undefined" != typeof module ? module.exports = t() : "function" == typeof define && define.amd ? define(t) : (e = "undefined" != typeof globalThis ? globalThis : e || self).dayjs_plugin_localizedFormat = t();
    })(exports, (function() {
      "use strict";
      var e = { LTS: "h:mm:ss A", LT: "h:mm A", L: "MM/DD/YYYY", LL: "MMMM D, YYYY", LLL: "MMMM D, YYYY h:mm A", LLLL: "dddd, MMMM D, YYYY h:mm A" };
      return function(t, o, n) {
        var r = o.prototype, i = r.format;
        n.en.formats = e, r.format = function(t2) {
          void 0 === t2 && (t2 = "YYYY-MM-DDTHH:mm:ssZ");
          var o2 = this.$locale().formats, n2 = (function(t3, o3) {
            return t3.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g, (function(t4, n3, r2) {
              var i2 = r2 && r2.toUpperCase();
              return n3 || o3[r2] || e[r2] || o3[i2].replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g, (function(e2, t5, o4) {
                return t5 || o4.slice(1);
              }));
            }));
          })(t2, void 0 === o2 ? {} : o2);
          return i.call(this, n2);
        };
      };
    }));
  }
});

// node_modules/dayjs/plugin/isBetween.js
var require_isBetween = __commonJS({
  "node_modules/dayjs/plugin/isBetween.js"(exports, module) {
    !(function(e, i) {
      "object" == typeof exports && "undefined" != typeof module ? module.exports = i() : "function" == typeof define && define.amd ? define(i) : (e = "undefined" != typeof globalThis ? globalThis : e || self).dayjs_plugin_isBetween = i();
    })(exports, (function() {
      "use strict";
      return function(e, i, t) {
        i.prototype.isBetween = function(e2, i2, s, f) {
          var n = t(e2), o = t(i2), r = "(" === (f = f || "()")[0], u = ")" === f[1];
          return (r ? this.isAfter(n, s) : !this.isBefore(n, s)) && (u ? this.isBefore(o, s) : !this.isAfter(o, s)) || (r ? this.isBefore(n, s) : !this.isAfter(n, s)) && (u ? this.isAfter(o, s) : !this.isBefore(o, s));
        };
      };
    }));
  }
});

// node_modules/@mui/x-date-pickers/esm/AdapterDayjs/AdapterDayjs.js
var import_dayjs = __toESM(require_dayjs_min(), 1);
var import_weekOfYear = __toESM(require_weekOfYear(), 1);
var import_customParseFormat = __toESM(require_customParseFormat(), 1);
var import_localizedFormat = __toESM(require_localizedFormat(), 1);
var import_isBetween = __toESM(require_isBetween(), 1);
var import_advancedFormat = __toESM(require_advancedFormat(), 1);
import_dayjs.default.extend(import_localizedFormat.default);
import_dayjs.default.extend(import_weekOfYear.default);
import_dayjs.default.extend(import_isBetween.default);
import_dayjs.default.extend(import_advancedFormat.default);
var formatTokenMap = {
  // Year
  YY: "year",
  YYYY: {
    sectionType: "year",
    contentType: "digit",
    maxLength: 4
  },
  // Month
  M: {
    sectionType: "month",
    contentType: "digit",
    maxLength: 2
  },
  MM: "month",
  MMM: {
    sectionType: "month",
    contentType: "letter"
  },
  MMMM: {
    sectionType: "month",
    contentType: "letter"
  },
  // Day of the month
  D: {
    sectionType: "day",
    contentType: "digit",
    maxLength: 2
  },
  DD: "day",
  Do: {
    sectionType: "day",
    contentType: "digit-with-letter"
  },
  // Day of the week
  d: {
    sectionType: "weekDay",
    contentType: "digit",
    maxLength: 2
  },
  dd: {
    sectionType: "weekDay",
    contentType: "letter"
  },
  ddd: {
    sectionType: "weekDay",
    contentType: "letter"
  },
  dddd: {
    sectionType: "weekDay",
    contentType: "letter"
  },
  // Meridiem
  A: "meridiem",
  a: "meridiem",
  // Hours
  H: {
    sectionType: "hours",
    contentType: "digit",
    maxLength: 2
  },
  HH: "hours",
  h: {
    sectionType: "hours",
    contentType: "digit",
    maxLength: 2
  },
  hh: "hours",
  // Minutes
  m: {
    sectionType: "minutes",
    contentType: "digit",
    maxLength: 2
  },
  mm: "minutes",
  // Seconds
  s: {
    sectionType: "seconds",
    contentType: "digit",
    maxLength: 2
  },
  ss: "seconds"
};
var defaultFormats = {
  year: "YYYY",
  month: "MMMM",
  monthShort: "MMM",
  dayOfMonth: "D",
  dayOfMonthFull: "Do",
  weekday: "dddd",
  weekdayShort: "dd",
  hours24h: "HH",
  hours12h: "hh",
  meridiem: "A",
  minutes: "mm",
  seconds: "ss",
  fullDate: "ll",
  keyboardDate: "L",
  shortDate: "MMM D",
  normalDate: "D MMMM",
  normalDateWithWeekday: "ddd, MMM D",
  fullTime12h: "hh:mm A",
  fullTime24h: "HH:mm",
  keyboardDateTime12h: "L hh:mm A",
  keyboardDateTime24h: "L HH:mm"
};
var MISSING_UTC_PLUGIN = ["Missing UTC plugin", "To be able to use UTC or timezones, you have to enable the `utc` plugin", "Find more information on https://mui.com/x/react-date-pickers/timezone/#day-js-and-utc"].join("\n");
var MISSING_TIMEZONE_PLUGIN = ["Missing timezone plugin", "To be able to use timezones, you have to enable both the `utc` and the `timezone` plugin", "Find more information on https://mui.com/x/react-date-pickers/timezone/#day-js-and-timezone"].join("\n");
var AdapterDayjs = class {
  isMUIAdapter = true;
  isTimezoneCompatible = true;
  lib = "dayjs";
  escapedCharacters = {
    start: "[",
    end: "]"
  };
  formatTokenMap = /* @__PURE__ */ (() => formatTokenMap)();
  constructor({
    locale,
    formats
  } = {}) {
    this.locale = locale;
    this.formats = _extends({}, defaultFormats, formats);
    import_dayjs.default.extend(import_customParseFormat.default);
  }
  setLocaleToValue = (value) => {
    const expectedLocale = this.getCurrentLocaleCode();
    if (expectedLocale === value.locale()) {
      return value;
    }
    return value.locale(expectedLocale);
  };
  hasUTCPlugin = () => typeof import_dayjs.default.utc !== "undefined";
  hasTimezonePlugin = () => typeof import_dayjs.default.tz !== "undefined";
  isSame = (value, comparing, comparisonTemplate) => {
    const comparingInValueTimezone = this.setTimezone(comparing, this.getTimezone(value));
    return value.format(comparisonTemplate) === comparingInValueTimezone.format(comparisonTemplate);
  };
  /**
   * Replaces "default" by undefined and "system" by the system timezone before passing it to `dayjs`.
   */
  cleanTimezone = (timezone) => {
    switch (timezone) {
      case "default": {
        return void 0;
      }
      case "system": {
        return import_dayjs.default.tz.guess();
      }
      default: {
        return timezone;
      }
    }
  };
  createSystemDate = (value) => {
    let date;
    if (this.hasUTCPlugin() && this.hasTimezonePlugin()) {
      const timezone = import_dayjs.default.tz.guess();
      if (timezone === "UTC") {
        date = (0, import_dayjs.default)(value);
      } else {
        date = import_dayjs.default.tz(value, timezone);
      }
    } else {
      date = (0, import_dayjs.default)(value);
    }
    return this.setLocaleToValue(date);
  };
  createUTCDate = (value) => {
    if (!this.hasUTCPlugin()) {
      throw new Error(MISSING_UTC_PLUGIN);
    }
    return this.setLocaleToValue(import_dayjs.default.utc(value));
  };
  createTZDate = (value, timezone) => {
    if (!this.hasUTCPlugin()) {
      throw new Error(MISSING_UTC_PLUGIN);
    }
    if (!this.hasTimezonePlugin()) {
      throw new Error(MISSING_TIMEZONE_PLUGIN);
    }
    const keepLocalTime = value !== void 0 && !value.endsWith("Z");
    return this.setLocaleToValue((0, import_dayjs.default)(value).tz(this.cleanTimezone(timezone), keepLocalTime));
  };
  getLocaleFormats = () => {
    const locales = import_dayjs.default.Ls;
    const locale = this.locale || "en";
    let localeObject = locales[locale];
    if (localeObject === void 0) {
      if (true) {
        warnOnce(["MUI X: Your locale has not been found.", "Either the locale key is not a supported one. Locales supported by dayjs are available here: https://github.com/iamkun/dayjs/tree/dev/src/locale.", "Or you forget to import the locale from 'dayjs/locale/{localeUsed}'", "fallback on English locale."]);
      }
      localeObject = locales.en;
    }
    return localeObject.formats;
  };
  /**
   * If the new day does not have the same offset as the old one (when switching to summer day time for example),
   * Then dayjs will not automatically adjust the offset (moment does).
   * We have to parse again the value to make sure the `fixOffset` method is applied.
   * See https://github.com/iamkun/dayjs/blob/b3624de619d6e734cd0ffdbbd3502185041c1b60/src/plugin/timezone/index.js#L72
   */
  adjustOffset = (value) => {
    if (!this.hasTimezonePlugin()) {
      return value;
    }
    const timezone = this.getTimezone(value);
    if (timezone !== "UTC") {
      const fixedValue = value.tz(this.cleanTimezone(timezone), true);
      if (fixedValue.$offset === (value.$offset ?? 0)) {
        return value;
      }
      value.$offset = fixedValue.$offset;
    }
    return value;
  };
  date = (value, timezone = "default") => {
    if (value === null) {
      return null;
    }
    if (timezone === "UTC") {
      return this.createUTCDate(value);
    }
    if (timezone === "system" || timezone === "default" && !this.hasTimezonePlugin()) {
      return this.createSystemDate(value);
    }
    return this.createTZDate(value, timezone);
  };
  getInvalidDate = () => (0, import_dayjs.default)(/* @__PURE__ */ new Date("Invalid date"));
  getTimezone = (value) => {
    if (this.hasTimezonePlugin()) {
      const zone = value.$x?.$timezone;
      if (zone) {
        return zone;
      }
    }
    if (this.hasUTCPlugin() && value.isUTC()) {
      return "UTC";
    }
    return "system";
  };
  setTimezone = (value, timezone) => {
    if (this.getTimezone(value) === timezone) {
      return value;
    }
    if (timezone === "UTC") {
      if (!this.hasUTCPlugin()) {
        throw new Error(MISSING_UTC_PLUGIN);
      }
      return value.utc();
    }
    if (timezone === "system") {
      return value.local();
    }
    if (!this.hasTimezonePlugin()) {
      if (timezone === "default") {
        return value;
      }
      throw new Error(MISSING_TIMEZONE_PLUGIN);
    }
    return this.setLocaleToValue(import_dayjs.default.tz(value, this.cleanTimezone(timezone)));
  };
  toJsDate = (value) => {
    return value.toDate();
  };
  parse = (value, format) => {
    if (value === "") {
      return null;
    }
    return (0, import_dayjs.default)(value, format, this.locale, true);
  };
  getCurrentLocaleCode = () => {
    return this.locale || "en";
  };
  is12HourCycleInCurrentLocale = () => {
    return /A|a/.test(this.getLocaleFormats().LT || "");
  };
  expandFormat = (format) => {
    const localeFormats = this.getLocaleFormats();
    const t = (formatBis) => formatBis.replace(/(\[[^\]]+])|(MMMM|MM|DD|dddd)/g, (_, a, b) => a || b.slice(1));
    return format.replace(/(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g, (_, a, b) => {
      const B = b && b.toUpperCase();
      return a || localeFormats[b] || t(localeFormats[B]);
    });
  };
  isValid = (value) => {
    if (value == null) {
      return false;
    }
    return value.isValid();
  };
  format = (value, formatKey) => {
    return this.formatByString(value, this.formats[formatKey]);
  };
  formatByString = (value, formatString) => {
    return this.setLocaleToValue(value).format(formatString);
  };
  formatNumber = (numberToFormat) => {
    return numberToFormat;
  };
  isEqual = (value, comparing) => {
    if (value === null && comparing === null) {
      return true;
    }
    if (value === null || comparing === null) {
      return false;
    }
    return value.toDate().getTime() === comparing.toDate().getTime();
  };
  isSameYear = (value, comparing) => {
    return this.isSame(value, comparing, "YYYY");
  };
  isSameMonth = (value, comparing) => {
    return this.isSame(value, comparing, "YYYY-MM");
  };
  isSameDay = (value, comparing) => {
    return this.isSame(value, comparing, "YYYY-MM-DD");
  };
  isSameHour = (value, comparing) => {
    return value.isSame(comparing, "hour");
  };
  isAfter = (value, comparing) => {
    return value > comparing;
  };
  isAfterYear = (value, comparing) => {
    if (!this.hasUTCPlugin()) {
      return value.isAfter(comparing, "year");
    }
    return !this.isSameYear(value, comparing) && value.utc() > comparing.utc();
  };
  isAfterDay = (value, comparing) => {
    if (!this.hasUTCPlugin()) {
      return value.isAfter(comparing, "day");
    }
    return !this.isSameDay(value, comparing) && value.utc() > comparing.utc();
  };
  isBefore = (value, comparing) => {
    return value < comparing;
  };
  isBeforeYear = (value, comparing) => {
    if (!this.hasUTCPlugin()) {
      return value.isBefore(comparing, "year");
    }
    return !this.isSameYear(value, comparing) && value.utc() < comparing.utc();
  };
  isBeforeDay = (value, comparing) => {
    if (!this.hasUTCPlugin()) {
      return value.isBefore(comparing, "day");
    }
    return !this.isSameDay(value, comparing) && value.utc() < comparing.utc();
  };
  isWithinRange = (value, [start, end]) => {
    return value >= start && value <= end;
  };
  startOfYear = (value) => {
    return this.adjustOffset(value.startOf("year"));
  };
  startOfMonth = (value) => {
    return this.adjustOffset(value.startOf("month"));
  };
  startOfWeek = (value) => {
    return this.adjustOffset(this.setLocaleToValue(value).startOf("week"));
  };
  startOfDay = (value) => {
    return this.adjustOffset(value.startOf("day"));
  };
  endOfYear = (value) => {
    return this.adjustOffset(value.endOf("year"));
  };
  endOfMonth = (value) => {
    return this.adjustOffset(value.endOf("month"));
  };
  endOfWeek = (value) => {
    return this.adjustOffset(this.setLocaleToValue(value).endOf("week"));
  };
  endOfDay = (value) => {
    return this.adjustOffset(value.endOf("day"));
  };
  addYears = (value, amount) => {
    return this.adjustOffset(value.add(amount, "year"));
  };
  addMonths = (value, amount) => {
    return this.adjustOffset(value.add(amount, "month"));
  };
  addWeeks = (value, amount) => {
    return this.adjustOffset(value.add(amount, "week"));
  };
  addDays = (value, amount) => {
    return this.adjustOffset(value.add(amount, "day"));
  };
  addHours = (value, amount) => {
    return this.adjustOffset(value.add(amount, "hour"));
  };
  addMinutes = (value, amount) => {
    return this.adjustOffset(value.add(amount, "minute"));
  };
  addSeconds = (value, amount) => {
    return this.adjustOffset(value.add(amount, "second"));
  };
  getYear = (value) => {
    return value.year();
  };
  getMonth = (value) => {
    return value.month();
  };
  getDate = (value) => {
    return value.date();
  };
  getHours = (value) => {
    return value.hour();
  };
  getMinutes = (value) => {
    return value.minute();
  };
  getSeconds = (value) => {
    return value.second();
  };
  getMilliseconds = (value) => {
    return value.millisecond();
  };
  setYear = (value, year) => {
    return this.adjustOffset(value.set("year", year));
  };
  setMonth = (value, month) => {
    return this.adjustOffset(value.set("month", month));
  };
  setDate = (value, date) => {
    return this.adjustOffset(value.set("date", date));
  };
  setHours = (value, hours) => {
    return this.adjustOffset(value.set("hour", hours));
  };
  setMinutes = (value, minutes) => {
    return this.adjustOffset(value.set("minute", minutes));
  };
  setSeconds = (value, seconds) => {
    return this.adjustOffset(value.set("second", seconds));
  };
  setMilliseconds = (value, milliseconds) => {
    return this.adjustOffset(value.set("millisecond", milliseconds));
  };
  getDaysInMonth = (value) => {
    return value.daysInMonth();
  };
  getWeekArray = (value) => {
    const start = this.startOfWeek(this.startOfMonth(value));
    const end = this.endOfWeek(this.endOfMonth(value));
    let count = 0;
    let current = start;
    const nestedWeeks = [];
    while (current < end) {
      const weekNumber = Math.floor(count / 7);
      nestedWeeks[weekNumber] = nestedWeeks[weekNumber] || [];
      nestedWeeks[weekNumber].push(current);
      current = this.addDays(current, 1);
      count += 1;
    }
    return nestedWeeks;
  };
  getWeekNumber = (value) => {
    return value.week();
  };
  getDayOfWeek(value) {
    return value.day() + 1;
  }
  getYearRange = ([start, end]) => {
    const startDate = this.startOfYear(start);
    const endDate = this.endOfYear(end);
    const years = [];
    let current = startDate;
    while (this.isBefore(current, endDate)) {
      years.push(current);
      current = this.addYears(current, 1);
    }
    return years;
  };
};
export {
  AdapterDayjs
};
//# sourceMappingURL=@mui_x-date-pickers_AdapterDayjs.js.map
