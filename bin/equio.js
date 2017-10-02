(async () => {
  // eslint-disable-next-line no-console
  console.log('Testing async/await for three seconds...');

  await new Promise(resolve => {
    setTimeout(resolve, 3000);
  });

  // eslint-disable-next-line no-console
  console.log('Waited three seconds.');
})();
