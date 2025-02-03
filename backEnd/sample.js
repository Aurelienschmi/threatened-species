const axios = require('axios');
const express = require('express');
const app = express();

const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../frontEnd')); 
app.use(express.static(path.join(__dirname, '../frontEnd')));

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
    res.render("index");

    getApi('https://restcountries.com/v3.1/all?fields=name,translations,cca2').then(data => {
        data.sort((a, b) => a.name.common.localeCompare(b.name.common));
        const updatedData = data.map(country => {
            return {
            ...country,
            translationFra: country.translations?.fra?.common || ''
            };
        });
        console.log("updatedData")
        console.log(updatedData.map(country => country.name.common))
        console.log("ççççç")
        res.render('index', {apiPays: updatedData.map(country => country.name.common)});
    });
    
});



app.get('/test', async (req, res) => {
  try {
    const data = await getApi('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
    return res.json(data); 
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.get('/animal-FR', (req, res) => {
    getApiWithAuthorization('https://api.iucnredlist.org/api/v4/countries/FR').then(data => {
    res.send(data);
    })
});



app.get('/animals/:pays', async (req, res) => {
    const pays = req.params.pays;
    let listAnimal = [];
    try {
      const data = await getApiWithAuthorization(`https://api.iucnredlist.org/api/v4/countries/${pays}`);
      const assessmentIds = data.assessments.map(item => item.assessment_id);

      assessmentIds.map(async (idAnimal) => {
        listAnimal.push(await findAnimalWithId(idAnimal));
      });

      listAnimal.map((animal) => {
        console.log(animal);
      });
      res.json(listAnimal);
      
    } catch (error) {
      if (error.response) {
        if (error.response.status === 429) {
          res.status(429).send('Too Many Requests: Rate limit exceeded');
        } else {
          res.status(error.response.status).send(`Error: ${error.response.statusText}`);
        }
      } else {
        res.status(500).send('Server error');
      }
    }
});



async function findAnimalWithId(idAnimal) {
    try {
        const dataAnimal = await getApiWithAuthorization(`https://api.iucnredlist.org/api/v4/assessment/${idAnimal}`);
        console.log(dataAnimal.taxon.scientific_name);
        return dataAnimal.taxon.scientific_name;
    } catch (error) {
        console.log('Server error');
        return null;
    }
}


  
app.get('/country', (req, res) => {
    getApi('https://restcountries.com/v3.1/all?fields=name,translations,cca2').then(data => {
    data.sort((a, b) => a.name.common.localeCompare(b.name.common));
    const updatedData = data.map(country => {
        return {
        ...country,
        translationFra: country.translations?.fra?.common || ''
        };
    });


    res.send(updatedData);
});
});


app.listen(3000, () => {
  console.log('Server listening on port 3000');
});