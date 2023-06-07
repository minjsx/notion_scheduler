import { PageObjectResponse, UpdatePageResponse } from "@notionhq/client/build/src/api-endpoints";
import { ArmoryProfile } from "@mokoko/sdk";
import { NotionAPI, LostarkAPI } from "./API";
import { CharacterSheetObject } from "./type";
import DBTABLES from "./tables";


export async function updateRaidSheet(){
    const databases = await NotionAPI.prototype.getDatabases();    
    const response = await NotionAPI.prototype.getDatabyDbId(databases.results[DBTABLES.RAIDSHEET].id);
    const result = response.results as Array<PageObjectResponse>    
    await resetCheckbox(result);
}

export async function updateChractersSheet(){
  const databases = await NotionAPI.prototype.getDatabases();    
  const response = await NotionAPI.prototype.getDatabyDbId(databases.results[DBTABLES.ALLCHRACTERS].id);
  const result = response.results as Array<PageObjectResponse>    
  await updateItemlevel(result);
}

async function resetCheckbox(result : Array<PageObjectResponse>) : Promise<UpdatePageResponse[]>{
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
}

async function updateItemlevel(notionResult : Array<PageObjectResponse>){
  try {
  //notion sheet에서 업데이트 할 page_id와 character_name이 담긴 배열을 가져옴
  const characters = getCharacterSheetObjectbyNotionSheet(notionResult);
  //Lostark API를 통해 각각의 character_name으로 관련 정보를 가져옴
  const result = await LostarkAPI.prototype.getChracterInfobyNotionSheet(characters);
  if(!result) return new Error('notion에서 캐릭터 이름을 불러오지 못했습니다.');
  //해당 정보와 캐릭터배열로 chracterSheet에 들어갈 데이터로 가공
  const characterSheetList = makeCharacterSheetObject(result, characters)

  // notion 각 페이지에 각각 업데이트
  const updateResponse =  await Promise.all(
    characterSheetList.map((value) => value && NotionAPI.getClient().pages.update({
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
    return updateResponse;   
  } catch (error) {
    console.error(error);
  }   
}

function getCharacterSheetObjectbyNotionSheet(notionResult: PageObjectResponse[]) {
  return notionResult.map(
    (value) => value.properties['캐릭터 이름'].type === 'title' &&
      {
        pageId: value.id,
        characterName: value.properties['캐릭터 이름'].title.map((v) => v.plain_text)[0]
      } as CharacterSheetObject
  );
}

function makeCharacterSheetObject(result : (false | ArmoryProfile)[], characters: (false | CharacterSheetObject)[]){
  // notion sheet의 캐릭터 배열의 이름과 일치하는 배열의 오브젝트를 가져와서 다시 완전한 CharacterSheetObject를 만듬.
  const loaResponse = result.map((res)=> res && { characterName : res.CharacterName, itemMaxLevel : res.ItemMaxLevel?.replace(",","") });    
  // 가져온 결과로 필요한 '캐릭터명'과, 해당캐릭의 '최고달성레벨'만 선별해서 리스트화함 (number로 바꿔야해서 ','를 없애야 함)
  const obj = characters.map((sheet)=>sheet && 
  {
    pageId : sheet.pageId,
    ...loaResponse?.find(loa=>loa && sheet.characterName === loa.characterName),
  } as CharacterSheetObject
  )  
  return obj;
}