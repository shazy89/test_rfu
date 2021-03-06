const ConnectorizedLimiters = require("../models/ConnectorizedLimiters");
const { cloudinary } = require("../services/cloudinary");
// /api/limiters/create
//Post
exports.addLimiter = async function ({ user, body }, res) {
  const { image, ...rest } = body;

  try {
    if (user.admin) {
      if (!image) {
        const addLimiter = await new ConnectorizedLimiters(body);
        await addLimiter.save();
        return res.json({ addLimiter });
      }
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "CoLimiters"
      });
      const formFields = {
        ...rest,
        imageUrl: uploadResponse.url,
        publicId: uploadResponse.public_id
      };
      const addLimiter = await new ConnectorizedLimiters(formFields);
      await addLimiter.save();
      res.json({ addLimiter });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
// Get
// api/limiters
exports.allLimiters = async function (req, res) {
  try {
    const limiters = await ConnectorizedLimiters.find();
    if (!limiters) return res.status(400).json({ msg: "Not found" });
    await limiters.reverse();
    res.json(limiters);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};
// Get
//  api/limiters/:id
exports.limiterById = async function ({ params: { id }, user }, res) {
  try {
    const findLimiter = await ConnectorizedLimiters.findOne({ _id: id });

    if (!findLimiter) return res.status(400).json({ msg: "Not found" });

    return res.json(findLimiter);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};

// PUT
// edit the Limiter
// api/limiters/:id
exports.limiterEdit = async function ({ params: { id }, user, body }, res) {
  try {
    if (user.admin) {
      if (body.image) {
        const { image, ...rest } = body;
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "CoLimiters"
        });
        const formFields = {
          ...rest,
          imageUrl: uploadResponse.url,
          publicId: uploadResponse.public_id
        };
        const editLimiter = await ConnectorizedLimiters.findOneAndUpdate(
          { _id: id }, // filter
          { $set: formFields }, // update
          { new: true }
        );
        return res.json({ editLimiter });
      }
      const editLimiter = await ConnectorizedLimiters.findOneAndUpdate(
        { _id: id }, // filter
        { $set: body }, // update
        { new: true }
      );
      res.json({ editLimiter });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// DEL api/limiters/:id
exports.removeLimiter = async function ({ params: { id }, user }, res) {
  try {
    if (user.admin) {
      await ConnectorizedLimiters.findOneAndRemove({ _id: id });

      res.json({ msg: "Removed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};
