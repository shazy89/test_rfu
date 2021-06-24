const Event = require("../models/event");
const { cloudinary } = require("../services/cloudinary");
// events -  /api/events/create
//Post
exports.addEvent = async function ({ user, body }, res) {
  const { title, content } = body;

  const eventFields = {
    title,
    content
  };
  try {
    if (user.admin) {
      const addEvent = await new Event(eventFields);
      await addEvent.save();
      res.json({ addEvent });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// api/events
exports.allEvents = async function (req, res) {
  try {
    const event = await Event.find();
    console.log(event);
    if (!event) return res.status(400).json({ msg: "Not found" });

    return res.json(event);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Server error" });
  }
};

// PUT
// edit the event
// api/events/:id
exports.editEvent = async function ({ user, body }, res) {
  try {
    if (user.admin) {
      if (body.image) {
        const { id, image, ...rest } = body;
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "events"
        });
        const formFields = {
          ...rest,
          imageUrl: uploadResponse.url,
          publicId: uploadResponse.public_id
        };
        const updateEvent = await Event.findOneAndUpdate(
          { _id: id }, // filter
          { $set: formFields }, // update
          { new: true }
        );

        return res.json({ updateEvent });
      }
      const updateEvent = await Event.findOneAndUpdate(
        { _id: body.id }, // filter
        { $set: body }, // update
        { new: true }
      );
      console.log(updateEvent);
      res.json({ updateEvent });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
