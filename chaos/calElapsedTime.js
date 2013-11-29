//getTime 方法返回自 1970 年 1 月 1 日午夜起经过的毫秒数。 对于该日期之前的任何日期，将返回一个负数。
//若要使用更易于管理的单位，可以将 getTime 方法提供的毫秒数除以某个适当的数字。 例如，若要将毫秒数转换为天数，可以将毫秒数除以 86,400,000（1000 毫秒 x 60 秒 x 60 分 x 24 小时）。
//以下示例演示了自指定年份的第一天起经过的时间。 它使用除法运算来计算运行时间（以天、小时、分钟和秒为单位）。 此示例不考虑夏时制时间。
// Set the unit values in milliseconds.
var msecPerMinute = 1000 * 60;
var msecPerHour = msecPerMinute * 60;
var msecPerDay = msecPerHour * 24;

// Set a date and get the milliseconds
var date = new Date('6/15/1990');
dateMsec = date.getTime();

// Set the date to January 1, at midnight, of the specified year.
date.setMonth(0);
date.setDate(1);
date.setHours(0, 0, 0, 0);

// Get the difference in milliseconds.
var interval = dateMsec - date.getTime();

// Calculate how many days the interval contains. Subtract that
// many days from the interval to determine the remainder.
var days = Math.floor(interval / msecPerDay );
interval = interval - (days * msecPerDay );

// Calculate the hours, minutes, and seconds.
var hours = Math.floor(interval / msecPerHour );
interval = interval - (hours * msecPerHour );

var minutes = Math.floor(interval / msecPerMinute );
interval = interval - (minutes * msecPerMinute );

var seconds = Math.floor(interval / 1000 );

// Display the result.
console.log(days + " days, " + hours + " hours, " + minutes + " minutes, " + seconds + " seconds.");

//Output: 164 days, 23 hours, 0 minutes, 0 seconds.
