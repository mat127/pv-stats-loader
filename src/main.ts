import { db } from "./db";
import { getCurve } from "./ws";

const since = new Date("2023-09-16");
const till = new Date("2023-10-30");

async function load(since: Date, till: Date) {
  for(let date = new Date(since); date <= till;
      date.setTime(date.getTime() + 24*60*60*1000)
  ) {
    console.log(`Loading data of ${date.toISOString()}.`);
    const response = await getCurve(date);
    await db.load(response.data.curve);
  }
}

load(since, till)
  .then(() => console.log("Done."));