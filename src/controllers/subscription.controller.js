import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const userId = req.user?._id
    // TODO: toggle subscription

    const subscription = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    })

    let subscriber = {}
    let isSubscribed = false

    if(!subscription){
        subscriber = await Subscription.create({
            subscriber: userId,
            channel: channelId
        }, {new: true})
        isSubscribed = true
    }else{
        await Subscription.findByIdAndDelete(subscription?._id)
        isSubscribed = false
    }


    res
    .status(200)
    .json(
        new ApiResponse(200, {isSubscribed: isSubscribed}, "Subscription toggled!" )
    )

})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})


const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.user._id

    let subscribedChannels = await Subscription.find({subscriber: subscriberId})

    if(!subscribedChannels){
        subscribedChannels = []
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, subscribedChannels, "subscribed channels fetched successfully")
    )

})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}