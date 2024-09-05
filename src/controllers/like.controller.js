import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    const userId = req.user?._id

    const like = await Like.findOne({
        video: videoId,
        likedBy: userId
    })


    let isLiked ;

    if(!like){
        await Like.create({
            video: videoId,
            likedBy: userId
        })
        isLiked = true
    }else{
        await Like.findByIdAndDelete(like._id)
        isLiked = false
    }

    

    res
    .status(200)
    .json(
        new ApiResponse(200, {isLiked: isLiked}, "toggled video Like")
    )


})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment
    const userId = req.user?._id

    const comment = await Like.findOne({
        comment: commentId,
        likedBy: userId
    })

    let isLiked;

    if(!comment){
        await Like.create({
            comment: commentId,
            likedBy: userId
        })
        isLiked = true
    }else{
        await Like.findByIdAndDelete(comment._id)
        isLiked = false
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, {isLiked}, "toggled comment")
    )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    const userId = req.user?._id

    const tweet = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })

    let isLiked;

    if(!tweet){
        await Like.create({
            tweet: tweetId,
            likedBy: userId
        })
        isLiked = true
    }else{
        await Like.findByIdAndDelete(tweet._id)
        isLiked = false
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, {isLiked : isLiked}, "tweet like toggled successfully")
    )

}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id
    
    const likes = await Like.find({likedBy: userId}).select("video")
    const videoIds = likes.map(like => like.video);

    const videos = await Video.find({ _id: { $in: videoIds } });
    // console.log(videos) 
    // throw new ApiError(400, "something went wrong")

    res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            videos,
            "Liked videos fetched successfully"
        )
    )
    

})


const  isVideoLiked = asyncHandler(async (req, res)=>{
    const {videoId} = req.params
    const userId = req.user?._id

    const like = await Like.findOne({
        video: videoId,
        likedBy: userId
    })

    let isLiked;
    if(like){
        isLiked=true
    }else{
        isLiked=false;
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {isLiked: isLiked},
            "isLiked found successfully"
        )
    )

})

const isTweetLiked = asyncHandler(async (req, res)=>{
    const {tweetId} = req.params
    const userId = req.user?._id

    const like = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    })

    let isLiked;
    if(like){
        isLiked=true
    }else{
        isLiked=false;
    }

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {isLiked: isLiked},
            "fetched tweet isliked"
        )
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    isVideoLiked,
    isTweetLiked
}