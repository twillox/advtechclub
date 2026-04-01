const fs = require('fs');
fs.readdirSync('./routes').forEach(f => {
  if (f.endsWith('.js')) {
    try {
      require('./routes/' + f);
      console.log(f + ' OK');
    } catch (e) {
      console.error(f + ' ERROR:', e.stack);
    }
  }
});
