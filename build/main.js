"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
const ws_1 = require("./ws");
(0, ws_1.getCurve)(new Date(2023, 9, 26))
    .then(response => db_1.db.load(response.data.curve))
    .catch(error => console.log(error));
