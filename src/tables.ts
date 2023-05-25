// [0]=실제 공대 레이드 시트 https://www.notion.so/5b8f6fe960054b41b3d52abb964b4fc8 
// [1]=캐릭터 현황 시트 https://www.notion.so/6de6f8d2b9a94e7981f975874bcad5c8
// [2]=던전 시트 https://www.notion.so/e1ad7b8d01d94afbab297be4a5f0424f
const DBTABLES = {
    RAIDSHEET:0,
    ALLCHRACTERS:1,
    DUNGEONS:2
} as const;

export default DBTABLES;