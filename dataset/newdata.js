const d3 = require('d3');
// const fs = require('fs');

const data = d3.csvParse("./dataSet.csv", function(data) {
    
    console.log(data[0]);
    return data;
  });

  module.exports = data;

// fs.readFile('../dataset/dataSet.csv', "utf8", (err, data) => {
//     data = d3.csvParse(data);
   
//     console.log(data[0])
// })
