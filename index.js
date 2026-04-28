const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const fs = require('fs');
const crypto = require('crypto');

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/static', express.static(path.join(__dirname, 'public')));

const DATA_DIR = path.join(__dirname, 'data');
const TASKS_FILE = path.join(DATA_DIR, 'tasks.json');
const OLD_FILES_DIR = path.join(__dirname, 'files');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Migration and DB Initialization
function getTasks() {
    if (!fs.existsSync(TASKS_FILE)) {
        // Run migration from old txt files if they exist
        let tasks = [];
        if (fs.existsSync(OLD_FILES_DIR)) {
            const files = fs.readdirSync(OLD_FILES_DIR).filter(f => f.endsWith('.txt'));
            for (const file of files) {
                try {
                    const content = fs.readFileSync(path.join(OLD_FILES_DIR, file), 'utf-8');
                    tasks.push({
                        id: crypto.randomUUID(),
                        title: file.replace('.txt', ''),
                        details: content,
                        status: 'pending',
                        createdAt: fs.statSync(path.join(OLD_FILES_DIR, file)).mtimeMs
                    });
                } catch (e) {
                    console.error("Migration error for file:", file, e);
                }
            }
        }
        // Sort by newest first
        tasks.sort((a, b) => b.createdAt - a.createdAt);
        fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
        return tasks;
    }
    const data = fs.readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
}

function saveTasks(tasks) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

// Routes
app.get('/', (req, res) => {
    try {
        let tasks = getTasks();
        
        // Search & Filter Logic
        const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';
        const filterQuery = req.query.filter || 'all';

        if (searchQuery) {
            tasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery) || (t.details && t.details.toLowerCase().includes(searchQuery)));
        }

        if (filterQuery === 'pending') {
            tasks = tasks.filter(t => t.status === 'pending');
        } else if (filterQuery === 'completed') {
            tasks = tasks.filter(t => t.status === 'completed');
        }

        res.render('index', { 
            tasks: tasks, 
            searchQuery: req.query.search || '',
            filterQuery: filterQuery,
            error: req.query.error, 
            success: req.query.success 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

app.post('/files', (req, res) => {
    try {
        const title = req.body.Title || 'Untitled Task';
        const details = req.body.details || '';
        const dueDate = req.body.dueDate || null;
        const tasks = getTasks();
        
        tasks.unshift({
            id: crypto.randomUUID(),
            title: title.trim(),
            details: details.trim(),
            dueDate: dueDate,
            status: 'pending',
            createdAt: Date.now()
        });
        
        saveTasks(tasks);
        res.redirect('/?success=Task+created');
    } catch (err) {
        console.error(err);
        res.redirect('/?error=Failed+to+create+task');
    }
});

app.get('/files/:id', (req, res) => {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) return res.redirect('/?error=Task+not+found');
    res.render('show', { task });
});

app.get('/files/:id/edit', (req, res) => {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) return res.redirect('/?error=Task+not+found');
    res.render('edit', { task });
});

app.post('/files/:id/edit', (req, res) => {
    try {
        const tasks = getTasks();
        const taskIndex = tasks.findIndex(t => t.id === req.params.id);
        if (taskIndex === -1) return res.redirect('/?error=Task+not+found');
        
        const newTitle = req.body.newTitle;
        const newDetails = req.body.newDetails;
        const newDueDate = req.body.newDueDate;
        
        if (newTitle) tasks[taskIndex].title = newTitle.trim();
        if (newDetails !== undefined) tasks[taskIndex].details = newDetails.trim();
        if (newDueDate !== undefined) tasks[taskIndex].dueDate = newDueDate || null;
        
        saveTasks(tasks);
        res.redirect('/?success=Task+updated');
    } catch (err) {
        console.error(err);
        res.redirect('/?error=Failed+to+update+task');
    }
});

app.post('/files/:id/toggle', (req, res) => {
    try {
        const tasks = getTasks();
        const task = tasks.find(t => t.id === req.params.id);
        if (!task) return res.redirect('/?error=Task+not+found');
        
        task.status = task.status === 'completed' ? 'pending' : 'completed';
        saveTasks(tasks);
        res.redirect('/?success=Task+status+updated');
    } catch (err) {
        console.error(err);
        res.redirect('/?error=Failed+to+update+status');
    }
});

app.get('/files/:id/delete', (req, res) => {
    const tasks = getTasks();
    const task = tasks.find(t => t.id === req.params.id);
    if (!task) return res.redirect('/?error=Task+not+found');
    res.render('delete', { task });
});

app.post('/files/:id/delete', (req, res) => {
    try {
        let tasks = getTasks();
        tasks = tasks.filter(t => t.id !== req.params.id);
        saveTasks(tasks);
        res.redirect('/?success=Task+deleted');
    } catch (err) {
        console.error(err);
        res.redirect('/?error=Failed+to+delete+task');
    }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});