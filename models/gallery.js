const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const GallerySchema = new Schema({
    name: { 
        type: String, 
        required: true, 
        minLength: 2 
    },
    description: { 
        type: String, 
        required: true, 
        minLength: 2 
    },
    owner: { 
        type: Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    date: { 
        type: Date, 
        default: Date.now 
    }
}, { collection: 'galleries' });

module.exports = mongoose.model("Gallery", GallerySchema);