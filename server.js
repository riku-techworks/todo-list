const express = require("express");
const db = require("./database");

const app = express();

app.use(express.json());

let tasks = [
    {id:1,title:"JavaScriptの勉強",completed:false},
    {id:2,title:"Expressの勉強",completed:false}
];

let nextId = 3;

app.get("/api/tasks",(req,res) => {
    const tasks = db.prepare("SELECT * FROM tasks ORDER BY id").all();
    res.json(tasks.map(task => ({
        ...task,
        completed:Boolean(task.completed)
    })));
});

app.post("/api/tasks",(req,res) => {
    const title = req.body?.title;

    if(typeof title !== "string" || title.trim() === ""){
        return res.status(400).json({error:"タスク名を入力してください"});
    }

    const result = db.prepare(
        "INSERT INTO tasks (title) VALUES (?)"
    ).run(title.trim());

    const task = db.prepare(
        "SELECT * FROM tasks WHERE id = ?"
    ).get(result.lastInsertRowid);

    res.status(201).json({
        ...task,
        completed:Boolean(task.completed)
    });
});

app.put("/api/tasks/:id",(req,res) => {
    const id = Number(req.params.id);
    const {title,completed} = req.body ?? {};

    if(!Number.isSafeInteger(id) || id < 1){
        return res.status(400).json({
            error:"有効なIDを指定してください"
        });
    }

    if(typeof title !== "string" || title.trim() === "" || typeof completed !== "boolean"){
        return res.status(400).json({
            error:"有効なタスク名と完了状態を指定してください"
        });
    }

    const result = db.prepare(
        "UPDATE tasks SET title = ?,completed = ? WHERE id = ?"
    ).run(title.trim(),Number(completed),id);

    if(result.changes === 0){
        return res.status(404).json({
            error:"タスクが見つかりません"
        });
    }

    const task = db.prepare(
        "SELECT * FROM tasks WHERE id = ?"
    ).get(id);

    res.json({
        ...task,
        completed:Boolean(task.completed)
    });
});

app.delete("/api/tasks/:id",(req,res) => {
    const id = Number(req.params.id);

    if(!Number.isSafeInteger(id) || id < 1){
        return res.status(400).json({
            error:"有効なIDを指定してください"
        });
    }

    const result = db.prepare(
        "DELETE FROM tasks WHERE id = ?"
    ).run(id);

    if(result.changes === 0){
        return res.status(404).json({
            error:"タスクが見つかりません"
        });
    }

    res.status(204).send();
})

app.listen(3000,() => {
    console.log("サーバーが起動しました");
});