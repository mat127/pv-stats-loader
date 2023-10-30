import axios from 'axios';

export interface CurveItem {
    loadPower: number,
    SOC: number,
    thirdPower: number,
    battery: number,
    pMeter: number,
    dateStamp: number,
    power: number
}

export interface StationCurve {
    data: {
        curve: CurveItem[]
    }
}

const wattsonicCloudUrl = 'https://www.wattsonic.cloud/api/sys/curve/station/queryStationCurve';
const stationId = '1699670261225848834';

if(!process.env.WS_AUTH) {
    throw new Error('WS_AUTH not defined');
}

export async function getCurve(date: Date): Promise<StationCurve> {
    const payload = {
        date: date.toISOString().split('T')[0],
        durationType: 1,
        stationId,
        stationType: 0,
        timeZoneOffset: -date.getTimezoneOffset(), // to get correct dateStamp values
        type: 'update'
    };
    return axios.post(wattsonicCloudUrl, payload, {
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            Authorization: process.env.WS_AUTH
        }
    })
        .then(response => response.data);
}
