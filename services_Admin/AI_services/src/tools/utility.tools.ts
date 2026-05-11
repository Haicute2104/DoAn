import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const getCurrentDateTool = tool(
  async () => {
    const now = new Date();
    const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
    const dayOfWeek = days[now.getDay()];
    const dateStr = now.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = now.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `Hôm nay là ${dayOfWeek}, ${dateStr}, lúc ${timeStr}.`;
  },
  {
    name: "get_current_date",
    description:
      "Lấy ngày, giờ, thứ, tháng, năm hiện tại chính xác từ hệ thống. BẮT BUỘC gọi tool này khi user hỏi về ngày, giờ, thứ, tháng, năm.",
    schema: z.object({}),
  }
);

export const getWeatherTool = tool(
  async ({ city }) => {
    // Lấy API key từ biến môi trường
    const apiKey = process.env.OPENWEATHER_API_KEY; 
    
    if (!apiKey) {
      return "Lỗi hệ thống: Chưa cấu hình OPENWEATHER_API_KEY.";
    }

    try {
      // Gọi API OpenWeather
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=vi`
      );

      // Xử lý case nhập sai tên thành phố hoặc lỗi API
      if (!response.ok) {
        if (response.status === 404) {
          return `Không tìm thấy thông tin thời tiết cho thành phố "${city}".`;
        }
        return `Lỗi API khi lấy thời tiết cho ${city} (Status: ${response.status}).`;
      }

      const data = await response.json();
      
      // Bóc tách dữ liệu cần thiết
      const description = data.weather[0].description; // vd: "bầu trời quang đãng"
      const temp = data.main.temp;                     // vd: 28.5
      const humidity = data.main.humidity;             // vd: 70

      return `Thời tiết ở ${city} hiện tại là ${description}, nhiệt độ khoảng ${temp}°C, độ ẩm ${humidity}%.`;
      
    } catch (error) {
      // Bắt lỗi network hoặc các lỗi không lường trước
      return `Đã xảy ra lỗi khi kết nối đến dịch vụ thời tiết: ${(error as Error).message}`;
    }
  },
  {
    name: "get_weather",
    description: "Lấy thông tin thời tiết thực tế và nhiệt độ của một thành phố",
    schema: z.object({
      city: z.string().describe("Tên thành phố cần xem thời tiết (VD: Hanoi, London, Tokyo)"),
    }),
  },
);