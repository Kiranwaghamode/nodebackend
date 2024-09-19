import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { deleteOnCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefreshTokens = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Error while generating tokens")
    }


}

const registerUser = asyncHandler(async (req, res)=>{
    
    


    //get user details from front-end --- done
    const {fullname, email, username, password} = req.body
   

    // throw new ApiError(400, "email error")

    // validation - not empty -- done
    if(
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError( 400, "Any field should not be empty")
    }

    
    // check if the user already exist : username , email
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
         throw new ApiError(409, "User with email already exist")
    }


    // check for images , check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0].path;

    

     
    

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }
    
    // upload them to cloudinary , avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    // check for user creation 
    // remove password and refresh token field from response

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Error while storing user")
    }


    // return the response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
    
   
})


const loginUser = asyncHandler( async (req, res)=>{
    //req.boyd -> data
    // username or email
    // find the user
    // password check 
    // access and refresh token generate
    // send cookie

    const {email, username, password} = req.body

    


    // throw new ApiError(400, "login Error")

    if(!username && !email){
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]

    })

    if(!user){
        throw new ApiError(404, "user does not exist" )
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(404, "Invalid credentials" )
    }

    const {accessToken , refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select(("-password -refreshToken"))

    const options = {
        httpOnly: true,
        secure: true,
        maxAge: 7 * 24 * 60 * 60 * 1000
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully"
        )
    )


})


const logout = asyncHandler( async (req, res)=>{

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }


    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"))
})


const refreshAccessToken = asyncHandler(async (req, res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "UNAUTHORIZED REQUEST")
    }

 try {
       const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
   
       const user = await User.findById(decodedToken?._id)
   
       if(!user){
           throw new ApiError(401 , "invalid refresh token")
       }
   
       if(incomingRefreshToken !== user?.refreshToken){
           throw new ApiError(401, "Refresh token is expired")
       }
   
       const options = {
           httpOnly: true,
           secure: true
       }
   
       const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user?._id);
   
       return res
       .status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", newRefreshToken, options)
       .json(
           new ApiResponse(
               200,
               {
                   AccessToken: accessToken,
                   refreshToken: newRefreshToken
               },
               "Access token refreshed"
           )
       )
 } catch (error) {
    throw new ApiError(401, error?.message || "invalid refresh token")
 }



})


const changeCurrentPassword = asyncHandler(async (req, res)=>{

    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old Password")
    }

    user.password = newPassword;

    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password updated successfully"
        )
    )


})


const getCurrentUser = asyncHandler(async (req, res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200, req.user, "current user fetched successfully")
    )
})


const updateAccountDetails = asyncHandler(async (req, res)=>{

    const {fullname, email} = req.body

    if(!fullname || !email){
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname: fullname,
                email: email

            }
        },
        {new: true}

    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, 
            user,
            "Account details updated successfully"
        )
    )


})


const updateUserAvatar = asyncHandler(async (req, res)=>{
    // console.log(req.file?.path);
    const avatarLocalPath = req.file?.path
    console.log(avatarLocalPath);


    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is missing")

    }



    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(500, "error while uploading on cloudinary")
    }

    await deleteOnCloudinary(req.user?.avatar);

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "avatar Image updated successfully")
    )

})

const updateUserCoverImage = asyncHandler(async (req, res)=>{
    const coverImageLocalPath = req.file?.path
    console.log(req);

    if(!coverImageLocalPath){
        throw new ApiError(400, "cover image file is missing")

    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(500, "error while uploading on cloudinary")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Cover Image updated successfully")
    )
})

const getUserChannelProfile = asyncHandler(async (req,res)=>{

    const { username } = req.params

    if(!username?.trim()){
        throw new ApiError(400, "Username is missing")

    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project:{
                fullname: 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscribersCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1
            }
        }
    ])

    if(!channel?.length){
        throw new ApiError(404, "Channel does not exist!")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )


})

const getWatchHistory = asyncHandler(async (req, res)=>{

    const user = await User.aggregate([
        {
            $match:{
                _id:  new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1, 
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
                
            }
        }

    ])


    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory, "Watch History fetched successfully")
    )


})

const getUserById = asyncHandler(async(req, res)=>{
    const { username } = req.params

    const user = await User.findOne({username: username})

    res
    .status(200)
    .json(
        new ApiResponse(
            200, {user: user}, "User fetched successfully"
        )
    )
})

const getUserByUsername = asyncHandler(async (req, res)=>{
    const { userId } = req.params

    if(!userId){
        throw new ApiError(400, "User Id cannot be undefined")
    }

    const user = await User.findById(userId).select(
        "-password -refreshToken"
    )

    res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {user: user},
            "User fetched succesfully"
        )
    )
})


const pushVideoToWatchHistory = asyncHandler(async(req, res)=>{
    const { videoId } = req.params
    const userId = req.user._id

    const user = await User.findById(userId)

    if (!user.watchHistory.includes(videoId)){
        user.watchHistory.push(videoId); 
        await user.save(); 
      } 

    res
    .status(200)
    .json(
        new ApiResponse(200, "pushed to watch history")
    )

})


export {
     registerUser,
     loginUser,
     logout,
     refreshAccessToken,
     changeCurrentPassword,
     getCurrentUser,
     updateAccountDetails,
     updateUserAvatar,
     updateUserCoverImage,
     getUserChannelProfile,
     getWatchHistory,
     getUserById,
     pushVideoToWatchHistory,
     getUserByUsername
 }
 