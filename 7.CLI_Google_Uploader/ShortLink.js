import inquirer from "inquirer";
import axios from "axios";
import "dotenv/config";

const {API_SHORT_LINK, API_SHORT_LINK_TOKEN} = process.env;


export class ShortLink{

    shortLink = (fileId, access_token) => {
        inquirer.prompt({
          name: "question_link",
          message: "Do you want to get the short link?",
          type: "confirm",
        }).then(async answear => {
          const { data: { webViewLink } } = await axios.get(`https://www.googleapis.com/drive/v3/files/${fileId}`,
            {
              params: {
                fields: 'webViewLink',
                alt: 'json',
              },
              headers: { Authorization: `Bearer ${access_token}` }
            }
          )
          if (answear.question_link) {
            const { data: { data: { tiny_url } } } = await axios.post( API_SHORT_LINK,
              { url: webViewLink, },
              { headers: { Authorization: `Bearer ${API_SHORT_LINK_TOKEN}` } }
            )
            console.log("Short link to the photo: " + tiny_url);
          } else {
            console.log("Full link to the photo: " + webViewLink);
          }
        })
      }
}