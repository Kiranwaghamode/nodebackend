import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    const userId = req.user?._id

    const tweet = await Tweet.create({
        content: content,
        owner: userId
    })

    if(!tweet){
        throw new ApiError(400, "Error while creating tweet document")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, tweet, "tweet created successfully!")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { username } = req.params

    const user = await User.findOne({username: username})
    const userId = user._id
    const userTweets = await Tweet.find({owner: userId})

    res
    .status(200)
    .json(
        new ApiResponse(200, userTweets, "Tweets fetched successfully!")
    )
})

const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "invalid tweetId")
    }

    if(!content){
        throw new ApiError(400, "Content is required!")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {content},
        {new: true}
    )

    res
    .status(200)
    .json(
        new ApiResponse(200, updatedTweet, "tweet updated successfully!")
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Give me a valid tweet ID")
    }

    await Tweet.findByIdAndDelete(tweetId)

    res
    .status(200)
    .json(
        new ApiResponse(200, "Tweet deleted successfully!")
    )
})


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}
