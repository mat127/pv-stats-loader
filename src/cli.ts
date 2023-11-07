import { db } from "./db";
import { getCurve } from "./ws";

function plusHours(date: Date, hours: number): Date {
  return new Date(date.getTime() + hours*60*60*1000);
}

function yesterday(): Date {
  return plusHours(new Date(), -24);
}

const since = process.argv.length > 2 ?
  new Date(process.argv[2]) : yesterday();
const till = process.argv.length > 3 ?
  new Date(process.argv[3]) : new Date();
console.log(`Will load data since ${since} till ${till}.`);

async function load(since: Date, till: Date) {
  for(let date = new Date(since); date <= till;
      date = plusHours(date, 24)
  ) {
    console.log(`Loading data of ${date.toISOString()}.`);
    const response = await getCurve(date);
    await db.load(response.data.curve);
  }
}

load(since, till)
  .then(() => console.log("Done."));