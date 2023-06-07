import { updateChractersSheet, updateRaidSheet } from './sheet';

async function main() {
  await updateRaidSheet();
  await updateChractersSheet();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
