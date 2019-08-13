// External
import * as _ from 'lodash';

// Time to Seconds
export function seconds(str: string): number {
    if (typeof str === 'number') {
        return str;
    }
    if (typeof str !== 'string') {
        return null;
    }
    const timePairs = str.match(/([\d+.]*[\d+])(?=[sSmMhHdDwWyY]+)([sSmMhHdDwWyY]+)/gi);
    if (!_.size(timePairs)) {
        return null;
    }
    const digest = /([\d+.]*[\d+])(?=[sSmMhHdDwWyY]+)([sSmMhHdDwWyY]+)/i;
    let time;
    let unit;
    let value;
    let data = 0;
    _.each(timePairs, (timePair: string) => {
        time = digest.exec(timePair);
        value = parseFloat(time[1]);
        unit = time[2];
        if (isNaN(value)) {
            return;
        }
        switch (time[2]) {
            case 's':
                unit = 1;
                break;
            case 'm':
                unit = 60;
                break;
            case 'h':
                unit = 3.6e+3;
                break;
            case 'd':
                unit = 8.64e+4;
                break;
            case 'w':
                unit = 6.048e+5;
                break;
            case 'y':
                unit = 3.1558149504e+7;
                break;
            default:
                unit = 0;
        }
        data += value * unit;
    });
    return data;
}

export class Conversion {
    seconds = seconds;
}
