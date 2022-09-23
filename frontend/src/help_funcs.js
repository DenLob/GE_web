import React from 'react';

export default class HelpClass {
    constructor(unix_timestamp) {
        this.unix_timestamp = unix_timestamp
        this.date = new Date(this.unix_timestamp * 1000);
        this.dateStr = this.padStr(this.padStr(this.date.getDate() + '/' +
            this.padStr(1 + this.date.getMonth()) + '/' + this.date.getFullYear())
        )
// Hours part from the timestamp
        this.date_time = this.date.toLocaleDateString();
        this.hours = this.date.getHours();
// Minutes part from the timestamp
        this.minutes = "0" + this.date.getMinutes();
// Seconds part from the timestamp
        this.seconds = "0" + this.date.getSeconds();
    }

    padStr(i) {
        return (i < 10) ? "0" + i : "" + i;
    }

    DateTimeFromTs() {
        if (isNaN(this.unix_timestamp)) {
            console.log(this.unix_timestamp)
            return this.unix_timestamp
        }
        return this.date_time + ' ' + this.hours + ':' + this.minutes.substr(-2) + ':' + this.seconds.substr(-2)
    }

    TimeFromTs() {
        if (isNaN(this.unix_timestamp))
            return null
        return this.hours + ':' + this.minutes.substr(-2)
    }

    DateFromTs() {
        if (isNaN(this.unix_timestamp))
            return null
        return this.date_time
    }

    DateFromTsNoLocale() {
        if (isNaN(this.unix_timestamp))
            return null
        return this.dateStr
    }
}