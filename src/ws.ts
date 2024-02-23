import axios from 'axios';
import {getDateString} from "./date";
import {LoaderPlugin} from "./loader";
import {db} from "./db";

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

export class WattSonicCurveLoader implements LoaderPlugin<CurveItem> {

  async load(date: Date): Promise<CurveItem[]> {
    const payload = {
      date: getDateString(date),
      durationType: 1,
      stationId: process.env.STATION_ID,
      stationType: 0,
      timeZoneOffset: -date.getTimezoneOffset(), // to get correct dateStamp values
      type: 'init'
    };
    const auth = await token.get();
    const response = await axios.post(
      `${wattsonicCloudUrl}/curve/station/queryStationCurve`,
      payload,
      {
        headers: {
          'Content-type': 'application/json',
          Authorization: auth
        }
      }
    );
    return response.data.data.curve;
  }

  getTimeOf(item: CurveItem): number {
    return item.dateStamp;
  }

  async save(item: CurveItem) {
    const date = new Date(item.dateStamp);
    const fixed = { // store 0 if value is missing
      power: item.power ?? 0,
      loadPower: item.loadPower ?? 0,
      battery: item.battery ?? 0,
      pMeter: item.pMeter ?? 0,
      SOC: item.SOC ?? 0
    };
    const query = {
      text: `INSERT INTO pv(ts, power, load, battery, meter, soc)
                     VALUES($1, $2, $3, $4, $5, $6)
                     ON CONFLICT (ts) DO UPDATE SET power=excluded.power, load=excluded.load,
                      battery=excluded.battery, meter=excluded.meter, soc=excluded.soc`,
      values: [
        date,
        Math.round(fixed.power*1000),
        Math.round(fixed.loadPower*1000),
        Math.round(fixed.battery*1000),
        Math.round(fixed.pMeter*1000),
        Math.round(fixed.SOC*100)
      ],
    };
    await db.pool.query(query);
  }
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
