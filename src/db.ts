import { Pool } from 'pg'
import { CurveItem } from './ws'
 
if(!process.env.DB_URL) {
    throw new Error('DB_URL is not defined');
}

const pool = new Pool({
  connectionString: process.env.DB_URL
});
 
export const db = {
    load: async function (data: CurveItem[]) {
        for (const item of data) {
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
          await pool.query(query);
        }
    }
}