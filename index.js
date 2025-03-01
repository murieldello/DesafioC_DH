
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config(); 

const app = express();


app.use(express.json());
app.use(cors());


console.log("TEXTCORTEX_API_KEY:", process.env.TEXTCORTEX_API_KEY);

app.post('/api/consultar-textcortex', async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: '¡Tenés que escribir algo para preguntarle a la IA!' });
  }

  try {
    const payload = {
      max_tokens: 2048,
      mode: "python",              
      model: "gemini-2-0-flash",    
      n: 1,
      temperature: 0.7,            
      text: prompt                 
    };

    const response = await axios.post(
      'https://api.textcortex.com/v1/codes',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.TEXTCORTEX_API_KEY}`
        }
      }
    );

    console.log("Respuesta completa de la IA TextCortex:", JSON.stringify(response.data, null, 2));

    if (
      response.data &&
      response.data.data &&
      Array.isArray(response.data.data.outputs) &&
      response.data.data.outputs.length > 0 &&
      response.data.data.outputs[0].text
    ) {
      let outputText = response.data.data.outputs[0].text;
      outputText = outputText.replace(/\*\*/g, '');
      res.json({ text: outputText });
    } else {
      res.json({ error: 'No se encontró salida en la respuesta.' });
    }
  } catch (error) {
    console.error('Error al consultar TextCortex:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error al consultar la API de la IA TextCortex.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});


