import { asyncHandler } from '../utils/asyncHandler.js'
import mongoose, { isValidObjectId } from 'mongoose'
import { ApiError } from '../utils/ApiError.js'
import { Playlist } from '../models/playlist.model.js'
import { ApiResponse } from '../utils/ApiResponse.js'

const createPlaylist = asyncHandler(async (req, res)=>{
    const {name, description } = req.body
    const userId = req.user?._id


    if(!name || !description ){
        throw new ApiError(400, "both name and description are required for playlist")
    }

    const playlist = await Playlist.create({
        name: name,
        description: description,
        owner: userId

    })

    if(!playlist){
        throw new ApiError(500, "Error while creating playlist")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "playlist crated successfully")
    )
})


const getPlaylistById = asyncHandler(async (req, res)=>{
    const { playlistId } = req.params

    const valid = isValidObjectId(playlistId)

    if(valid !== true){
        throw new ApiError(400, "Give me a valid Object ID")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "playlist does not exist")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "playlist fetched successfully!")
    )

})

const addVideoToPlaylist = asyncHandler( async (req, res)=>{
    const {playlistId, videoId} = req.query

    if (!playlistId || !mongoose.isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist Id is invalid or provide playlist ID")
      }
      if (!videoId || !mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video ID")
      }

      const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {$push: {videos: videoId}},
        {new: true, useFindAndModify: false}
      )

      res
      .status(200)
      .json(
        new ApiResponse(200, updatedPlaylist, "Video added to playlist")
      )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
 
    const playlists = await Playlist.find({owner: userId})

    res
    .status(200)
    .json(
        new ApiResponse(200, playlists, "playlist fetched successfully!")
    )
    
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "give me a valid playlist Id")
    }


    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletedPlaylist){
        throw new ApiError(400, "the playlist does not exist!")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, "playlist deleted successfully!")
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body


    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Give me a valid playlist Id")
    }

    const body ={}
    if(name) body.name = name
    if(description) body.description = description

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        body,
        {new: true}
    )

    res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully!")
    )

})


const removeVideoFromPlaylist = asyncHandler(async (req, res) => { 
    const {playlistId, videoId} = req.query


    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },
        { new: true, useFindAndModify: false }
      )


    if(!updatedPlaylist){
        throw new ApiError(400, "playlist does not exist")
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, updatedPlaylist, "Video removed from playlist")
    )

})





export {
    createPlaylist,
    getPlaylistById,
    addVideoToPlaylist,
    getUserPlaylists,
    deletePlaylist,
    updatePlaylist,
    removeVideoFromPlaylist
}