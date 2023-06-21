// [0]=실제 공대 레이드 시트 https://www.notion.so/5b8f6fe960054b41b3d52abb964b4fc8 
// [1]=캐릭터 현황 시트 https://www.notion.so/6de6f8d2b9a94e7981f975874bcad5c8
// [2]=던전 시트 https://www.notion.so/e1ad7b8d01d94afbab297be4a5f0424f
// Notion이 마지막 업데이트한 결과로 시트의 위치가 바뀌는건지, 서버에서 요청을 처리한 순으로 주는건지 위치가 자주바뀜. 쿼리를 요청한 곳에서 sort하여 항상 같은값이 나오도록 유도해야함.
const DBTABLES = {
    RAIDSHEET:0,
    ALLCHRACTERS:1,
    DUNGEONS:2
} as const;

export type NotionSheetTableType = typeof DBTABLES.ALLCHRACTERS | typeof DBTABLES.DUNGEONS | typeof DBTABLES.RAIDSHEET;

export default DBTABLES;