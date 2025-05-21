const Auth = require('../../model/authLogin/authLogin')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

        const token = jwt.sign(
            { userId: auth._id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            success: true,
            token,
            user: {
                username: auth.username,
                id: auth._id  // optionally include more info like role
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


exports.createLoginUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const auth = await Auth.findOne({ username });
        if (!auth) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            const savedAuthUser = new Auth({ username, password: hashedPassword });
            await savedAuthUser.save();
            res.status(201).json('User register successfully');
        }
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};