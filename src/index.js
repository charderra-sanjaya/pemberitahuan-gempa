const { default: axios } = require("axios")
const express = require("express")
const nodemailer = require("nodemailer")
const { Telegraf } = require('telegraf')

const url = "https://cuaca-gempa-rest-api.vercel.app/quake"

async function sendEmail() {
  try {

    let kota = "Tangerang"
    let provinsi = "Banten"

    const response = await axios.get(url);
    const data = response.data;

    if (data.data.wilayah.includes(kota) || data.data.wilayah.includes(provinsi)) {
      // Create a transporter using the Gmail SMTP settings
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'your email',
          pass: 'your pass'
        },
      });

      // Compose the email
      let mailOptions = {
        from: '"Pemberitahuan Gempa" <your email>',
        to: 'you email',
        subject: 'Gempa Bumi',
        text: 'Gempa Bumi di Banten',
        html: `
          <p>Wilayah: ${data.data.wilayah}</p>
          <p>Magnitude: ${data.data.magnitude}</p>
          <p>Kedalaman: ${data.data.kedalaman}</p>
          <p>Waktu: ${data.data.tanggal}</p>
          <p>Potensi: ${data.data.potensi}</p>
          <p>Shakemap: </p>
        
        `,
        attachments: [
          {
            filename: 'gempa.jpg',
            path: data.data.shakemap,
          },
        ],
      };

      // Send email
      let info = await transporter.sendMail(mailOptions);
      console.log('Email sent:', info.response);
    } else {
      console.log('Tidak ada di Banten / tangerang.');
    }
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

function infoGempaTelegram(){
const bot = new Telegraf("your api key telegram bot");

    bot.start(async (ctx) => {
        let message = 'Hi ' + ctx.from.first_name + ', Bot ini digunakan untuk memberitahukan gempa bumi yang terjadi.';
        
        try {
          const response = await axios.get(url);
          const data = response.data;
          
          // Extract relevant information from the API response
            let tanggal = data.data.tanggal
            let jam = data.data.jam
            let datetime = data.data.datetime
            let coordinates = data.data.coordinates
            let lintang = data.data.lintang
            let bujur = data.data.bujur
            let magnitude = data.data.magnitude
            let kedalaman = data.data.kedalaman
            let wilayah = data.data.wilayah
            let potensi = data.data.potensi
          
          // Create the message to send
          const earthquakeMessage = `
          <b>Info Gempa Bumi</b>
            <b>Tanggal:</b> ${tanggal}
            <b>Jam:</b> ${jam}
            <b>DateTime:</b> ${datetime}
            <b>Coordinates:</b> ${coordinates}
            <b>Lintang:</b> ${lintang}
            <b>Bujur:</b> ${bujur}
            <b>Magnitude:</b> ${magnitude}
            <b>Kedalaman:</b> ${kedalaman}
            <b>Wilayah:</b> ${wilayah}
            <b>Potensi:</b> ${potensi}
          `;
          
          // Send the message
          bot.telegram.sendMessage(ctx.chat.id, earthquakeMessage, { parse_mode: 'HTML' });
        
             // Check if there is an image URL available
            if (data.data.shakemap) {
                const imageUrl = data.data.shakemap;
                // Send the image
                bot.telegram.sendPhoto(ctx.chat.id, imageUrl);
            }

        } catch (error) {
          console.error('Error:', error);
          bot.telegram.sendMessage(ctx.chat.id, 'Failed to retrieve earthquake information.');
        }
      });


bot.launch()

}

const app = express()

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get("/", async (req, res) => {
    const { data } = await axios.get(url)

  sendEmail();
  infoGempaTelegram();

    res.render('index', { data: data });
})

app.listen(5000, () => console.log("Server running on port 5000"))


 


 
