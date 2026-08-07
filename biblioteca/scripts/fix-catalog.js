const fs = require('fs');
const p = require('path').join(__dirname, '..', 'catalog.js');
let c = fs.readFileSync(p, 'utf8');
c = c.replace(
  /\{ id:'juana-lucero'[^}]+\},/,
  "{ id:'juana-lucero', title:'Juana Lucero', author:\"Augusto D'Halmar\", type:'Novela', genre:'Novela', place:'Chile', color:'yellow', year:'1902', hasText:false, license:'Pendiente', source:'—', desc:'Identidad y ciudad en Chile.' },"
);
fs.writeFileSync(p, c);
console.log('fixed');
