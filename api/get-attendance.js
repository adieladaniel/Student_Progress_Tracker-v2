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
        const { rollno, class: className, branch } = req.query;

        if (!rollno || !className || !branch) {
            return res.status(400).json({
                success: false,
                message: 'Missing required parameters: rollno, class, and branch are required'
            });
        }

        connection = await getConnection();

        const [rows] = await connection.execute(`
            SELECT date, status, name, created_at
            FROM attendance
            WHERE rollno = ? 
            AND class = ? 
            AND branch = ?
            ORDER BY date DESC
        `, [rollno, className, branch]);

        let presentCount = 0;
        let absentCount = 0;

        rows.forEach(record => {
            if (record.status === 'Present') {
                presentCount++;
            } else {
                absentCount++;
            }
        });

        const totalDays = rows.length;
        const percentage = totalDays > 0 ? Math.round((presentCount / totalDays) * 100 * 10) / 10 : 0;

        return res.status(200).json({
            success: true,
            attendance: rows,
            stats: {
                present: presentCount,
                absent: absentCount,
                total: totalDays,
                percentage: percentage
            }
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