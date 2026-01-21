const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const app = express();
app.use(bodyParser.json());

// โหลด service account key (ดาวน์โหลดจาก Firebase Console)
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ✅ Route: ส่ง Notification
app.post('/send-notification', async (req, res) => {
  const { tokens, title, body, data } = req.body;

  try {
    let message = {};

    if (tokens && Array.isArray(tokens)) {
      // ส่งแบบหลาย token
      message = {
        notification: { title, body },
        data: data || {},
        tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      res.json({
        success: true,
        type: 'multicast',
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุ tokens[]',
      });
    }
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Route: สำหรับตรวจสอบว่า server ทำงานอยู่ไหม
app.get('/', (req, res) => {
  res.send('🔥 FCM Notification Server is running!');
});

// เริ่มต้น server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
