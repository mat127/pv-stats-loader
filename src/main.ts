import { db } from "./db";
import { getCurve } from "./ws";

getCurve(new Date(2023, 9, 26))
    .then(response => db.load(response.data.curve))
    .catch(error => console.log(error));