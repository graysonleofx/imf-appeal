import {google} from 'googleapis'

function makeBody(to, from, subject, message){
  const str = [
    `Content-Type: text/plain; charset="UTF-8"\n`,
    "MIME-Version: 1.0\n",
    `Content-Transfer-Encoding: 7bit\n`,
    `to: ${to}\n`,
    `from: ${from}\n`,
    `subject: ${subject}\n\n`,
    message
  ].join('')

  return Buffer.from(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function SendEmail(accessToken, to, from, subject, message) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({access_token: accessToken});
  const gmail = google.gmail({version: 'v1', auth});
  const email = makeBody(to, from, subject, message);

  try {
    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: email
      }
    });
    return res.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}