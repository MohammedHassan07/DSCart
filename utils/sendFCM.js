import FCMAdmin from '../config/FCMAdmin.js'

export default async function sendFCM(clientToken, title, body) {

    const message = {

        notification: {
            title: title,
            body: body
        },
        token: clientToken
    }

    FCMAdmin.messaging().send(message)
}