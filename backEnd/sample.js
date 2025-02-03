const axios = require('axios');
const express = require('express');
const app = express();



async function getApiWithAuthorization(pathURL) {
  const response = await axios.get(pathURL, {
    headers: {
      'accept': 'application/json',
      'Authorization': 'hRqyySeXuW3g5a7eu8ESrcDP4QhVDNTgZ7vb'
    }
  });
  return response.data;
}

async function getApi(pathURL) {
  const response = await axios.get(pathURL);
  return response.data;
}

app.get('/', (req, res) => {
  res.send("hello world");
});

app.get('/animal-FR', (req, res) => {
    getApiWithAuthorization('https://api.iucnredlist.org/api/v4/countries/FR').then(data => {
        res.send(data);
    })
});

app.get('/test', async (req, res) => {
  try {
    const data = await getApi('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
    return res.json(data); 
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.get('/animals', (req, res) => {

    getApi('https://restcountries.com/v3.1/all?fields=name,translations,cca2').then(data => {
        data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        let dataCountryCode = [];


        data.map((item, index) => { 

            getApiWithAuthorization(`https://api.iucnredlist.org/api/v4/countries/FR`).then(dataAu => {
                dataCountryCode.push(dataAu);
            });

        });


        setTimeout(() => {
            dataCountryCode.map((item, index) => {
                console.log(item);
                res.send(item);
            });
        }, 3000);

        // data.map(country => {
        //     dataCountryCode.push(getApiWithAuthorization(`https://api.iucnredlist.org/api/v4/countries/${country.cca2}`));
        //     res.send(dataCountryCode);
        // });

        console.log("promises");
        console.log(dataCountryCode)
        


        console.log("promises");
        dataCountryCode.map((item, index) => {
            console.log(item);
        });



        res.send(dataCountryCode);
    })
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