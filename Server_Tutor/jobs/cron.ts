import CourseModal from "../models/courses.model";

// jobs/cron.js
import cron from "node-cron";

// Scheduled job that runs daily to delete courses older than 12 months
cron.schedule('0 0 * * *', async () => {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    // Find and delete courses older than 12 months with a status of 'deleted'
    await CourseModal.deleteMany({
      status: 'deleted',
      deletedAt: { $lte: twelveMonthsAgo },
    });

    console.log('Old deleted courses removed successfully.');
  } catch (error) {
    console.error('Error deleting old courses:', error);
  }
});
