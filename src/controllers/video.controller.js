import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { Video } from "../models/video.model.js";
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";

const publishVideo = asyncHandler(async(req, res)=>{

    const { title, description} = req.body

    const ownerId = req.user?._id;

    if(!title || !description){
        throw new ApiError(400, "Title and description both are required")
    }

    const thumbnailLocalPath = req.files?.thumbnail[0].path

    const videoLocalPath = req.files?.videoFile[0].path

    // console.log(thumbnailLocalPath)
    // console.log(videoLocalPath)

    
    
    if(!thumbnailLocalPath || !videoLocalPath){
        throw new ApiError(400, "Video and thumbnail both are required")
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    const videoFile = await uploadOnCloudinary(videoLocalPath)

    if(!thumbnail || !videoFile){
        throw new ApiError(500, "Error while uploading the thumbnail and video on cloudinary")
    }

    const video = await Video.create({
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        title: title,
        description: description,
        owner: ownerId,
        isPublished: true
    })

    if(!video){
        throw new ApiError(500, "Error while creating the entry in DB!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Video published successfully ")
    )


})

const getVideoById = asyncHandler(async(req, res)=>{
    const { videoId } = req.params

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400, "The video does not exist")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, video, "video fetched successfully!")
    )

})

const updateVideo = asyncHandler(async (req, res)=>{
    const { videoId } = req.params
    const { title, thumbnail, description} = req.body

    const videoDocument = await Video.findById(videoId)

    const oldThumbnail = videoDocument.thumbnail

   

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;

    const thumbnailLocalPath = req.file?.path
    // console.log(thumbnailLocalPath)

    if(!updateFields){
        throw new ApiError(400, "At least one field is required")
    }

    if(thumbnailLocalPath){
        const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        await deleteOnCloudinary(oldThumbnail)
        updateFields.thumbnail = thumbnail?.url
    }

    const updatedVideo = await Video.findByIdAndUpdate(videoId, updateFields, {new: true})

    if(!updatedVideo){
        throw new ApiError(500, "Error while updating the video details")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, updatedVideo, "The video Details updated successfully!")

    )
})

const deleteVideo = asyncHandler(async (req, res)=>{
    const {videoId} = req.params
    const userId = req.user?._id.toString()

    const video = await Video.findById(videoId)
    if(video.owner.toString() !== userId){
        throw new ApiError(400, "You cannot delete this video")
    }
    
    const videoUrl = video.videoFile
    await deleteOnCloudinary(videoUrl)

    await Video.deleteOne({_id: videoId})

    

    res
    .status(200)
    .json(
        new ApiResponse(200, "The video deleted successfully!")
    )

})

const getAllVideos = asyncHandler(async (req, res)=>{
    const { page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    const filter = {};
    if (query) {
      filter.$text = { $search: query };
    }
    if (userId) {
      filter.userId = userId;
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const skip = (pageNumber - 1) * limitNumber;

    const sort = {};
    sort[sortBy] = sortType === 'desc' ? -1 : 1;

    const videos = await Video.find()
      .sort(sort)
      .skip(skip)
      .limit(limitNumber);


    const totalVideos = await Video.countDocuments(filter);

    res
    .status(200)
    .json(
        new ApiResponse(200, {
            total: totalVideos,
            page: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(totalVideos / limitNumber),
            videos
          }, "fetched all videos successfully!")
    );
})

const getUserVideos = asyncHandler(async (req, res)=>{
    const { username } = req.params

    const user = await User.findOne({username: username})
    const userId = user._id
    const videos = await Video.find({owner: userId})

    if(!videos){
        throw new ApiError(500, "Error while finding user's videos!")

    }

    // console.log(videos)

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            videos,
            "user videos fetched successfully"
        )
    )

})



export {publishVideo, getVideoById, updateVideo, deleteVideo, getAllVideos, getUserVideos}
