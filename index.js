// Requires
const axios = require("axios");
const FB = require("fb");
const fs = require('fs');
const {
    download_image
} = require('./download');

// .env
require('dotenv/config');

// Facebook acess token
FB.setAccessToken(process.env.FB_TOKEN);

// Get the BRL value converted from USD
axios
    .get(
        `https://free.currconv.com/api/v7/convert?q=USD_BRL&compact=ultra&apiKey=${process.env.API_KEY}`
    )
    .then(async res => {
        // Take the value
        const response = res.data.USD_BRL;

        // Convert to the BRL string value
        const BRL = response.toLocaleString("pt-BR", {
            minimumFractionDigits: 2,
            style: "currency",
            currency: "BRL"
        });

        // Multiplies by a hundred because of the comma 
        const resp = response * 100;

        // Get the pokemon with the resp value
        const pokemon = await axios.get(
            `https://pokeapi.co/api/v2/pokemon-form/${Math.round(resp)}`
        );

        return [pokemon.data, BRL];
    })
    .then(values => {
        // Disrupting values
        const {
            name,
            sprites: {
                front_default,
            }
        } = values[0];

        // Download the image to upload if the code went wrong
        // download_image(front_default, 'image.png')
        // And put this in the FB.api replacing the url
        // fs.createReadStream('image.png')

        // Posts on facebook with the sprites of the pokemon
        FB.api('me/photos/', 'post', {
            url: front_default,
            caption: capitalizeFirstLetter(name),
            message: `O Dólar está R$ ${values[1]} e o pokemon é: ${capitalizeFirstLetter(name)}` // Here it says: "The dollar is ${BRL} and the pokemon is: ${name}"
        }, res => {
            // Check if something went wrong
            if (!res || res.error) {
                console.error(!res ? "Error ocurred" : res.error);
                return;
            }

            console.log(`Post ID: ${res.id}`);
        })

    })
    .catch(err => {
        console.error(err);
    });

// Capitalize the first letter
function capitalizeFirstLetter(string) {
    return `${string.charAt(0).toUpperCase()}${string.slice(1)}`;
}