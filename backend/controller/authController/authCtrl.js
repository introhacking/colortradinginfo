const Auth = require('../../model/authLogin/authLogin')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.getUsers = async (req, res) => {
    try {
        const users = await Auth.find().select('_id username role allowedScreens verify createdAt updatedAt');;
        return res.status(200).json({ success: true, users });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const auth = await Auth.findOne({ username });

        if (!auth) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }


        const isMatch = await bcrypt.compare(password, auth.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if user is verified
        if (!auth.verify) {
            return res.status(403).json({ success: false, message: 'You are not verified, please contact to Admin' });
        }
        const token = jwt.sign(
            { userId: auth._id },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.status(200).json({
            success: true,
            token,
            user: {
                id: auth._id, // optionally include more info like role
                username: auth.username,
                role: auth.role,
                allowedScreens: auth.allowedScreens,
                disclaimer: auth.disclaimer
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.createLoginUser = async (req, res) => {
    const { username, password, role = 'user', admin_pin } = req.body;
    try {
        const auth = await Auth.findOne({ username });

        if (auth) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        let isVerified = false;

        // Admin registration PIN check
        if (role === 'admin') {
            if (admin_pin !== process.env.ADMIN_PIN) {
                return res.status(403).json({ success: false, message: 'Invalid admin PIN' });
            }
            isVerified = true
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const savedAuthUser = new Auth({ username, password: hashedPassword, role, verify: isVerified });
        await savedAuthUser.save();

        return res.status(201).json({ success: true, message: 'User registered successfully', role });
    } catch (err) {
        console.error('User creation error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.verifyUserByAdmin = async (req, res) => {
    const { userId } = req.params;
    const { verify } = req.body;

    try {
        const user = await Auth.findByIdAndUpdate(userId, { verify: verify }, { new: true });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        return res.status(200).json({ success: true, message: `User ${verify ? 'verified' : 'unverified'} successfully` });
    } catch (err) {
        console.error('Verification error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.updateUserDisclaimer = async (req, res) => {
    try {
        const { userId } = req.body;

        const updatedUser = await Auth.findByIdAndUpdate(
            userId,
            { disclaimer: true },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteUserByAdmin = async (req, res) => {
    const { userId } = req.params;
    const { admin_pin, currentUserId } = req.body;
    try {
        const user = await Auth.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Prevent self-delete without correct admin pin
        if (user._id.toString() === currentUserId.toString()) {
            if (!admin_pin || admin_pin !== process.env.ADMIN_PIN) {
                return res.status(403).json({
                    success: false,
                    message: 'Required valid Admin PIN to delete your own account'
                });
            }
        }

        await Auth.findByIdAndDelete(userId);

        return res.status(200).json({
            success: true,
            message: `User '${user.username}' deleted successfully`
        });

    } catch (err) {
        console.error('Delete error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


exports.allowedScreensUpdate = async (req, res) => {
    const { allowedScreens } = req.body;
    try {
        const updatedUser = await Auth.findByIdAndUpdate(
            req.params.id,
            { allowedScreens },
            { new: true }
        );
        res.json({ message: 'Permissions updated', data: updatedUser });
    } catch (error) {
        res.status(500).json({ error: 'Update failed' });
    }
}


// exports.deleteUserByAdmin = async (req, res) => {
//     const { userId } = req.params;
//     try {
//         const deletedUser = await Auth.findByIdAndDelete(userId);

//         if (!deletedUser) {
//             return res.status(404).json({ success: false, message: 'User not found' });
//         }
//         await Auth.deleteOne({ _id: userId })

//         return res.status(200).json({ success: true, message: 'User deleted successfully' });
//     } catch (err) {
//         console.error('Delete user error:', err);
//         return res.status(500).json({ success: false, message: 'Server error' });
//     }
// };
