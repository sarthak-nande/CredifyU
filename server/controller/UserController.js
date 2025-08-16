import { UserModel } from "../model/user.js";
import bcrypt from "bcrypt"
import { generateKey } from "crypto";
import jwt from "jsonwebtoken"
import { generateKeys } from "../middleware/keysGenaratator.js";
import keys from "../model/keys.js";
import { encryptText } from "../middleware/crpytoGenarator.js";
import { sendOTP, verifyOTP } from "../middleware/otpGenerator.js";
import { sendQRCode } from "../middleware/qrSender.js";
import { sendBulkQRCodes } from "../middleware/bulkQrSender.js";

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
        const { email, password, Name, CollegeName, phone, CollegeAddress } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and Password is required!" })
        }

        const isEmailAlreadyPresent = await UserModel.findOne({
            email: email
        });

        if (isEmailAlreadyPresent) {
            return res.status(400).json({
                message: "User Already Exist!"
            })
        }

        // Send OTP for email verification
        await sendOTP(email);
        
        return res.status(200).json({ 
            message: "OTP sent to your email. Please verify to complete registration.",
            email: email,
            requiresOTP: true
        });

    } catch (error) {
        console.log("Error While Doing SignUp " + error)
        return res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

// Complete signup after OTP verification
async function CompleteSignup(req, res) {
    try {
        const { email, password, otp, Name, CollegeName, phone, CollegeAddress } = req.body;

        if (!email || !password || !otp) {
            return res.status(400).json({ message: "Email, password, and OTP are required!" })
        }

        // Verify OTP first
        const isOTPValid = await verifyOTP(email, otp);

        if (!isOTPValid.success) {
            return res.status(400).json({ 
                message: isOTPValid.message,
                verified: true 
            });
        }

        // Check if user already exists
        const isEmailAlreadyPresent = await UserModel.findOne({
            email: email
        });

        if (isEmailAlreadyPresent) {
            return res.status(400).json({
                message: "User Already Exist!"
            })
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const newUser = await UserModel.create({
            email: email,
            password: hashPassword
        })

        const getCreatedUser = await UserModel.findById(newUser._id);

        if (!getCreatedUser) {
            return res.status(400).json({
                message: "Unable To Fetch Created User!"
            })
        }

        if (getCreatedUser) {
            const accessToken = getCreatedUser.getAccessToken();
            const refreshToken = getCreatedUser.getRefreshToken();

            getCreatedUser.refreshToken = refreshToken;

            const { publicKey, privateKey } = await generateKeys();

            if (!publicKey || !privateKey) {
                return res.status(500).json({ message: "Error Generating Keys" });
            }

            const { iv, data } = await encryptText(privateKey);

            if (!iv || !data) {
                return res.status(500).json({ message: "Error Encrypting Keys" });
            }

            const createdKeys = await keys.create({
                publicKey: publicKey,
                privateKey: data,
                privateKeyIv: iv,
                collegeId: getCreatedUser._id
            });

            if (!createdKeys) {
                return res.status(500).json({ message: "Error Saving Keys" });
            }

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
    } catch (error) {
        console.log("Error While Completing SignUp " + error)
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

async function RefreshAccessToken(req, res) {
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

        const user = await UserModel.findById(decodedToken?._id)

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

async function SaveUserDetails(req, res) {
    try {
        const { Name, collegeName, phone, collegeAddress } = req.body;
        const accessToken = req.cookies.accessToken || req.body?.accessToken;

        if (!accessToken) {
            return res.status(400).json({
                message: "Unauthorized User"
            });
        }

        const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

        if (!decodedToken) {
            return res.status(400).json({
                message: "Invalid Access Token"
            });
        }

        const userId = decodedToken._id;

        if (!userId) {
            return res.status(400).json({
                message: "User ID not found in token"
            });
        }

        const updatedUser = await UserModel.findByIdAndUpdate(userId, {
            Name,
            collegeName,
            phone,
            collegeAddress,
            isProfileComplete: true
        }, { new: true });

        if (!updatedUser) {
            return res.status(400).json({
                message: "Error updating user details"
            });
        }

        return res.status(200).json({
            message: "User details updated successfully",
            user: updatedUser
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

async function CollegeNames(req, res) {
    try {

        const colleges = await UserModel.find();

        if (!colleges || colleges.length === 0) {
            return res.status(404).json({
                message: "No colleges found"
            });
        }

        const collegeNames = colleges.map(college => ({
            id: college._id,
            name: college.collegeName || "Unknown College"
        }));

        return res.status(200).json({
            colleges: collegeNames
        });

    } catch (error) {
        console.log("Error Occurred While Fetching College Names", error);
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }

}

// Send OTP to email
async function SendOTP(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required!" });
        }

        await sendOTP(email);
        return res.status(200).json({ message: "OTP sent successfully to your email" });

    } catch (error) {
        console.log("Error Occurred While Sending OTP", error);
        return res.status(500).json({
            message: "Failed to send OTP. Please try again."
        });
    }
}

// Verify OTP
async function VerifyOTP(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required!" });
        }

        const result = await verifyOTP(email, otp);


        if (result.success) {
            return res.status(200).json({ 
                message: result.message,
                verified: true 
            });
        } else {
            return res.status(400).json({ 
                message: result.message,
                verified: false 
            });
        }

    } catch (error) {
        console.log("Error Occurred While Verifying OTP", error);
        return res.status(500).json({
            message: "Failed to verify OTP. Please try again."
        });
    }
}

// Send QR Code to email (single student)
async function SendQRCode(req, res) {
    try {
        const { email, qrData } = req.body;

        if (!email || !qrData) {
            return res.status(400).json({ message: "Email and QR data are required!" });
        }

        await sendQRCode(email, qrData);
        return res.status(200).json({ message: "QR code sent successfully to your email" });

    } catch (error) {
        console.log("Error Occurred While Sending QR Code", error);
        return res.status(500).json({
            message: "Failed to send QR code. Please try again."
        });
    }
}

// Send QR Codes to multiple students
async function SendBulkQRCodes(req, res) {
    try {
        const { students } = req.body;

        if (!students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ message: "Students array is required and must not be empty!" });
        }

        // Validate each student object
        for (const student of students) {
            if (!student.email || !student.qrData) {
                return res.status(400).json({ 
                    message: "Each student must have email and qrData fields!" 
                });
            }
        }

        const result = await sendBulkQRCodes(students);
        
        return res.status(200).json({ 
            message: `QR codes sent successfully! ${result.successful} successful, ${result.failed} failed.`,
            ...result
        });

    } catch (error) {
        console.log("Error Occurred While Sending Bulk QR Codes", error);
        return res.status(500).json({
            message: "Failed to send QR codes. Please try again."
        });
    }
}

export { SignUp, CompleteSignup, LogIn, GetUser, RefreshAccessToken, SaveUserDetails, CollegeNames, SendOTP, VerifyOTP, SendQRCode, SendBulkQRCodes };