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

const wattsonicCloudUrl = 'https://www.wattsonic.cloud/api/sys';
if(!process.env.STATION_ID) {
    throw new Error("STATION_ID not defined");
}
if(!process.env.WS_LOGIN_PAYLOAD) {
    throw new Error("WS_LOGIN_PAYLOAD not defined");
}
const token = {
    value: '',
    get: async function(): Promise<string> {
        if (!this.value) {
            this.value = await this.load();
        }
        return this.value!;
    },
    load: async function(): Promise<string> {
        return axios.post(
            `${wattsonicCloudUrl}/login/manager`,
            process.env.WS_LOGIN_PAYLOAD,
            {
                headers: { 'Content-type': 'application/json; charset=UTF-8' }
            }
        )
            .then(response => response.data.data.token);
    }
};

function getDateString(date: Date): string {
  const month = date.getMonth() + 1;
  const dayOfMonth = date.getDate();
  return `${date.getFullYear()}-${month.toString().padStart(2, '0')}-${dayOfMonth.toString().padStart(2, '0')}`;
}

export async function getCurve(date: Date): Promise<StationCurve> {
    const payload = {
        date: getDateString(date),
        durationType: 1,
        stationId: process.env.STATION_ID,
        stationType: 0,
        timeZoneOffset: -date.getTimezoneOffset(), // to get correct dateStamp values
        type: 'init'
    };
    const auth = await token.get();
    return axios.post(`${wattsonicCloudUrl}/curve/station/queryStationCurve`, payload, {
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
            Authorization: auth
        }
    })
        .then(response => response.data);
}
