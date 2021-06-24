const RfSwitchDriver = require("../models/RfSwitchDriver");
const { cloudinary } = require("../services/cloudinary");

// /api/swdrivers/create
//Post
exports.addSwitchDriver = async function ({ user, body }, res) {
  const { image, ...rest } = body;
  try {
    if (user.admin) {
      if (!image) {
        const driver = await new RfSwitchDriver(body);
        await driver.save();
        return res.json({ driver });
      }
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "SwDrivers"
      });
      const formFields = {
        ...rest,
        imageUrl: uploadResponse.url,
        publicId: uploadResponse.public_id
      };
      const driver = await new RfSwitchDriver(formFields);
      await driver.save();
      res.json({ driver });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
// Get
// api/swdrivers
exports.allSwDrivers = async function (req, res) {
  try {
    const drivers = await RfSwitchDriver.find();
    if (!drivers) return res.status(400).json({ msg: "Not found" });
    await drivers.reverse();
    res.json(drivers);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};

// Get
//  api/swdrivers/:id
exports.swDriverById = async function ({ params: { id } }, res) {
  try {
    const findSwDriver = await RfSwitchDriver.findOne({ _id: id });

    if (!findSwDriver) return res.status(400).json({ msg: "Not found" });

    return res.json(findSwDriver);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};

// PUT
// edit the Switch
// api/swdrivers/:id
exports.swDriverEdit = async function ({ params: { id }, user, body }, res) {
  try {
    if (user.admin) {
      if (body.image) {
        const { image, ...rest } = body;
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "SwDrivers"
        });
        const formFields = {
          ...rest,
          imageUrl: uploadResponse.url,
          publicId: uploadResponse.public_id
        };
        const editSwDriver = await RfSwitchDriver.findOneAndUpdate(
          { _id: id }, // filter
          { $set: formFields }, // update
          { new: true }
        );
        return res.json({ editSwDriver });
      }
      const editSwDriver = await RfSwitchDriver.findOneAndUpdate(
        { _id: id }, // filter
        { $set: body }, // update
        { new: true }
      );
      res.json({ editSwDriver });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// DEL api/switches/:id
exports.removeSwDriver = async function ({ params: { id }, user }, res) {
  try {
    if (user.admin) {
      await RfSwitchDriver.findOneAndRemove({ _id: id });

      res.json({ msg: "Removed" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};
