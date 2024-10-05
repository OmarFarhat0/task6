const fs = require("fs");
const express = require("express");
const app = express();
app.use(express.json());

const port = 8000;

const {
  readFromFile,
  writeJsonFile,
  filterObject,
  resObject,
} = require("./helpers");

const postsConfig = {
  fields: ["title", "description", "author"],
  counter: +fs.readFileSync("./data/postsCounter.txt", "utf-8"), //number posts + 1
  pathData: "./data/data.json",
  pathCounter: "./data/postsCounter.txt",
};

app.get("/api/posts", (req, res) => {
  try {
    readFromFile(postsConfig.pathData, (err, data) => {
      const status = err ? 500 : 200;
      const message = err ? err.message : "Get posts completed successfully";
      const posts = JSON.parse(data);

      res.status(status).json(resObject(!err, message, err, posts));
    });
  } catch (err) {
    res.status(500).json(resObject(false, err.message, err, null));
  }
});

app.post("/api/posts", (req, res) => {
  try {
    if (typeof req.body !== "object" || req.body === null) {
      const message = "Request body must be a valid object.";
      res.status(400).json(resObject(false, message, null, null));
      return;
    }

    let { newObject, warnings } = filterObject(req.body, postsConfig.fields);
    if (warnings !== "") {
      res.status(400).json(resObject(false, warnings, null, null));
      return;
    }

    const currentDate = new Date();
    const formattedDate = `${currentDate.getDate()}/${
      currentDate.getMonth() + 1
    }/${currentDate.getFullYear()}`;

    newObject = {
      id: postsConfig.counter,
      ...newObject,
      date: formattedDate,
    };

    readFromFile(postsConfig.pathData, (err, data) => {
      if (err) {
        res.status(500).json(resObject(false, err.message, err, null));
        return;
      }
      const posts = JSON.parse(data);
      posts.push(newObject);

      writeJsonFile(postsConfig.pathData, posts, (err) => {
        if (err) {
          res.status(500).json(resObject(false, err.message, err, null));
        } else {
          fs.writeFile(
            postsConfig.pathCounter,
            (postsConfig.counter + 1).toString(),
            (err) => {
              if (err) {
                res.status(500).json(resObject(false, err.message, err, null));
              } else {
                const message = "Add post completed successfully.";
                res.status(201).json(resObject(true, message, null, newObject));
                postsConfig.counter++;
              }
            }
          );
        }
      });
    });
  } catch (err) {
    res.status(500).json(resObject(false, err.message, err, null));
  }
});

app.put("/api/posts/:id", (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);

    if (isNaN(postId)) {
      const message = "ID param must be a number.";
      res.status(400).json(resObject(false, message, null, null));
      return;
    }

    if (typeof req.body !== "object" || req.body === null) {
      const message = "Request body must be a valid object.";
      res.status(400).json(resObject(false, message, null, null));
      return;
    }

    const { newObject } = filterObject(req.body, postsConfig.fields);

    readFromFile(postsConfig.pathData, (err, data) => {
      if (err) {
        res.status(500).json(resObject(false, err.message, err, null));
        return;
      }

      let posts = JSON.parse(data);
      const postIndex = posts.findIndex((post) => post.id === postId);

      if (postIndex === -1) {
        const message = `Post with id ${postId} not found.`;
        res.status(404).json(resObject(false, message, null, null));
        return;
      }

      posts[postIndex] = {
        ...posts[postIndex],
        ...newObject,
      };

      writeJsonFile(postsConfig.pathData, posts, (err) => {
        if (err) {
          res.status(500).json(resObject(false, err.message, err, null));
        } else {
          const message = `Post with id ${postId} updated successfully.`;
          res
            .status(200)
            .json(resObject(true, message, null, posts[postIndex]));
        }
      });
    });
  } catch (err) {
    res.status(500).json(resObject(false, err.message, err, null));
  }
});

app.delete("/api/posts/:id", (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);

    if (isNaN(postId)) {
      const message = "ID param must be a number.";
      res.status(400).json(resObject(false, message, null, null));
      return;
    }

    readFromFile(postsConfig.pathData, (err, data) => {
      if (err) {
        res.status(500).json(resObject(false, err.message, err, null));
        return;
      }

      let posts = JSON.parse(data);
      const postIndex = posts.findIndex((post) => post.id === postId);

      if (postIndex === -1) {
        const message = `Post with id ${postId} not found.`;
        res.status(404).json(resObject(false, message, null, null));
        return;
      }
      const deletedPost = posts[postIndex];
      posts = posts.filter((_, index) => index !== postIndex);

      writeJsonFile(postsConfig.pathData, posts, (err) => {
        if (err) {
          res.status(500).json(resObject(false, err.message, err, null));
        } else {
          const message = `Post with id ${postId} deleted successfully.`;
          res.status(200).json(resObject(true, message, null, deletedPost));
        }
      });
    });
  } catch (err) {
    res.status(500).json(resObject(false, err.message, err, null));
  }
});

app.listen(port, () => {
  console.log(`Server is running on http:localhost:${port}`);
});
