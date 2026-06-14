const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    path: { type: String, required: true },
    gallery: { type: Schema.Types.ObjectId, ref: "Gallery", required: true },
    date: { type: Date, default: Date.now },
    comments: [{
        text: { type: String, required: true },
        author: { type: String, required: true },
        date: { type: Date, default: Date.now }
    }]
}, { collection: 'images' });

module.exports = mongoose.model("Image", ImageSchema);