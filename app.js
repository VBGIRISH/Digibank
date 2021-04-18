const express=require("express");
const app=express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
require("dotenv").config();

app.use(bodyParser.urlencoded({extended: true}));

const mongoose=require("mongoose");

mongoose.connect("mongodb+srv://Girish:"+ process.env.MONGOPASSWORD +"@cluster0.tucna.mongodb.net/moneyDB?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    _id: Number,
    name: String,
    email: String,
    balance: Number
});

const transactionSchema =new mongoose.Schema({
    sender: String,
    receiver: String,
    amount: Number,
    time: String
})
const Transaction=mongoose.model("transaction",transactionSchema);

const User = mongoose.model("user", userSchema);

app.use(express.static('public'));
app.set("view engine", "ejs");


app.get("/", (req, res) => {
    res.render("index");
});

app.get("/transfer",(req,res) => {
   res.render("transfer");
});

app.get("/customers", (req, res) => {
    User.find({}, (err, result) => {
        res.render("customers", {data: result});
    });
});

app.get("/transactionhistory",(req,res) =>{
   Transaction.find({}, (err, result) => {
      res.render("transactionhistory", {data: result});
  });
})
app.get("/customers/:id", (req, res) => {
    User.findById(req.params.id, (err, docs) => {
        if(docs) {
            res.render("view.ejs", {customerDetails: docs});
        } else {
            console.log("No docs");
            console.log(req.params.id);
        }
    });
});

app.post("/transfer" , (req, res) => {
    User.find({}, (err, allData) => {
        User.findOne({_id: req.body.id}, (err, docs) => {
            res.render("transfer", {sender: docs, allData: allData});
        });
    });
});

app.post("/processing", (req, res) => {
    let sender = req.body.sender;
    let receiver = req.body.receiver;
    let amount = req.body.amount;
    console.log(req.body);
    User.findOne({name: sender}, (err, docs) => {
        if(docs.balance >= amount) {
            User.findOneAndUpdate({name: sender}, { $inc: { balance: -amount } }, (err, docs) => {
                if(err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            });
            User.findOneAndUpdate({name: receiver}, { $inc: { balance: amount } }, (err, docs) => {
                if(err) {
                    console.log(err);
                } else {
                    console.log(docs);
                }
            });
               var date=new Date();
               var options ={
                   timeZone : "Asia/Kolkata"
               }
               var formattedDate = date.toLocaleString('en-US', options);
            const transaction = new Transaction({
              sender: sender,
              receiver: receiver,
              amount: amount,
              time: formattedDate
            });
            transaction.save();
        res.render("success");
        } else {
            res.render("failure");
        }

    });

});

app.listen(process.env.PORT||3000, () => {
    console.log("server is running on port 3000");
});
