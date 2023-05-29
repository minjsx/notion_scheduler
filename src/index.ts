import { ArmoryProfile, CharacterInfo, getSDK } from '@mokoko/sdk';
import fetch from 'node-fetch';
import { Client } from "@notionhq/client";
import { PageObjectResponse, QueryDatabaseResponse, UpdatePageResponse } from "@notionhq/client/build/src/api-endpoints";
import dotenv from "dotenv";
import DBTABLES from './tables';
import { CharacterSheetObject } from './type';
dotenv.config();

async function main() {
   const notion = new Client({
    auth: process.env.NOTION_TOKEN ? process.env.NOTION_TOKEN : '',
  });

  const api_master = await notion.search({
    filter:{
      property: "object",
      value : "database",
    }
  })    
  const raidResponse = await getDatabyDbId(notion,api_master.results[DBTABLES.RAIDSHEET].id);
  const raidResult  = raidResponse.results as Array<PageObjectResponse>;
  const characterResponse = await getDatabyDbId(notion,api_master.results[DBTABLES.ALLCHRACTERS].id);    
  const characterResult  = characterResponse.results as Array<PageObjectResponse>;  

  await updateItemlevel(notion, characterResult);
  await resetCheckbox(notion, raidResult);
}

async function getDatabyDbId(notion : Client, database_id : string) : Promise<QueryDatabaseResponse> {
  return notion.databases.query({database_id})
}

async function resetCheckbox(notion : Client, notionResult : Array<PageObjectResponse>) : Promise<Promise<UpdatePageResponse>[]>{
  const updateResponse = await notionResult.map((page) => notion.pages.update({
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

async function updateItemlevel(notion : Client, notionResult : Array<PageObjectResponse>){
 
  //notion sheet에서 업데이트 할 page_id와 character_name이 담긴 배열을 가져옴
  const characters = notionResult.map(
    (value) => value.properties['캐릭터 이름'].type === 'title' && 
    {
      pageId : value.id,
      characterName : value.properties['캐릭터 이름'].title.map((v)=>v.plain_text)[0]
    }  as CharacterSheetObject
  );    

  const result = await getChracterInfo(characters);
  const finds = makeCharacterSheetObject(result!, characters)

  // notion 각 페이지에 각각 업데이트
  const updateResponse =  await Promise.all(
    finds.map((value) => value && notion.pages.update({
                                  page_id : value.pageId,
                                  properties : {
                                      '아이템 레벨' : {
                                      type : 'number',
                                      number : Number.parseFloat(value.itemMaxLevel!)
                                      }
                                    }
                                  })
             )
  )
  console.log(updateResponse);
}

async function getChracterInfo(characters: (false | CharacterSheetObject)[])
{
  const sdk = getSDK({
    fetchFn: fetch,
    apiKey : process.env.LOSTARK_CLIENT_TOKEN ? process.env.LOSTARK_CLIENT_TOKEN : '',
    limit:100
  })
  //노션 시트 배열에서 가져온 캐릭터 이름을 가져와서 lostark api에 요청
  if (characters) {
    const result = await Promise.all(
      characters.map((name)=> name && sdk.armoriesGetProfileInfo(name.characterName))              
    );
    return result;
  }
}

function makeCharacterSheetObject(result : (false | ArmoryProfile)[], characters: (false | CharacterSheetObject)[]){
  // notion sheet의 캐릭터 배열의 이름과 일치하는 배열의 오브젝트를 가져와서 다시 완전한 CharacterSheetObject를 만듬.
  const res = result?.map((res)=> res && { characterName : res.CharacterName, itemMaxLevel : res.ItemMaxLevel?.replace(",","") });    
  // 가져온 결과로 필요한 '캐릭터명'과, 해당캐릭의 '최고달성레벨'만 선별해서 리스트화함 (number로 바꿔야해서 ','를 없애야 함)
  const obj = characters.map((v)=>v && 
  {
    pageId : v.pageId,
    ...res?.find(va=>va && v.characterName === va.characterName),
  } as CharacterSheetObject
  )  
  return obj;
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
