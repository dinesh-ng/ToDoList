const express = require("express");
const mongoose = require("mongoose");
const _ = require("lodash");
const today = require(__dirname + "/day.js");
const app = express();

require("dotenv").config();
const dbkey = process.env.DB_KEY;
const dbpass = process.env.DB_SECRET;
const mongoDbURL = `mongodb+srv://${dbkey}:${dbpass}@cluster0.gsakywo.mongodb.net/todolistDB`;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

let itemList = [];

mongoose.set("strictQuery", false);

mongoose.connect(
  mongoDbURL,

  {
    useNewUrlParser: true,
  },
  (e) => {
    console.log("Connected to MongoDB");
  }
);

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your to-do list",
});
const item2 = new Item({
  name: "Click the + button to add a new item.",
});
const item3 = new Item({
  name: "<- Click the checkbox to delete an item",
});

const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemsSchema],
};

const ListModel = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
  let day = today.getDate();
  Item.find({}, (err, items) => {
    if (err) console.log(err);
    // itemList = items.map((item) => {
    //   return item.name;
    // });
    if (items.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) console.log(err);
        else console.log("Added items to db.");
      });
      res.redirect("/");
    }
    res.render("list", { listTitle: "Today", itemList: items });
  });
});
app.post("/", (req, res) => {
  // let newItem = req.body.newItem;
  let route = req.body.button;
  const newItem = new Item({
    name: req.body.newItem,
  });
  if (route === "Today") {
    // defaultItems.push(newItem);
    newItem.save((err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Saved 1 item.");
        res.redirect("/");
      }
    });
  } else {
    ListModel.findOne({ name: route }, (err, foundList) => {
      foundList.items.push(newItem);
      foundList.save();
      console.log("Saved 1 item.");
      res.redirect("/" + route);
    });
  }
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  if (customListName == "Favicon.ico") return;
  ListModel.findOne({ name: customListName }, (err, items) => {
    if (err) console.log(err);
    if (!items) {
      const list = new ListModel({
        name: customListName,
        items: defaultItems,
      });
      list.save(() => {
        res.redirect("/" + customListName);
      });
    } else {
      res.render("list", { listTitle: items.name, itemList: items.items });
    }
  });
});

app.post("/delete", (req, res) => {
  // console.log(req.body);
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.deleteOne({ _id: checkedItemId }, (err) => {
      err ? console.log(err) : console.log("Deleted record");
      res.redirect("/");
    });
  } else {
    ListModel.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      (err, results) => {
        err ? console.log(err) : res.redirect("/" + listName);
      }
    );
  }
});

app.listen(3000 || process.env.PORT, () => {
  console.log("Server started successfully");
});
