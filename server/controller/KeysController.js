import keys from "../model/keys.js";

async function GetPublicKey(req, res) {
    const { collegeId } = req.body;

    try {
        const collegeKeys = await keys.findOne({ collegeId: collegeId });

        if (!collegeKeys) {
            return res.status(404).json({ message: "Public key not found for the college" });
        }

        const publicKey = collegeKeys.publicKey;

        return res.status(200).json({ publicKey });
    } catch (error) {
        console.error("Error fetching public key:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export { GetPublicKey };