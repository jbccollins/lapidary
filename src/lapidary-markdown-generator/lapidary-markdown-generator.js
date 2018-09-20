const operations = require('../../dist/lib/operations.js');
console.log(operations);
const fs = require('fs');

let markdown = "";
markdown += "## Operations";
Object.keys(operations).forEach(k => {
    markdown += `\n### ${k}\n`;
    markdown += `| key | usage | description |\n`;
    markdown += `| -- | -- | -- |`;

    const ops = operations[k];
    Object.keys(ops).forEach(op => {
        markdown += `\n| ${op} | derp | derp |`;
        console.log(markdown)
    });
});

fs.writeFile('markdown.md', markdown, err => {  
    if (err) throw err;
    console.log('Markdown generation finished');
});