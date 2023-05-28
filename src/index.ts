import { Client } from "@notionhq/client";
import { PageObjectResponse, QueryDatabaseResponse, UpdatePageResponse } from "@notionhq/client/build/src/api-endpoints";
import dotenv from "dotenv";
import DBTABLES from './tables';

dotenv.config();

async function main() {
   const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });
  resetCheckbox(notion);
}

async function getDatabyDbId(notion : Client, database_id : string) : Promise<QueryDatabaseResponse> {
  return notion.databases.query({database_id})
}

async function resetCheckbox(notion : Client) : Promise<Promise<UpdatePageResponse>[]>{
  const api_master = await notion.search({
    filter:{
      property: "object",
      value : "database",
    }
  })  
  const databaseID = api_master.results[DBTABLES.RAIDSHEET].id;
  const response = await getDatabyDbId(notion,databaseID);
  const result  = response.results as Array<PageObjectResponse>;
  const updateResponse = await result.map((page) => notion.pages.update({
                                  page_id : page.id,
                                  properties : {
                                  '완료' : {
                                    type : "checkbox",
                                    checkbox : false,
                                  }}
                                })
                              )
  return updateResponse;
}


main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
