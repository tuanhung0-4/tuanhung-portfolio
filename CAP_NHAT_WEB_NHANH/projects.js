// ========================================================
// DANH SÁCH DỰ ÁN VIDEO TIÊU BIỂU
// ========================================================
const PROJECTS = [
  // --- TVC BIỂN SỐ XE (GOOGLE DRIVE) ---
  {
    title: "TVC Showroom Biển Số Đẹp Thái Nguyên",
    cat: "tvc",
    client: "Biển Số Đẹp Thái Nguyên • Mr. Phạm Hồng Sơn",
    desc: "Video quảng bá showroom xe sang & hệ thống kho số VIP định danh toàn quốc.",
    video: "assets/drive/tvc_9232.mp4",
    thumb: "assets/drive/tvc_9232_thumb.jpg",
    badge: "★ Showroom VIP",
    duration: "01:13",
    isVertical: true
  },
  {
    title: "TVC Đẹp Hơn Mỗi Hành Trình - Kho Số Phong Thủy",
    cat: "tvc",
    client: "Biển Số Đẹp Thái Nguyên",
    desc: "Trình diễn bảng số ngũ quý, tứ quý, sảnh tiến và dịch vụ định danh xe sang đẳng cấp.",
    video: "assets/drive/tvc_fake1.mp4",
    thumb: "assets/drive/tvc_fake1_thumb.jpg",
    badge: "Kho Số Phong Thủy",
    duration: "01:11",
    isVertical: true
  },
  {
    title: "TVC Biển Đẹp VIP 20B - 198.99 Nhất Cửu Phát",
    cat: "tvc",
    client: "Biển Số Đẹp Thái Nguyên",
    desc: "Giới thiệu tấm biển số phong thủy thịnh vượng kết hợp kỹ xảo cận cảnh sắc nét.",
    video: "assets/drive/tvc_0202.mp4",
    thumb: "assets/drive/tvc_0202_thumb.jpg",
    badge: "Biển Đẹp 198.99",
    duration: "00:43",
    isVertical: true
  },
  {
    title: "TVC Biển Đẹp VIP 20B - 068.68 Lộc Phát Đỉnh Cao",
    cat: "tvc",
    client: "Biển Số Đẹp Thái Nguyên",
    desc: "TVC ngắn nhịp nhanh tối ưu tỷ lệ chuyển đổi cho nền tảng Reels & TikTok Ads.",
    video: "assets/drive/tvc_0922.mp4",
    thumb: "assets/drive/tvc_0922_thumb.jpg",
    badge: "Lộc Phát 068.68",
    duration: "00:31",
    isVertical: true
  },
  {
    title: "TVC Xe Sang Đi Kèm Biển Số Xứng Tầm",
    cat: "tvc",
    client: "Biển Số Đẹp Thái Nguyên",
    desc: "TVC đối thoại so sánh phong cách xe sang Audi Sport và biển số độc bản.",
    video: "assets/drive/tvc_3.mp4",
    thumb: "assets/drive/tvc_3_thumb.jpg",
    badge: "Xe Sang & Biển Số",
    duration: "00:35",
    isVertical: true
  },

  // --- SERIES HOẠT HÌNH & KỸ XẢO AI (YOUTUBE) ---
  {
    title: "Ken Sonic - Tốc Độ & Đường Đua Shadow",
    cat: "anime",
    client: "Kênh YouTube Ken Sonic (AI 4K)",
    desc: "Series hoạt hình Sonic đua siêu xe drift cháy lốp & đấu súng laser với Shadow.",
    video: "assets/sonic.mp4",
    thumb: "assets/channel_sonic.jpg",
    badge: "Sonic AI 4K",
    duration: "00:05",
    isVertical: false
  },
  {
    title: "Ken Mario - Đại Chiến Rồng Lửa",
    cat: "anime",
    client: "Kênh YouTube Ken Mario",
    desc: "Hoạt hình AI Mario & Bowser rượt đuổi và chiến đấu kịch tính đến từng khung hình.",
    video: "assets/mario.mp4",
    thumb: "assets/channel_mario.jpg",
    badge: "Mario AI",
    duration: "00:05",
    isVertical: false
  },
  {
    title: "Ken Football - Đường Đua Trực Thăng & Siêu Sao",
    cat: "anime",
    client: "Kênh YouTube Ken Football",
    desc: "Ronaldo vs Messi trên mọi địa hình hiểm trở và đấu trường tốc độ.",
    video: "assets/football1.mp4",
    thumb: "assets/channel_football.jpg",
    badge: "Bóng Đá AI",
    duration: "00:05",
    isVertical: false
  },
  {
    title: "Tom & Jerry - Cuộc Đua Ngựa Cơ Khí",
    cat: "anime",
    client: "Hoạt Hình AI Series",
    desc: "Tom & Jerry rượt đuổi vượt sa mạc và quái vật bão tuyết gay cấn.",
    video: "assets/tomjerry.mp4",
    thumb: "assets/channel_tomjerry.jpg",
    badge: "Tom & Jerry AI",
    duration: "00:05",
    isVertical: false
  },
  {
    title: "Ken Spider - Đại Chiến Venom & Thần Thú",
    cat: "anime",
    client: "Kênh YouTube Ken Spider",
    desc: "Spider-Man x Venom siêu kịch tính với mô-tô thần và đấu trường huyền thoại.",
    video: "assets/spider.mp4",
    thumb: "assets/channel_spider.jpg",
    badge: "Spider AI",
    duration: "00:05",
    isVertical: false
  },
  {
    title: "AI Cinematic - Phép Thuật & Bão Lửa",
    cat: "anime",
    client: "AI Kỹ Xảo Điện Ảnh",
    desc: "Kỹ xảo điện ảnh đỉnh cao kết hợp hiệu ứng CGI cháy nổ hoành tráng.",
    video: "assets/football2.mp4",
    thumb: "assets/channel_spider.jpg",
    badge: "Kỹ Xảo CGI",
    duration: "00:05",
    isVertical: false
  }
];

const CATS = {
  all: "Tất cả (11)",
  tvc: "TVC Biển Số (5)",
  ads: "TVC Quảng Cáo (Sắp có)",
  anime: "Hoạt hình AI (6)"
};
