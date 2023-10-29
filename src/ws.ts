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

export async function getCurve(date?: Date): Promise<StationCurve> {
    const _date = date ?? new Date();
    const payload = {
        date: _date.toISOString().split('T')[0],
        durationType: 1,
        stationId,
        stationType: 0,
        timeZoneOffset: 60,
        type: 'update'
    };
    return axios.post(wattsonicCloudUrl, payload, {
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            Authorization: 'eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2OTg2MDcyMDcsIlVfSUQiOiIxNjk5NjcwMjYxMjIxNjU0NTMwIiwiSVNfQURNSU4iOnRydWUsIk9SR19JRCI6IjE2OTk2NzAyNjEyMTc0NjAyMjUiLCJDUkVBVEVfVElNRSI6MTY5ODYwNzIwNzA0Mn0.b__mQhzyKolEEsRdTGYJLDI-8lUZ9aGWOXStIaN-B4A'
        }
    })
        .then(response => response.data);
}
