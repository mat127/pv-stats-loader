import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { db } from "./db";
import { getCurve } from "./ws";

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const date = new Date();
        console.log(`Loading data of ${date.toISOString()}.`);
        const response = await getCurve(date);
        await db.load(response.data.curve);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Data of ${date.toISOString()} loaded.`,
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
};
