const hozir = new Date();

// Mahalliy vaqtni ISO formatiga moslash (vaqt zonasini hisobga olgan holda)
const offset = hozir.getTimezoneOffset() * 60000; 
const mahalliyVaqt = new Date(hozir - offset).toISOString().split('.')[0];

console.log(mahalliyVaqt); 
// Natija: 2026-01-21T22:48:12 (Hozirgi vaqtga qarab)