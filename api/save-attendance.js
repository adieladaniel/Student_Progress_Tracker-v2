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

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    let connection;

    try {
        const { records } = req.body;

        if (!records || !Array.isArray(records) || records.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid data format. Expected array of records.'
            });
        }

        connection = await getConnection();
        await connection.beginTransaction();

        let successCount = 0;
        const errors = [];

        for (const record of records) {
            const requiredFields = ['date', 'rollno', 'name', 'class', 'branch', 'status'];
            const missingFields = requiredFields.filter(field => !record[field]);
            
            if (missingFields.length > 0) {
                errors.push(`Missing fields: ${missingFields.join(', ')}`);
                continue;
            }

            if (!['Present', 'Absent'].includes(record.status)) {
                errors.push(`Invalid status for Roll No ${record.rollno}`);
                continue;
            }

            try {
                await connection.execute(`
                    INSERT INTO attendance (date, rollno, name, class, branch, status)
                    VALUES (?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                        name = VALUES(name), 
                        status = VALUES(status)
                `, [
                    record.date,
                    record.rollno,
                    record.name,
                    record.class,
                    record.branch,
                    record.status
                ]);

                successCount++;
            } catch (error) {
                errors.push(`Roll No ${record.rollno}: ${error.message}`);
            }
        }

        await connection.commit();

        const response = {
            success: true,
            message: `Successfully saved attendance for ${successCount} students`,
            successCount: successCount,
            totalRecords: records.length
        };

        if (errors.length > 0) {
            response.warnings = errors;
        }

        return res.status(200).json(response);

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error: ' + error.message
        });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};