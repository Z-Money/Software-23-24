const bcrypt = require('bcrypt');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const saltRounds = 10;

/*
const generateScrambledPassword = (userID) => {
    const digits = userID.split('');
    const randomDigits = [];
    for (let i = 0; i < 3; i++) {
        const index = Math.floor(Math.random() * digits.length);
        randomDigits.push(digits.splice(index, 1)[0]);
    }
    const scrambledDigits = randomDigits.join('');
    const password = `T${scrambledDigits}@S${randomDigits[0]}`;
    return password;
};
*/
// const userID = "719354";
// const password = generateScrambledPassword(userID);

async function hashPassword(password) {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    }
    catch (err) {
        console.log(err);
    }
}
async function verifyPassword(plainPassword, hashedPassword) {
    try {
        const match = await bcrypt.compare(plainPassword, hashedPassword);
        if (match) {
            console.log('Password is correct!');
        } else {
            console.log('Password is incorrect!');
        }
        return match;
    } catch (error) {
        console.error('Error verifying password:', error);
    }
}

app.post('/check-password', async (req, res) => {
    console.log('Request Body:', req.body);
    const { username, password } = req.body;
    try {
        const hashedPassword = await hashPassword(password);
        const match = await verifyPassword(password, hashedPassword);

        if (match) {
            const name = await printInfo(username);
            res.json({ message: name }); 
        } else {
            console.log(username, password)
            res.json({ message: 'User Not Found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

async function printInfo(name) {
    const uri = "mongodb+srv://Admin:Admin@chapter-connect.potsbpb.mongodb.net/?retryWrites=true&w=majority&appName=Chapter-Connect";
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        const db = client.db('Users');
        const collection  = db.collection('Users-Info');
        const result = await collection.findOne({ username: name }); //Find memeber by inputted username
        //check if user exists, then get password, if not return none found
        const name1 = String(result.name); //Member's name
        const username = String(result.username); //Member's username
        if (name1 == username) {
            return name1; 
        }
        else {
            return "User Not Found";
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}