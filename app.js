const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + '/date.js');
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
const workList = [];
const day = date.getDate();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//db connection
mongoose.connect("mongodb+srv://admin-thoufic:Test-123@cluster0.yfcf7.mongodb.net/toDoListDB");

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your ToDo List!"
});

const item2 = new Item({
  name: "Hit + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

// Item.insertMany([item1,item2,item3],function(err,result){
//   if (err){
//     console.log(err);
//   }else{
//     console.log("Number of documents inserted : " + result.length);
//   }
// });

const listsSchema = {
  itemName: String,
  items: [itemsSchema]
};
const List = mongoose.model("List", listsSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err, result) {
        if (err) {
          console.log(err);
        } else {
          console.log("Number of documents inserted : " + result.length);
        }
      });
      res.redirect("/");
    } else {
      res.render('list', {
        listTitle: day,
        newItems: foundItems
      });
    }
  });
});

app.get("/:customListName", function(req, res) {
  const customListName = req.params.customListName;

  List.findOne({
    itemName: customListName
  }, function(err, foundLists) {
    if (!err) {
      if (!foundLists) {
        const list = new List({
          itemName: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render('list', {
          listTitle: foundLists.itemName,
          newItems: foundLists.items
        });
      };
    };
  });
});


app.post("/", function(req, res) {
  const itemName = req.body.listItem;
  const listName = req.body.list;
  console.log(listName);
  console.log(day);
  const item = new Item({
    name: itemName
  });

  if (day.startsWith(listName)) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({
      itemName: listName
    }, function(err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  };
});

app.post("/delete", function(req, res) {
  const checkedId = req.body.checkbox;
  const checkedTitle = req.body.checkedItem;

  if (day.startsWith(checkedTitle)) {
    Item.findByIdAndRemove(checkedId, function(err) {
      if (!err) {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({
      itemName: checkedTitle
    }, {
      $pull: {
        items: {
          _id: checkedId
        }
      }
    }, function(err, foundLists) {
      if (!err) {
        res.redirect("/" + checkedTitle);
      }
    });
  };
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
