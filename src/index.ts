import { updateChractersSheet, updateRaidSheet } from './sheet';

async function main() {
  const checkboxResult = await updateRaidSheet();  
  console.log('체크박스 업데이트가 완료되었습니다.', checkboxResult);
  const characterResult = await updateChractersSheet();  
  console.log('캐릭터 업데이트가 완료되었습니다.', characterResult);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
