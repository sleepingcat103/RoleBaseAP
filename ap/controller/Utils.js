const crypto = require('crypto');

const ENCRYPTION_KEY = 'chatbotbackstagechatbotbackstage'; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

module.exports = {
    
    aesEncrypt: (text) => {
        // let encryptedString = text;
        // return encryptedString;
        try {
            let iv = crypto.randomBytes(IV_LENGTH);
            let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
            let encrypted = cipher.update(text);
        
            encrypted = Buffer.concat([encrypted, cipher.final()]);
        
            return iv.toString('hex') + ':' + encrypted.toString('hex');
        } catch (error) {
            console.error(error);
            return;
        }
    },
    aesDecrypt: (text) => {
        // let decryptedString = text;
        // return decryptedString;
        
        try {
            let textParts = text.split(':');
            let iv = Buffer.from(textParts.shift(), 'hex');
            let encryptedText = Buffer.from(textParts.join(':'), 'hex');
            let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
            let decrypted = decipher.update(encryptedText);
        
            decrypted = Buffer.concat([decrypted, decipher.final()]);
        
            return decrypted.toString();
        } catch (error) {
            console.error(error);
            return;
        }
    }
}