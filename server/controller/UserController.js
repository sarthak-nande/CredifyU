import { UserModel } from "../model/user.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

async function GenerateAccessTokenAndRefreshToken(userId) {
    try {
        const user = await UserModel.findById(userId);
        const accesToken = user.getAccessToken();
        const refreshToken = user.refreshToken;

        await user.save({ validateBeforeSave: false });

        return { accesToken, refreshToken };

    } catch (error) {
        console.log("Error Occurred While Generating Access And Refresh Token", error);
    }
}

async function SignUp(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and Password is required!" })
        }

        const isEmailAlreadyPresent = await UserModel.findOne({
            email : email
        });

        console.log(isEmailAlreadyPresent)

        if (isEmailAlreadyPresent) {
            return res.status(400).json({
                message: "User Already Exist!"
            })
        }

        const hashPassword = await bcrypt.hash(password, 10);

        if (!isEmailAlreadyPresent) {
            const newUser = await UserModel.create({
                email: email,
                password: hashPassword
            })

            console.log(newUser);

            const getCreatedUser = await UserModel.findById(newUser._id);

            console.log(getCreatedUser);

            if (!getCreatedUser) {
                return res.status(400).json({
                    message: "Unable To Fetch Created User!"
                })
            }

            if (getCreatedUser) {
                const accessToken = getCreatedUser.getAccessToken();
                const refreshToken = getCreatedUser.getRefreshToken();

                getCreatedUser.refreshToken = refreshToken;

                await getCreatedUser.save();

                const options = {
                    httpOnly: true,
                    secure: true
                };

                const user = getCreatedUser;

                return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", refreshToken, options).json({ user, accessToken: accessToken, refreshToken: refreshToken });
            } else {
                return res.status(400).json({
                    message: "Error Occurred While Creating Account"
                });
            }
        }
        else {
            console.log("Sign-up Process Is Failed!");
            return res.status(400).json({
                message: "Sign-up Process Is Failed!"
            });
        }
    } catch (error) {
        console.log("Error While Doing SignUp " + error)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

async function LogIn(req, res, next) {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({
            email: email
        });

        console.log(user)

        if (!user) {
            return res.status(400).json({
                message: "User Not Found!"
            });
        }

        const checkPassword = await user.isPasswordCorrect(password);

        if (!checkPassword) {
            return res.status(400).json({
                message: "Incorrect Password"
            });
        }

        const { accesToken, refreshToken } = await GenerateAccessTokenAndRefreshToken(user._id);

        const loggedUserId = await UserModel.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        };

        return res.status(200).cookie("accessToken", accesToken, options).cookie("refreshToken", refreshToken, options).json({ user, accessToken: accesToken, refreshToken: refreshToken });

    } catch (error) {
        console.log("Error Occurred While Sign-In");
        return res.status(400).send({
            message: "Error Occurred While Sign-In"
        });
    }
}

async function GetUser(req, res) {
    try {
        const token = req.cookies.accessToken || req.body?.accessToken;

        console.log(token);

        if (!token) {
            res.status(400).json({
                message: "Unauthorized User"
            })
        }

        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await UserModel.findById(decodeToken?._id);

        if (!user) {
            return res.status(400).json({
                message: "Unauthorized User1"
            })
        }
        res.status(200).json({
            user
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

async function refreshAccessToken(req, res) {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        res.status(400).json({
            message: "Refresh token is required"
        })
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        console.log("decoded: ", decodedToken);

        const user = await UserModel.findById(decodedToken?._id)

        console.log("redess: ", user);

        if (!user) {
            res.status(400).json({
                message: "Inavlid refresh token"
            })
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            res.status(400).json({
                message: "Invalid refresh token"
            })
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id, user)
        console.log(accessToken, newRefreshToken);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json({ accessToken, refreshToken: newRefreshToken, message: "Access token refreshed" })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }

}

export { SignUp, LogIn, GetUser, refreshAccessToken }