import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";


const addComment = asyncHandler(async (req, res)=>{

    const { videoId } = req.params
    const ownerId = req.user?._id
    const {content} = req.body

    const video = await Video.findById(videoId)
    const owner = await User.findById(ownerId)

    if(!video){
        throw new ApiError(404, "Video does not exist")
    }
    if(!owner){
        throw new ApiError(404, "The user does not exist!")
    }

    const comment = await Comment.create({
        content: content,
        video: videoId,
        owner: ownerId
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, comment, "comment added successfully")
    )

})

const deleteComment = asyncHandler(async (req, res)=>{
    const userId = req.user?._id.toString();
    const {commentId} = req.params
    const comment = await Comment.findById(commentId)
    

    if(comment.owner.toString() !== userId){
        throw new ApiError(400, "you cannot delete this comment")
    }

    await Comment.deleteOne({_id: commentId});

    res
    .status(200)
    .json({
        "message": "Your comment deleted successfully"
    })

})

const updateComment = asyncHandler(async (req, res)=>{
    const {commentId} = req.params
   
    const { content } = req.body

    const comment = await Comment.findByIdAndUpdate(commentId, {content: content}, {new: true})

    if(!comment){
        throw new ApiError(400, "The comment does not exist")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, "Comment updated successfully")
    )


})

const getAllComments = asyncHandler(async (req, res)=>{
    const { videoId } = req.params
    const {page = 1, limit = 10} = req.query

    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)

    const skip = (pageNumber - 1) * limitNumber;

    const comments = await Comment.find({video: videoId})
    .skip(skip)
    .limit(limitNumber)

    if(!comments){
        throw new ApiError(400, "Error while fetching the comments")
    }



    const totalComments = await Comment.countDocuments({video: videoId})

    const totalPages = Math.ceil(totalComments / limitNumber);

    res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            {
                page: pageNumber,
                limit: limitNumber,
                totalComments: totalComments,
                totalPages: totalPages,
                comments
            },
            "All comments fetched successfully!"
        )
    )

    

})



export { addComment, deleteComment, updateComment, getAllComments}