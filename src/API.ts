import dotenv from "dotenv";
import fetch from 'node-fetch';
import { ArmoryProfile, getSDK } from "@mokoko/sdk";
import { Client } from "@notionhq/client";
import { CharacterSheetObject } from "./type";
import { PageObjectResponse, UpdatePageResponse } from "@notionhq/client/build/src/api-endpoints";

dotenv.config();

export class NotionAPI {
    private static client : Client    

    public static getClient(){
        if(!this.client) this.client = new Client({auth: process.env.NOTION_TOKEN ? process.env.NOTION_TOKEN : ''})
        return this.client
    }
    public async getDatabases(){
      try {   
        return await NotionAPI.getClient().search({
          filter:{
            property: "object",
            value : "database",
          }
        })
      } catch (error) {
        return Promise.reject('Notion API - getDatabases error :: ' + error);
      }
    }

    public async getDatabyDbId(database_id : string){        
      try {
        return await NotionAPI.getClient().databases.query({database_id : database_id})
      } catch (error) {
        return Promise.reject('Notion API - getDatabyDbId error :: ' + error);
      }
    }

    public async resetCheckbox(result : Array<PageObjectResponse>) : Promise<UpdatePageResponse[]>{
      try {
        const updateResponse = await Promise.all(
          result.map((page) => NotionAPI.getClient().pages.update({
              page_id : page.id,
              properties : {
              '완료' : {
                type : "checkbox",
                checkbox : false,
              }}
            })
          )
      )
      return updateResponse;
      } catch (error) {
        return Promise.reject('Notion API - resetCheckbox error :: ' + error);
      }
    }

    async updateItemlevel(notionResult : Array<PageObjectResponse>){
      try {
      const notionSheetcharactersInfo = this.getCharacterSheetObjectbyNotionSheet(notionResult);        
      const lostarkCharactersInfo = await LostarkAPI.prototype.getChracterInfo(notionSheetcharactersInfo); 
      const characterSheetList = this.makeCharacterSheetObject(lostarkCharactersInfo, notionSheetcharactersInfo)            
      const updateResponse =  await Promise.all(
              characterSheetList.map(value =>
                NotionAPI.getClient().pages.update(
                  {
                    page_id : value.pageId,
                    properties : {
                      '아이템 레벨' : {
                        type : 'number',
                        number : Number.parseFloat(value.itemMaxLevel!)
                      }
                    }
                  }
                  ))
            )
        return updateResponse;   
      } catch (error) {
        return Promise.reject('Notion API - updateItemlevel error :: ' + error);
      }   
    }

    private getCharacterSheetObjectbyNotionSheet(notionResult: PageObjectResponse[]) {  
      let characterSheetObj = [] as Array<CharacterSheetObject>
        notionResult.forEach((val)=>{
            if(val.properties['캐릭터 이름'].type === 'title') {
              characterSheetObj = [
                ...characterSheetObj, 
                {
                pageId: val.id,
                characterName: val.properties['캐릭터 이름'].title.map((v) => v.plain_text)[0]
                }]
            }
      })
      return characterSheetObj;
    }
    
    private makeCharacterSheetObject(charactersInfo : (ArmoryProfile)[], characterSheets: (CharacterSheetObject)[]){
      const loaApiResults = charactersInfo.map(res => (
        { 
         characterName : res.CharacterName,
         itemMaxLevel : res.ItemMaxLevel?.replace(",","")
        }
        ));    
    
      const characterSheetObject = characterSheets.map((sheet)=>(
        {
          pageId : sheet.pageId,
          ...loaApiResults?.find(loa=>sheet.characterName === loa.characterName),
        } as CharacterSheetObject
      ))
    
      return characterSheetObject;
    }

}

export class LostarkAPI {
    public async getChracterInfo(characters: (CharacterSheetObject)[])
    {      
      try {
        if(!characters) new Error('notion으로 부터 받은 캐릭터 정보가 없습니다');
        const sdk = getSDK({
          fetchFn: fetch,
          apiKey : process.env.LOSTARK_CLIENT_TOKEN ? process.env.LOSTARK_CLIENT_TOKEN : '',
          limit: 100
        })
        const result = await Promise.all(
          characters.map((character)=> sdk.armoriesGetProfileInfo(character.characterName))              
        );
        return result;
      } catch (error) {
        return Promise.reject('Lostark API - getChracterInfo error :: ' +  error);
      }    
    }
}