import mongoose, { Schema, model, models } from 'mongoose';

const LinkSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for this link.'],
        maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    type: {
        type: String,
        required: [true, 'Please specify the type (ipfs).'],
        enum: ['ipfs'],
        default: 'ipfs',
    },
    value: {
        type: String,
        required: [true, 'Please provide the hash or link value.'],
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: 'Link',
        default: null,
    },
    isOp: {
        type: Boolean,
        default: true,
    },
    repliesCount: {
        type: Number,
        default: 0,
    },
    lastReplyAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

LinkSchema.index({ parentId: 1 });
LinkSchema.index({ lastReplyAt: -1 });
LinkSchema.index({ isOp: 1, lastReplyAt: -1 });

export default models.Link || model('Link', LinkSchema);
