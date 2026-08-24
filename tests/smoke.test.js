const assert = require('node:assert/strict');
const { parsePositiveSongId } = require('../utils/requestValidation');
const { getAllSongs } = require('../services/songService');

assert.equal(parsePositiveSongId('12'), 12);
assert.equal(parsePositiveSongId('0'), null);
assert.equal(parsePositiveSongId('-1'), null);
assert.equal(parsePositiveSongId('abc'), null);

async function run() {
  process.env.NODE_ENV = 'development';
  const fallbackSongs = await getAllSongs({ page: 1, limit: 2 });
  assert.equal(fallbackSongs.length, 2);

  process.env.NODE_ENV = 'production';
  await assert.rejects(
    () => getAllSongs({ page: 1, limit: 2 }),
    error => error.code === 'DB_UNAVAILABLE'
  );

  console.log('Smoke tests passed');
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
