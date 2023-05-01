import { Client } from "@notionhq/client";
import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const databseID : string = process.env.NOTION_DATABASE_ID ? process.env.NOTION_DATABASE_ID : "";
  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });

  const response = await notion.databases.query({  
    database_id: databseID,
  });
  const result = response.results as Array<PageObjectResponse>;
  updateCheckbox(databseID, result);
}

async function updateCheckbox(database_id : string, result : Array<PageObjectResponse>) {

  const resetCheckbox = result.map((val, idx)=>({
    ...val,
    properties : {
      ...val.properties,
      완료: {
        ...val.properties.완료,
        checkbox : false
      }
    }
  }))

}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
