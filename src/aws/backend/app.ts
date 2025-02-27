/*
  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
  Modifications copyright 2024 Fireproof Storage Incorporated. All Rights Reserved.
  Permission is hereby granted, free of charge, to any person obtaining a copy of this
  software and associated documentation files (the "Software"), to deal in the Software
  without restriction, including without limitation the rights to use, copy, modify,
  merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
  permit persons to whom the Software is furnished to do so.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
  INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
  PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
  HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

// 'use strict'
// import AWS from 'aws-sdk'
// import { DynamoDB, Lambda, S3 } from 'aws-sdk';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { InvocationRequest, Lambda } from "@aws-sdk/client-lambda";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
// import { CID } from "multiformats";
// import { base64pad } from 'multiformats/bases/base64'
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
// import { S3Client } from '@aws-sdk/client-s3'
import { DynamoDBDocumentClient, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
// import { InvocationRequest } from 'aws-sdk/clients/lambda'

// AWS.config.update({region: 'us-east-1'})
// AWS.config.update({ region: process.env.AWS_REGION })
const client = new DynamoDBClient({
  region: "local",
  endpoint: "http://tests-dynamo-1:8000",
});
const dynamo = DynamoDBDocumentClient.from(client);
const lambda = new Lambda();
const tableName = "metaStore";
// const s3 = new S3Client({
//   // signatureVersion: 'v4'
// })

// Change this value to adjust the signed URL's expiration
const URL_EXPIRATION_SECONDS = 300;

// Main Lambda entry point
export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // return {
  //   statusCode: 200,
  //   headers: {
  //     'Access-Control-Allow-Origin': '*'
  //   },
  //   body: JSON.stringify(event),
  // }
  return getUploadURL(event)
    .catch((error) => {
      // console.error('Error:', error)
      return {
        status: 500,
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: error.message,
          // error: error.message,
        }),
      };
    })
    .then((response) => {
      return {
        statusCode: 200,
        headers: {
          "content-type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: response as string,
      };
    });
}

async function getUploadURL(event: APIGatewayProxyEvent): Promise<string> {
  const { queryStringParameters } = event;
  if (!queryStringParameters) {
    throw new Error("Missing query parameters");
  }
  const type = queryStringParameters.type;
  const name = queryStringParameters.name;
  const key = queryStringParameters.key;
  const suffix = queryStringParameters.suffix ?? "";
  if (!type || !name || !key) {
    throw new Error("Missing name or type query parameter: " + event.path);
  }

  // let s3Params

  if (type === "data" || type === "file" || type === "car" || type === "wal") {
    // throw new Error('Unsupported upload type: ' + type)

    // const name = queryStringParameters.name
    // const carCid = queryStringParameters.car
    // if (!carCid || !name) {
    //   throw new Error('Missing name or car query parameter: ' + event.rawQueryString)
    // }

    // // const cid = CID.parse(carCid)
    // // const checksum = base64pad.baseEncode(cid.multihash.digest)

    // // const Key = `${type}/${name}/${cid.toString()}.car`
    // const Key = `${name}/data/${cid.toString()}.car`
    let path: string;
    switch (type) {
      case "car":
      case "data":
      case "file":
        path = `${name}/data/${key}${suffix}`;
        break;
      case "wal":
        path = `${name}/wal/${key}.json`;
        break;
      default:
        throw new Error("Unsupported upload type: " + type);
    }
    const s3Params = uploadParams(path);

    const client = new S3Client({
      credentials: {
        accessKeyId: process.env.OVERRIDE_AWS_ACCESS_KEY_ID ?? (process.env.AWS_ACCESS_KEY_ID as string),
        secretAccessKey: process.env.OVERRIDE_AWS_SECRET_ACCESS_KEY ?? (process.env.AWS_SECRET_ACCESS_KEY as string),
      },
      endpoint: process.env.AWS_ENDPOINT,
      region: process.env.AWS_REGION,
    });
    let command;
    if (event.httpMethod === "PUT") {
      command = new PutObjectCommand({
        Bucket: s3Params.Bucket,
        Key: s3Params.Key,
      });
    } else {
      command = new GetObjectCommand({
        Bucket: s3Params.Bucket,
        Key: s3Params.Key,
      });
    }
    const uploadURL = await getSignedUrl(client, command, { expiresIn: 3600 });
    return JSON.stringify({
      // ...process.env,
      uploadURL: uploadURL,
      Key: s3Params.Key,
    });
  } else if (type === "meta") {
    return metaUploadParams(queryStringParameters, event);
  } else {
    throw new Error("Unsupported upload type: " + type);
  }
}

async function invokelambda(_event: APIGatewayProxyEvent, tableName: string, dbname: string) {
  const command = new QueryCommand({
    ExpressionAttributeValues: {
      ":v1": {
        S: dbname,
      },
    },
    ExpressionAttributeNames: {
      "#nameAttr": "name",
      "#dataAttr": "data",
    },
    KeyConditionExpression: "#nameAttr = :v1",
    ProjectionExpression: "cid, #dataAttr",
    TableName: tableName,
  });
  const data = await dynamo.send(command);
  const items: Record<string, unknown>[] = [];
  if (data.Items && data.Items.length > 0) {
    throw new Error("Failed to get metadata from DynamoDB");
    // items = data.Items.map((item) => DynamoDB.Converter.unmarshall(item));
  }

  const extractedName = dbname.match(/\.([^.]+)\./)?.[1];

  const event = {
    body: JSON.stringify({
      action: "sendmessage",
      data: JSON.stringify({ items }),
    }),
    API_ENDPOINT: process.env.API_ENDPOINT,
    databasename: extractedName,
  };

  // eslint-disable-next-line no-restricted-globals
  const ec = new TextEncoder();
  const params: InvocationRequest = {
    FunctionName: process.env.SendMessage as string,
    InvocationType: "RequestResponse",
    Payload: ec.encode(JSON.stringify(event)),
  };

  const returnedresult = await lambda.invoke(params); // .promise();
  // eslint-disable-next-line no-restricted-globals
  const dc = new TextDecoder();
  const result = JSON.parse(dc.decode(returnedresult.Payload));
  return result;
}

async function metaUploadParams(
  queryStringParameters: APIGatewayProxyEvent["queryStringParameters"],
  event: APIGatewayProxyEvent
) {
  if (!queryStringParameters) {
    throw new Error("Missing query parameters");
  }
  // console.log(">>>>metaUploadParams-x");
  const name = queryStringParameters.name;
  if (!name) {
    throw new Error("Missing name query parameter: " + event.path);
  }
  // console.log(">>>>metaUploadParams-y", event);
  const httpMethod = event.httpMethod;
  // console.log(">>>>metaUploadParams", httpMethod);
  if (httpMethod == "PUT") {
    // console.log(">>>>metaUploadParams-1", event.body);
    const requestBody = JSON.parse(event.body as string);
    if (requestBody) {
      const { data, cid, parents } = requestBody;
      if (!data || !cid) {
        throw new Error("Missing data or cid from the metadata:" + event.path);
      }

      //name is the partition key and cid is the sort key for the DynamoDB table
      await dynamo.send(
        new PutCommand({
          TableName: tableName,
          Item: {
            name: name,
            cid: cid,
            data: data,
          },
        })
      );

      for (const p of parents) {
        await dynamo.send(
          new DeleteCommand({
            TableName: tableName,
            Key: {
              name: name,
              cid: p,
            },
          })
        );
      }

      try {
        const result = await invokelambda(event, tableName, name);
        // eslint-disable-next-line no-console
        console.log("This is the response", result);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error, "This is the error when calling other Lambda");
        throw new Error("Failed to connected to websocket server");
        // return {
        //   statusCode: 500,
        //   body: JSON.stringify({ error: "Failed to connected to websocket server" }),
        // };
      }
      return JSON.stringify({ message: "Metadata has been added" });
      // return {
      //   status: 201,
      //   body: JSON.stringify({ message: "Metadata has been added" }),
      // };
    } else {
      throw new Error("JSON Payload data not found!");
      // return {
      //   status: 400,
      //   body: JSON.stringify({ message: "JSON Payload data not found!" }),
      // };
    }
  } else if (httpMethod === "GET") {
    //console.log(">>>>metaUploadParams-A", httpMethod);
    const command = new QueryCommand({
      ExpressionAttributeValues: {
        ":v1": {
          S: name,
        },
      },
      ExpressionAttributeNames: {
        "#nameAttr": "name",
        "#dataAttr": "data",
      },
      KeyConditionExpression: "#nameAttr = :v1",
      ProjectionExpression: "cid, #dataAttr",
      TableName: tableName,
    });
    //console.log(">>>>metaUploadParams-B", httpMethod);
    let data;
    try {
      data = await dynamo.send(command);
      //console.log(">>>>metaUploadParams-C", httpMethod, data, data.Items, data.Items.length);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      //console.log(">>>>metaUploadParams-D", httpMethod, error);
    }
    // const data = await dynamoDB.scan(params).promise();
    //This means items is an array of objects where each object contains a string key and a value of any type
    //: { [key: string]: any; }[]
    if (data && data.Items && data.Items.length > 0) {
      // const items: Record<string, unknown>[] = []
      //console.log(">>>>metaUploadParams-E", data.Items);
      // items = data.Items.map(item => DynamoDB.Converter.unmarshall(item))
      // return {
      //   status: 200,
      //   body: JSON.stringify({ items })
      // }
      return JSON.stringify({ items: data.Items });
    } else {
      return JSON.stringify({ items: [] });
    }
  } else {
    throw new Error("Invalid HTTP method");
  }
}

function uploadParams(Key: string) {
  // const name = queryStringParameters.name
  // const carCid = queryStringParameters.car
  // if (!carCid || !name) {
  //   throw new Error('Missing name or car query parameter: ' + event.rawQueryString)
  // }

  // // const cid = CID.parse(carCid)
  // // const checksum = base64pad.baseEncode(cid.multihash.digest)

  // // const Key = `${type}/${name}/${cid.toString()}.car`
  // const Key = `${name}/data/${cid.toString()}.car`

  const s3Params = {
    Bucket: process.env.UploadBucket,
    Key,
    Expires: URL_EXPIRATION_SECONDS,
    ContentType: "application/car",
    // ChecksumSHA256: checksum,
    ACL: "public-read",
  };
  return s3Params;
}
