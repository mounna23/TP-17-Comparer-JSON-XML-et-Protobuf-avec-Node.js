const fs = require('fs');
const convert = require('xml-js');
const protobuf = require('protobufjs');

const root = protobuf.loadSync('employee.proto');
const EmployeeList = root.lookupType('Employees');

const employees = [
  {
    id: 1,
    name: 'Ali',
    salary: 9000,
    email: "ali@test.com",
    hireDate: "2020-02-01",
    isManager: false
  },
  {
    id: 2,
    name: 'Kamal',
    salary: 22000,
    email: "kamal@test.com",
    hireDate: "2019-07-12",
    isManager: true
  },
  {
    id: 3,
    name: 'Amal',
    salary: 23000,
    email: "amal@test.com",
    hireDate: "2021-11-23",
    isManager: false
  }
];


const jsonObject = {
  employee: employees
};

// ---------- JSON ----------
let jsonData = JSON.stringify(jsonObject);

// ---------- XML ----------
const options = {
  compact: true,
  ignoreComment: true,
  spaces: 0
};

let xmlData = "<root>\n" + convert.json2xml(jsonObject, options) + "\n</root>";

// ---------- PROTOBUF ----------
let errMsg = EmployeeList.verify(jsonObject);
if (errMsg) throw Error(errMsg);

let message = EmployeeList.create(jsonObject);
let buffer = EmployeeList.encode(message).finish();

// ---------- WRITE FILES ----------
fs.writeFileSync('data.json', jsonData);
fs.writeFileSync('data.xml', xmlData);
fs.writeFileSync('data.proto', buffer);

// ---------- FILE SIZES ----------
const jsonFileSize = fs.statSync('data.json').size;
const xmlFileSize = fs.statSync('data.xml').size;
const protoFileSize = fs.statSync('data.proto').size;

console.log(`Taille de 'data.json' : ${jsonFileSize} octets`);
console.log(`Taille de 'data.xml'  : ${xmlFileSize} octets`);
console.log(`Taille de 'data.proto': ${protoFileSize} octets`);


// ---------- BENCHMARKS ----------

// JSON encode
console.time('JSON encode');
jsonData = JSON.stringify(jsonObject);
console.timeEnd('JSON encode');

// JSON decode
console.time('JSON decode');
let jsonDecoded = JSON.parse(jsonData);
console.timeEnd('JSON decode');

// XML encode
console.time('XML encode');
xmlData = "<root>\n" + convert.json2xml(jsonObject, options) + "\n</root>";
console.timeEnd('XML encode');

// XML decode
console.time('XML decode');
let xmlJson = convert.xml2json(xmlData, { compact: true });
let xmlDecoded = JSON.parse(xmlJson);
console.timeEnd('XML decode');

// Protobuf encode
console.time('Protobuf encode');
message = EmployeeList.create(jsonObject);
buffer = EmployeeList.encode(message).finish();
console.timeEnd('Protobuf encode');

// Protobuf decode
console.time('Protobuf decode');
let decodedMessage = EmployeeList.decode(buffer);
let protoDecoded = EmployeeList.toObject(decodedMessage);
console.timeEnd('Protobuf decode');
