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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurve = void 0;
const axios_1 = __importDefault(require("axios"));
const wattsonicCloudUrl = 'https://www.wattsonic.cloud/api/sys/curve/station/queryStationCurve';
const stationId = '1699670261225848834';
function getCurve(date) {
    return __awaiter(this, void 0, void 0, function* () {
        const _date = date !== null && date !== void 0 ? date : new Date();
        console.log(_date);
        const payload = {
            date: _date.toISOString().split('T')[0],
            durationType: 1,
            stationId,
            stationType: 0,
            timeZoneOffset: 60,
            type: 'update'
        };
        return axios_1.default.post(wattsonicCloudUrl, payload, {
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
                Authorization: 'eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2OTg2MDcyMDcsIlVfSUQiOiIxNjk5NjcwMjYxMjIxNjU0NTMwIiwiSVNfQURNSU4iOnRydWUsIk9SR19JRCI6IjE2OTk2NzAyNjEyMTc0NjAyMjUiLCJDUkVBVEVfVElNRSI6MTY5ODYwNzIwNzA0Mn0.b__mQhzyKolEEsRdTGYJLDI-8lUZ9aGWOXStIaN-B4A'
            }
        })
            .then(response => response.data);
    });
}
exports.getCurve = getCurve;
