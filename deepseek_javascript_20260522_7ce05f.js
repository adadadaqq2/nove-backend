const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const app = express();

app.use(cors());
app.use(express.json());

// Key'leri geçici olarak memory'de tut (daha sonra database ekleriz)
const validKeys = new Map();

// Key üret
app.post('/generate-key', (req, res) => {
    const newKey = crypto.randomBytes(16).toString('hex').toUpperCase().match(/.{1,4}/g).join('-');
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000);
    
    validKeys.set(newKey, { expiresAt, used: false });
    res.json({ success: true, key: newKey });
});

// Key doğrula
app.post('/verify-key', (req, res) => {
    const { key, userId } = req.body;
    
    if (!validKeys.has(key)) {
        return res.json({ valid: false, message: 'Geçersiz key!' });
    }
    
    const keyData = validKeys.get(key);
    
    if (keyData.used) {
        return res.json({ valid: false, message: 'Key zaten kullanılmış!' });
    }
    
    if (Date.now() > keyData.expiresAt) {
        validKeys.delete(key);
        return res.json({ valid: false, message: 'Key süresi dolmuş!' });
    }
    
    keyData.used = true;
    validKeys.set(key, keyData);
    
    res.json({ valid: true, message: 'Key geçerli!' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
});