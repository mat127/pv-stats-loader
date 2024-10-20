import { Pool } from 'pg'
import { StationStatsItem } from './ws'
 
if(!process.env.DB_URL) {
    throw new Error('DB_URL is not defined');
}

const pool = new Pool({
  connectionString: process.env.DB_URL
});
 
export const db = {
  load: async function (item: StationStatsItem) {
    const date = new Date(item.timestamp);
    const fixed = { // store 0 if value is missing
      power: item.pv_power ?? 0,
      loadPower: item.load_power ?? 0,
      battery: item.battery_power ?? 0,
      pMeter: item.meter_power ?? 0,
      SOC: item.soc ?? 0
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
    await pool.query(query);
  }
}
