"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const pg_1 = require("pg");
if (!process.env.DB_URL) {
    throw new Error('DB_URL is not defined');
}
const pool = new pg_1.Pool({
    connectionString: process.env.DB_URL
});
exports.db = {
    load: function (data) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const item of data) {
                const date = new Date(item.dateStamp);
                const query = {
                    text: 'INSERT INTO pv(ts, power, load, battery, meter, soc) VALUES($1, $2, $3, $4, $5, $6)',
                    values: [
                        date,
                        Math.round(item.power * 100),
                        Math.round(item.loadPower * 100),
                        Math.round(item.battery * 100),
                        Math.round(item.pMeter * 100),
                        Math.round(item.SOC * 100)
                    ],
                };
                try {
                    const res = yield pool.query(query);
                    console.log(`Inserted curve data for dateStamp: ${date}`);
                }
                catch (err) {
                    console.error('Error inserting curve data:', err);
                    break;
                }
            }
        });
    }
};
