const mysql = require('mysql2/promise');

async function getConnection() {
    return await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });
}

module.exports = async (req, res) => {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({ success: true });
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    let connection;

    try {
        const { class: className, branch } = req.query;

        if (!className) {
            return res.status(400).json({
                success: false,
                message: 'Class parameter required'
            });
        }

        connection = await getConnection();

        let sql = "SELECT DISTINCT rollno, name FROM attendance WHERE class = ?";
        const params = [className];

        if (branch) {
            sql += " AND branch = ?";
            params.push(branch);
        }

        sql += " ORDER BY rollno ASC";

        const [students] = await connection.execute(sql, params);

        return res.status(200).json({
            success: true,
            students: students,
            count: students.length
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Database error: ' + error.message
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};