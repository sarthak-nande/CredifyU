import mongoose from 'mongoose';

const KeysSchema = new mongoose.Schema({
    publicKey: {
        type: String,
        required: true
    },
    privateKey: {
        type: String,
        required: true
    },
    privateKeyIv: {
        type: String,
    },
    collegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
        required: true
    }
});

export default mongoose.model('Keys', KeysSchema);