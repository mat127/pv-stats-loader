import { APIGatewayProxyResult } from 'aws-lambda';
import { Loader } from "./loader";
import {WattSonicCurveLoader} from "./ws";

interface LoadSchedulerEvent {
  loadLastHours?: number,
  loadYesterday?: boolean
}

export const handler = async (event: LoadSchedulerEvent): Promise<APIGatewayProxyResult> => {
  try {
    const loader = Loader.withPlugins(new WattSonicCurveLoader());
    if (event.loadYesterday) {
      await loader.loadYesterday();
    }
    else if (event.loadLastHours) {
      await loader.loadLastHours(event.loadLastHours);
    }
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Data loaded.`,
      }),
    };
  }
  catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'some error happened',
      }),
    };
  }
}
