import { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { NotionAPI } from "./API";
import DBTABLES, {NotionSheetTableType} from "./tables";

export async function updateRaidSheet(){
    const result = await getSheetTableData(DBTABLES.RAIDSHEET);    
    return await NotionAPI.prototype.resetCheckbox(result);
}

export async function updateChractersSheet(){  
  const result = await getSheetTableData(DBTABLES.ALLCHRACTERS)
  return await NotionAPI.prototype.updateItemlevel(result);
}

async function getSheetTableData(SHEET : NotionSheetTableType) : Promise<Array<PageObjectResponse>>{
  const databases = await NotionAPI.prototype.getDatabases();
  const sortdatabases = databases.results.sort((a,b)=>a.id === b.id ? 0 : a.id > b.id ? 1 : -1)  
  const response = await NotionAPI.prototype.getDatabyDbId(sortdatabases[SHEET].id);
  const result = response.results as Array<PageObjectResponse>
  return result
}