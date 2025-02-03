
const express = require('express');
const app = express();


async function getApiWithAuthorization(pathURL) {
    const response = await fetch(pathURL, {
        headers: {
            'accept: */*'
            'Authorization': 'hRqyySeXuW3g5a7eu8ESrcDP4QhVDNTgZ7vb'
        }
    });
    const data = await response.json();
    return data;
}

async function getApi(pathURL) {
    const response = await fetch(pathURL);
    const data = await response.json();
    return data;
}

app.get('/', (req, res) => {
  res.send("hello world");
});


app.get('/animals', (req, res) => {

    let listTemp = [];

    getApi('https://restcountries.com/v3.1/all?fields=name,translations,cca2').then(data => {
        data.sort((a, b) => a.name.common.localeCompare(b.name.common));

        // search details of a country
        for (let i = 0; i < data.length; i++) {

            
            getApiWithAuthorization(`https://api.iucnredlist.org/api/v4/countries/${data[i].cca2}`).then(countryData => {
                console.log(countryData);
            });
        }

        res.send(data);
    });
});

app.get('/country', (req, res) => {
 getApi('https://restcountries.com/v3.1/all?fields=name,translations,cca2').then(data => {
        data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        res.send(data);
    });
});
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});