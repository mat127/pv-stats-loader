import {Loader} from "./loader";
import {truncateToDate, yesterday} from "./date";
import {WattSonicCurveLoader} from "./ws";
import {IntraDayMarketLoader} from "./ote";

const since = process.argv.length > 2 ?
  new Date(process.argv[2]) : truncateToDate(yesterday());
const till = process.argv.length > 3 ?
  new Date(process.argv[3]) : new Date();
console.log(`Will load data since ${since} till ${till}.`);

Loader.withPlugins(
  //new WattSonicCurveLoader(),
  new IntraDayMarketLoader()
)
  .loadDays(since, till)
  .then(() => console.log("Done."));