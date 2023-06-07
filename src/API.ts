import dotenv from "dotenv";
import fetch from 'node-fetch';
import { getSDK } from "@mokoko/sdk";
import { Client } from "@notionhq/client";
import { CharacterSheetObject } from "./type";

dotenv.config();

export class NotionAPI {
    private static client : Client
    

    public static getClient(){
        if(!this.client){      
          this.client = new Client({auth: process.env.NOTION_TOKEN ? process.env.NOTION_TOKEN : ''})
        }
        return this.client
    }

    public async getDatabases(){
        return await NotionAPI.getClient().search({
          filter:{
            property: "object",
            value : "database",
          }
        })
    }

    public async getDatabyDbId(database_id : string){        
        return await NotionAPI.getClient().databases.query({database_id : database_id})
    }

}


export class LostarkAPI {
    public async getChracterInfobyNotionSheet(characters: (false | CharacterSheetObject)[])
    {      
      if(!characters) return false;

      const sdk = getSDK({
        fetchFn: fetch,
        apiKey : process.env.LOSTARK_CLIENT_TOKEN ? process.env.LOSTARK_CLIENT_TOKEN : '',
        limit: 100
      })
    
      //노션 시트 배열에서 가져온 캐릭터 이름들을 가져와서 lostark api에 요청
      const result = await Promise.all(
        characters.map((name)=> name && sdk.armoriesGetProfileInfo(name.characterName))              
      );
      return result;
    }
}