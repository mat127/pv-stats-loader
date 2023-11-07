import { APIGatewayProxyResult } from 'aws-lambda';
import { Loader } from "./loader";

interface LoadSchedulerEvent {
  loadLastHours?: number,
  loadYesterday?: boolean
}

export const handler = async (event: LoadSchedulerEvent): Promise<APIGatewayProxyResult> => {
  try {
    if (event.loadYesterday) {
      await Loader.loadYesterday();
    }
    else if (event.loadLastHours) {
      await Loader.loadLastHours(event.loadLastHours);
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
