import axios from 'axios';

export interface DataItem {
    value?: string
}

export interface StatsData {
    errorCode: number,
    info: string,
    body: {
        legend: string[],
        unit: string[],
        xaxis: string[],
        data: DataItem[][]
    }
}

export interface StationStatsItem {
    timestamp: number,
    pv_power?: number,
    meter_power?: number,
    battery_power?: number,
    soc?: number,
    load_power?: number
}

const wattsonicCloudUrl = 'https://lb-eu.solinteg-cloud.com/gen2api/pc';
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
            `${wattsonicCloudUrl}/user/login`,
            process.env.WS_LOGIN_PAYLOAD,
            {
                headers: { 'Content-type': 'application/json; charset=UTF-8' }
            }
        )
            .then(response => response.data.body[0]);
    }
};

function getDateString(date: Date): string {
  const month = date.getMonth() + 1;
  const dayOfMonth = date.getDate();
  return `${date.getFullYear()}-${month.toString().padStart(2, '0')}-${dayOfMonth.toString().padStart(2, '0')}`;
}

export async function getStats(date: Date): Promise<StationStatsItem[]> {
    const getParams = {
        date: getDateString(date),
        dateType: "DAY",
        stationId: process.env.STATION_ID
    };
    const auth = await token.get();
    const response = await axios.get(`${wattsonicCloudUrl}/owner/station/statistics/station/new`, {
        headers: {
            token: auth
        },
        params: getParams
    });
    if (response.status != 200) {
        throw new Error("non OK HTTP status");
    }
    else if(response.data.errorCode != 0) {
        throw new Error("errorCode != 0");
    }
    return parseStatsResponse(date, response.data);
}

function parseStatsResponse(date: Date, data: StatsData): StationStatsItem[] {
    const baseTimestamp = date.getTime();
    return data.body.xaxis.map((timeStr, index) => {
        return {
            timestamp: parseTimestamp(baseTimestamp, timeStr),
            pv_power: parseDataItem(data.body.data[0][index]),
            meter_power: parseDataItem(data.body.data[1][index]),
            battery_power: parseDataItem(data.body.data[2][index]),
            soc: parseDataItem(data.body.data[3][index]),
            load_power: parseDataItem(data.body.data[4][index])
        };
    });
}

function parseTimestamp(baseTimestamp: number, timeStr: string): number {
    const [hours, minutes, seconds] = timeStr.split(":").map(Number);
    const offset = (hours*60*60 + minutes*60 + seconds) * 1000;
    return baseTimestamp + offset;
}

function parseDataItem(item?: DataItem): number | undefined {
    return item !== null && item !== undefined ? Number(item.value) : undefined;
}