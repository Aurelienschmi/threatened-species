
const express = require('express');
const app = express();

async function getApi(pathURL) {
    const response = await fetch(pathURL);
    const data = await response.json();
    console.log(data);
    return data;
}


app.get('/', (req, res) => {
  res.send("hello world");
});

app.get('/country', (req, res) => {
    getApi('https://restcountries.com/v3.1/all?fields=name,translations,cca2').then(data => {
        data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        res.send(data);
    });
});
app.
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});