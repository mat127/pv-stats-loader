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
            const query = {
              text:
                'INSERT INTO pv(ts, power, load, battery, meter, soc) VALUES($1, $2, $3, $4, $5, $6)',
              values: [
                  date,
                  Math.round(item.power*100),
                  Math.round(item.loadPower*100),
                  Math.round(item.battery*100),
                  Math.round(item.pMeter*100),
                  Math.round(item.SOC*100)
              ],
            };
            try {
                const res = await pool.query(query);
                console.log(`Inserted curve data for dateStamp: ${date}`);
            } catch (err) {
                console.error('Error inserting curve data:', err);
                break;
            }
        }
    }
}