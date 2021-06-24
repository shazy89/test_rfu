const News = require("../models/news");
const { cloudinary } = require("../services/cloudinary");
// api/news
exports.allNews = async function (req, res) {
  try {
    const news = await News.find();
    if (!news) return res.status(400).json({ msg: "Not found" });
    await news.reverse();
    res.json(news);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};

// News -  /api/news/create
//Post
exports.addNews = async function ({ user, body }, res) {
  const { image, ...rest } = body;

  try {
    if (user.admin) {
      if (!image) {
        const addNews = await new News(body);
        await addNews.save();
        return res.json({ addNews });
      }
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "News"
      });
      const formFields = {
        ...rest,
        imageUrl: uploadResponse.url,
        publicId: uploadResponse.public_id
      };
      const addNews = await new News(formFields);
      await addNews.save();
      return res.json({ addNews });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// GET  news by :id
//  api/news/:id
exports.newsById = async function ({ params: { id }, user }, res) {
  try {
    if (user.admin) {
      const news = await News.findOne({ _id: id });

      if (!news) return res.status(400).json({ msg: "Not found" });

      return res.json(news);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};

// PUT
// edit the News
// api/news/:id
exports.editNews = async function ({ user, body }, res) {
  const { image, _id, ...rest } = body;

  try {
    if (user.admin) {
      if (!image) {
        const editNews = await News.findOneAndUpdate(
          { _id }, // filter
          { $set: body }, // update
          { new: true }
        );
        return res.json({ editNews });
      }
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "News"
      });
      const formFields = {
        ...rest,
        imageUrl: uploadResponse.url,
        publicId: uploadResponse.public_id
      };
      const editNews = await News.findOneAndUpdate(
        { _id }, // filter
        { $set: formFields }, // update
        { new: true }
      );

      res.json({ editNews });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// DEL api/news/:id
exports.removeNews = async function ({ params: { id }, user }, res) {
  try {
    if (user.admin) {
      await News.findOneAndRemove({ _id: id });

      res.json({ msg: "Removed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};
