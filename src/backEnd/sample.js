const geoip = require('geoip-lite');
const axios = require("axios");
const express = require("express");
const app = express();
const path = require("path");
const fs = require('fs');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontEnd"));
app.use(express.static(path.join(__dirname, "../frontEnd")));

require("dotenv").config();

const languageMap = {
    'fr': 'fra',
    'en': 'eng',
    'ar': 'ara',
    'br': 'bre',
    'cs': 'ces',
    'cy': 'cym',
    'de': 'deu',
    'et': 'est',  
    'fi': 'fin',
    'hr': 'hrv',
    'hu': 'hun',
    'it': 'ita',
    'ja': 'jpn',
    'ko': 'kor',
    'nl': 'nld',
    'fa': 'per',
    'pl': 'pol',
    'pt': 'por',
    'ru': 'rus',
    'sk': 'slk',
    'es': 'spa',
    'sr': 'srp',
    'sv': 'swe',
    'tr': 'tur',
    'ur': 'urd',
    'zh': 'zho'
};

async function getApiWithAuthorization(pathURL) {
    const response = await axios.get(pathURL, {
        headers: {
            accept: "application/json",  
            Authorization: process.env.API_KEY,
        },
    });

    return response.data;
}

async function getApi(pathURL) {
    const response = await axios.get(pathURL);
    return response.data;
}

app.get('/', (req, res) => {
    const language = req.query.language || req.headers['accept-language'].split(',')[0];
    const translationKey = languageMap[language] || language;
    getApi('https://restcountries.com/v3.1/all?fields=name,translations,cca2').then(data => {
        const updatedData = data.map(country => {
            const translation = country.translations?.[translationKey];
            if (translation) {
                return {
                    ...country,
                    name: { common: translation.common || country.name.common, official: translation.official || country.name.official }
                };
            } else {
                return country;
            }
        });
        updatedData.sort((a, b) => a.name.common.localeCompare(b.name.common));
        res.render('index', {apiPays: updatedData}); // .name.common
    });
    
});



app.get("/test", async (req, res) => {
    try {
        const data = await getApi(
            "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY"
        );
        return res.json(data);
    } catch (err) {
        res.status(500).send("Server error");
    }
});

app.get("/animal-FR", (req, res) => {
    getApiWithAuthorization(
        "https://api.iucnredlist.org/api/v4/countries/FR"
    ).then((data) => {
        res.send(data);
    });
});


async function findAnimalWithId(idAnimal) {
    try {
        const dataAnimal = await getApiWithAuthorization(
            `https://api.iucnredlist.org/api/v4/assessment/${idAnimal}`
        );
        return {
            scientific_name: dataAnimal.taxon.scientific_name,
            authority: dataAnimal.taxon.authority,
            url: dataAnimal.url,
            possibly_extinct: dataAnimal.possibly_extinct,
            possibly_extinct_in_the_wild: dataAnimal.possibly_extinct_in_the_wild,
        };
    } catch (error) {
        console.log("Server error");
        return null;
    }
}

app.get("/animals/:pays/:limiteAPI", async (req, res) => {
    const pays = req.params.pays;
    const limiteAPI = req.params.limiteAPI;
    let listAnimal = [];
    try {
        const data = await getApiWithAuthorization(
            `https://api.iucnredlist.org/api/v4/countries/${pays}`
        );
        const assessmentIds = data.assessments.map(
            (item) => item.assessment_id
        );

        const animalPromises = assessmentIds.slice(0, limiteAPI).map(idAnimal => findAnimalWithId(idAnimal));
        listAnimal = await Promise.all(animalPromises);

        res.send(listAnimal);
    } catch (error) {
        if (error.response) {
            if (error.response.status === 429) {
                res.status(429).send("Too Many Requests: Rate limit exceeded");
            } else {
                res.status(error.response.status).send(
                    `Error: ${error.response.statusText}`
                );
            }
        } else {
            res.status(500).send("Server error");
        }
    }
});

app.get('/country', (req, res) => {
    const language = req.query.language || req.headers['accept-language'].split(',')[0];
    const translationKey = languageMap[language] || language;
    getApi('https://restcountries.com/v3.1/all?fields=name,translations,cca2').then(data => {
        const updatedData = data.map(country => {
            const translation = country.translations?.[translationKey];
            if (translation) {
                return {
                    ...country,
                    name: { common: translation.common || country.name.common, official: translation.official || country.name.official }
                };
            } else {
                return country;
            }
        });
        updatedData.sort((a, b) => a.name.common.localeCompare(b.name.common));
        res.send(updatedData);
    });
});

app.get('/ip', (req, res) => {
    //const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ip = '185.161.44.242'
    console.log(`Adresse IP détectée : ${ip}`);
    const geo = geoip.lookup(ip);
    const country = geo ? geo.country : 'Pays non déterminé';

    res.send(`Bonjour utilisateur de ${country}!`);
});

app.get('/version', async (req, res) => {
    const rev = fs.readFileSync('.git/HEAD').toString().trim();
    if (rev.indexOf(':') === -1) {
        res.send(rev);
    } else {
        res.send(fs.readFileSync('.git/' + rev.substring(5)).toString().trim());
    }
});

app.listen(3000, () => {
    console.log("Server listening on port 3000");
});
