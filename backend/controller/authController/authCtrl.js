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
                id: auth._id , // optionally include more info like role
                username: auth.username,
                role: auth.role,
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

        // Admin registration PIN check
        if (role === 'admin') {
            if (admin_pin !== process.env.ADMIN_PIN) {
                return res.status(403).json({ success: false, message: 'Invalid admin PIN' });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const savedAuthUser = new Auth({ username, password: hashedPassword, role });
        await savedAuthUser.save();

        return res.status(201).json({ success: true, message: 'User registered successfully', role });
    } catch (err) {
        console.error('User creation error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};
