const name = '482731';
use('Users');
const result = db.getCollection('Users-Info').find({username: name}).toArray();
console.log(result);
console.log(result.name);
console.log(result.events);