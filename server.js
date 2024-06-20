const bcrypt = require('bcrypt');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const StreamChat = require('stream-chat').StreamChat;

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const saltRounds = 10;

const serverSideClient = new StreamChat();
  
  app.post('/join', async (req, res) => {
    const { username } = req.body;
    const token = serverSideClient.createToken(username);
    try {
      await serverSideClient.updateUser(
        {
          id: username,
          name: username,
        },
        token
      );
  
      const admin = { id: 'admin' };
      const channel = serverSideClient.channel('team', 'general', {
        name: 'General',
        created_by: admin,
      });
  
      await channel.create();
      await channel.addMembers([username, 'admin']);
  
      res
        .status(200)
        .json({ user: { username }, token, api_key: process.env.STREAM_API_KEY });
    } catch (err) {
      console.error(err);
      res.status(500);
    }
  });

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
    let { username, password } = req.body;
    username = String(username), password = String(password);
    try {
        const hashedPassword = await hashPassword(password);
        const match = await verifyPassword(password, hashedPassword);

        if (match) {
            const [name, user] = await printInfo(username, password);
            // res.json({ message: name });
            res.json({
                message: name,
                username: user
            }
            );
        } else {
            res.json({ message: 'User Not Found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

async function printInfo(inputtedUser, inputtedPass) {
    const uri = "mongodb+srv://Admin:Admin@chapter-connect.potsbpb.mongodb.net/?retryWrites=true&w=majority&appName=Chapter-Connect";
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        const db = client.db('Users');
        const collection = db.collection('Users-Info');
        const result = await collection.findOne({ username: inputtedUser }); //Find memeber by inputted username
        if (result == null) {
            return ["Username or Password Invalid", "Username or Password Invalid"];
        }
        else if (inputtedUser == String(result.username)) {
            const password = String(result.password); //Member's password
            if (password == inputtedPass) {
                strName = String(result.name); //Member's name
                strUser = String(result.username); //Member's username
                return [strName, strUser];
            }
            else {
                return ["Username or Password Invalid", "Username or Password Invalid"];
            }
        }
        else {
            return ["Username or Password Invalid", "Username or Password Invalid"];
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

async function printEvents(username) {
    const uri = "mongodb+srv://Admin:Admin@chapter-connect.potsbpb.mongodb.net/?retryWrites=true&w=majority&appName=Chapter-Connect";
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        const db = client.db('Users');
        const collection = db.collection('Users-Info');
        const result = await collection.findOne({ username: username }); //Find memeber by inputted username
        if (result == null) {
            return "no events";
        }
        else {
            return [result.name, result.events];
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

app.post('/getEvents', async (req, res) => {
    let { user: username } = req.body;
    try {
        const [member, events] = await printEvents(username);
        res.json({
            message: events,
            name: member
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/getTeammates', async (req, res) => {
    let { user: username } = req.body;
    try {
        const uniqueMembers = await printTeammates(username);
        res.json({
            message: uniqueMembers
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

async function printTeammates(username) {
    const uri = "mongodb+srv://Admin:Admin@chapter-connect.potsbpb.mongodb.net/?retryWrites=true&w=majority&appName=Chapter-Connect";
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        const db = client.db('Users');
        const collection = db.collection('Users-Info');
        const result = await collection.findOne({ username: username }); //Find memeber by inputted username
        const userEvents = result.events;
        const membersCursor = await collection.find({
            events: { $in: userEvents },
            username: { $ne: username } // Exclude the signed-in user
        });

        const members = await membersCursor.toArray();

        // Filter out duplicates (by username)
        const uniqueMembers = [];
        const seenUsernames = new Set();

        members.forEach(member => {
            if (!seenUsernames.has(member.username)) {
                seenUsernames.add(member.username);
                const sharedEvents = member.events.filter(event => userEvents.includes(event));
                uniqueMembers.push({ name: member.name, sharedEvents });
            }
        });
        // Print the teammates and their shared events
        // uniqueMembers.forEach(member => {
        //     console.log(`Member: ${member.name}, Shared Events: ${member.sharedEvents}`);
        // });
        return uniqueMembers;

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

app.post('/eventCompletion', async (req, res) => {
    let { event: event } = req.body;
    try {
        const completion = await getCompletion(event);
        res.json({
            completion: completion
        });
    } catch (error) {
        res.status(500).json({ completion: 'Server error' });
    }
});

async function getCompletion(event) {
    const uri = "mongodb+srv://Admin:Admin@chapter-connect.potsbpb.mongodb.net/?retryWrites=true&w=majority&appName=Chapter-Connect";
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        const db = client.db('Events');
        const collection = db.collection('Event-Info');
        const result = await collection.findOne({ name: event }); //Find memeber by inputted username
        return result.progress;

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

app.post('/profileDetails', async (req, res) => {
    let { user: user } = req.body;
    try {
        const profile = await getProfile(user);
        res.json({
            name: profile.name,
            username: profile.username,
            email: profile.email,
            year: profile.year,
            events: profile.events,
            conferences: profile.conferences
        });
    } catch (error) {
        res.status(500).json({ completion: 'Server error' });
    }
});

async function getProfile(user) {
    const uri = "mongodb+srv://Admin:Admin@chapter-connect.potsbpb.mongodb.net/?retryWrites=true&w=majority&appName=Chapter-Connect";
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        const db = client.db('Users');
        const collection = db.collection('Users-Info');
        const result = await collection.findOne({ username: user });
        return result;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

app.post('/userTask', async (req, res) => {
    let { user: user } = req.body;
    try {
        const [taskList, events] = await getUserTask(user);
        res.json({
            tasks: taskList,
            events: events
        });
    } catch (error) {
        res.status(500).json({ completion: 'Server error' });
    }
});

async function getUserTask(user) {
    const uri = "mongodb+srv://Admin:Admin@chapter-connect.potsbpb.mongodb.net/?retryWrites=true&w=majority&appName=Chapter-Connect";
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        let db = client.db('Users');
        let collection = db.collection('Users-Info');
        const userInfo = await collection.findOne({ username: user });
        const events = userInfo.events;
        db = client.db('Tasks');
        let assignedTask = [],
            incomplete = [],
            progress = [],
            complete = [],
            taskEvents = [],
            temp = [];
        for (let i = 0; i < events.length; i++) {
            collection = db.collection(events[i]);
            const result = await collection.find({ status: "Incomplete", assigned: userInfo.name }).toArray();
            if (result == 0) {
                continue;
            }
            incomplete.push(result);
            temp.push(events[i]);
        }
        taskEvents.push(temp);
        temp = [];
        for (let i = 0; i < events.length; i++) {
            collection = db.collection(events[i]);
            const result = await collection.find({ status: "Progress", assigned: userInfo.name }).toArray();
            if (result == 0) {
                continue;
            }
            progress.push(result);
            temp.push(events[i]);
        }
        taskEvents.push(temp);
        temp = [];
        for (let i = 0; i < events.length; i++) {
            collection = db.collection(events[i]);
            const result = await collection.find({ status: "Complete", assigned: userInfo.name }).toArray();
            if (result == 0) {
                continue;
            }
            complete.push(result);
            temp.push(events[i]);
        }
        taskEvents.push(temp);
        assignedTask.push(incomplete);
        assignedTask.push(progress);
        assignedTask.push(complete);
        return [assignedTask, taskEvents];
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

app.post('/updateTask', async (req, res) => {
    let { task: task } = req.body;
    try {
        newTask = await updateTask(task);
        res.json({
            newTask: newTask
        });
    } catch (error) {
        res.status(500).json({ completion: 'Server error' });
    }
});

async function updateTask(task) {
    const uri = "mongodb+srv://Admin:Admin@chapter-connect.potsbpb.mongodb.net/?retryWrites=true&w=majority&appName=Chapter-Connect";
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        client.connect();
        // Make the appropriate DB calls
        let db = client.db('Tasks');
        let collection = db.collection(task.event);
        await collection.updateOne({ task: task.originalTask }, { $set: { task: task.task, status: task.completion, assigned: task.assignedMembers, due: task.dueDate } }, { upsert: false });
        const result = await collection.findOne({ task: task.task });
        return result;
    } catch (e) {
        console.error(e);
    } finally {
        client.close();
    }
}

app.post('/createTask', async (req, res) => {
    let { task: task } = req.body;
    try {
        newTask = await createTask(task);
        res.json({
            newTask: newTask
        });
    } catch (error) {
        res.status(500).json({ completion: 'Server error' });
    }
});

async function createTask(task) {
    const uri = "mongodb+srv://Admin:Admin@chapter-connect.potsbpb.mongodb.net/?retryWrites=true&w=majority&appName=Chapter-Connect";
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        client.connect();
        // Make the appropriate DB calls
        let db = client.db('Tasks');
        let collection = db.collection(task.event);
        const lastDoc = await collection.findOne({}, { sort: { _id: -1 } });
        let idNum = lastDoc._id;
        idNum += 1;
        await collection.insertOne({ _id: idNum, task: task.task, status: task.completion, assigned: task.assignedMembers, due: task.dueDate });
        const result = await collection.findOne({ task: task.task });
        return result;
    } catch (e) {
        console.error(e);
    } finally {
        client.close();
    }
}

app.post('/deleteTask', async (req, res) => {
    let { task: targetTask } = req.body;
    try {
        deletedTask = await deleteTask(targetTask);
        res.json({
            task: deletedTask
        });
    } catch (error) {
        res.status(500).json({ task: 'Server error' });
    }
});

async function deleteTask(task) {
    const uri = "mongodb+srv://Admin:Admin@chapter-connect.potsbpb.mongodb.net/?retryWrites=true&w=majority&appName=Chapter-Connect";
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        client.connect();
        // Make the appropriate DB calls
        let db = client.db('Tasks');
        let collection = db.collection(task.event);
        await collection.deleteOne({ task: task.name });
        return task;
    } catch (e) {
        console.error(e);
    } finally {
        client.close();
    }
}

app.post('/getEventMembers', async (req, res) => {
    let { event: event } = req.body;
    try {
        members = await getEventMembers(event);
        res.json({
            members: members
        });
    } catch (error) {
        res.status(500).json({ task: 'Server error' });
    }
});

async function getEventMembers(event) {
    uri = "mongodb+srv://Admin:Admin@chapter-connect.potsbpb.mongodb.net/?retryWrites=true&w=majority&appName=Chapter-Connect";
    const client = new MongoClient(uri);
    try {
        // Connect to the MongoDB cluster
        await client.connect();
        // Make the appropriate DB calls
        const db = client.db('Users');
        const collection = db.collection('Users-Info');
        const result = await collection.find({ events: event }).toArray();
        return result;
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

app.post('/eventTask', async (req, res) => {
    let { event: event } = req.body;
    try {
        const tasks = await getEventTask(event);
        res.json({
            tasks: tasks
        });
    } catch (error) {
        res.status(500).json({ completion: 'Server error' });
    }
});

async function getEventTask(event) {
    const uri = "mongodb+srv://Admin:Admin@chapter-connect.potsbpb.mongodb.net/?retryWrites=true&w=majority&appName=Chapter-Connect";
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls
        let db = client.db('Tasks');
        let collection = db.collection(event);
        // const userInfo = await collection.findOne({ username: user });
        // const events = userInfo.events;
        let incomplete = [],
        progress = [],
        complete = [];
        incomplete = await collection.find({ status: "Incomplete" }).toArray();
        progress = await collection.find({ status: "Progress" }).toArray();
        complete = await collection.find({ status: "Complete" }).toArray();
        const task = [incomplete, progress, complete];
        return task;

        // let assignedTask = [],
        //     incomplete = [],
        //     progress = [],
        //     complete = [],
        //     taskEvents = [],
        //     temp = [];
        // for (let i = 0; i < events.length; i++) {
        //     collection = db.collection(events[i]);
        //     const result = await collection.find({ status: "Incomplete", assigned: userInfo.name }).toArray();
        //     if (result == 0) {
        //         continue;
        //     }
        //     incomplete.push(result);
        //     temp.push(events[i]);
        // }
        // taskEvents.push(temp);
        // temp = [];
        // for (let i = 0; i < events.length; i++) {
        //     collection = db.collection(events[i]);
        //     const result = await collection.find({ status: "Progress", assigned: userInfo.name }).toArray();
        //     if (result == 0) {
        //         continue;
        //     }
        //     progress.push(result);
        //     temp.push(events[i]);
        // }
        // taskEvents.push(temp);
        // temp = [];
        // for (let i = 0; i < events.length; i++) {
        //     collection = db.collection(events[i]);
        //     const result = await collection.find({ status: "Complete", assigned: userInfo.name }).toArray();
        //     if (result == 0) {
        //         continue;
        //     }
        //     complete.push(result);
        //     temp.push(events[i]);
        // }
        // taskEvents.push(temp);
        // assignedTask.push(incomplete);
        // assignedTask.push(progress);
        // assignedTask.push(complete);
        // return [assignedTask, taskEvents];
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}