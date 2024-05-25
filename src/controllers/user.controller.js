import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";




const registerUser = asyncHandler(async (req, res)=>{
    
    


    //get user details from front-end --- done
    const {fullname, email, username, password} = req.body


    // validation - not empty -- done
    if(
        [fullname, email, username, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError( 400, "Any field should not be empty")
    }

    
    // check if the user already exist : username , email
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if(existedUser){
         throw new ApiError(409, "User with email already exist")
    }

    // check for images , check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0].path;

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






export { registerUser, }