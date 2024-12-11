import mongoose, { Model, Document } from "mongoose";

interface MonthData {
  month: string;
  count: number;
}

export async function generateLast12MonthsData<T extends Document>(
  model: Model<T>,
  tutorId?: string // Thêm tham số tutorId nếu cần lọc theo tutor
): Promise<{ last12Months: MonthData[] }> {
  const last12Months: MonthData[] = [];
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);

  for (let i = 11; i >= 0; i--) {
    const endDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - i * 28
    );
    const startDate = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      endDate.getDate() - 28
    );

    const monthYear = endDate.toLocaleString("vi-VN", {
      day: "numeric",
      month: "short",
      // year: "numeric",
    });

    // Nếu tutorId được cung cấp, chỉ đếm các đơn hàng của tutor đó
    const query: any = {
      createdAt: {
        $gte: startDate,
        $lt: endDate,
      },
    };

    if (tutorId) {
      query.tutor = new mongoose.Types.ObjectId(tutorId); // Giả sử có trường `tutor` để xác định đơn hàng của tutor
    }

    const count = await model.countDocuments(query);

    last12Months.push({ month: monthYear, count });
  }

  return { last12Months };
}
