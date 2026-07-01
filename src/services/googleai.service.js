const GCP_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_MODEL = 'gemini-flash-latest';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `Bạn là STU AI - trợ lý ảo thông minh của nền tảng STULance (nền tảng kết nối sinh viên Freelancer với doanh nghiệp Việt Nam).

THÔNG TIN NỀN TẢNG:
- STULance kết nối sinh viên tài năng với dự án Freelance thực tế
- Sinh viên có thể: tìm việc làm, đăng bán dịch vụ, xây dựng portfolio
- Doanh nghiệp có thể: đăng tin tuyển dụng, tìm kiếm ứng viên, đặt dịch vụ
- Hỗ trợ: hợp đồng điện tử, thanh toán VNPay, escrow, tranh chấp
- Liên kết: 50+ trường đại học, 150+ doanh nghiệp

CHỨC NĂNG CHÍNH:
1. HỎI ĐÁP: Trả lời câu hỏi về nền tảng, hướng dẫn sử dụng, mẹo Freelance
2. CHẤM ĐIỂM CV: Phân tích điểm mạnh/yếu của CV, đưa ra gợi ý cải thiện
3. MATCHING JOB: Phân tích kỹ năng và gợi ý việc làm phù hợp

QUY TẮC:
- Trả lời bằng tiếng Việt, thân thiện, chuyên nghiệp
- Nếu không biết câu trả lời, nói rõ và gợi ý liên hệ support
- Luôn hữu ích và cụ thể
- Dùng emoji hợp lý để tăng trải nghiệm`;

async function callGemini(prompt) {
  const body = {
    contents: [{
      parts: [{ text: `${SYSTEM_PROMPT}\n\n${prompt}` }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  };

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': GCP_API_KEY
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API Error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Không nhận được phản hồi từ AI');
  return text;
}

// ===== CHỨC NĂNG 1: HỎI ĐÁP =====
export async function chatWithAI(userMessage, chatHistory = []) {
  const historyContext = chatHistory.slice(-6).map(m =>
    `${m.isMe ? 'Người dùng' : 'STU AI'}: ${m.text}`
  ).join('\n');

  const prompt = historyContext
    ? `Lịch sử trò chuyện:\n${historyContext}\n\nNgười dùng: ${userMessage}`
    : userMessage;

  return await callGemini(prompt);
}

// ===== CHỨC NĂNG 2: CHẤM ĐIỂM CV =====
export async function scoreCV(cvText, userProfile = {}) {
  const profileInfo = userProfile.skills
    ? `Kỹ năng hiện tại: ${userProfile.skills.join(', ')}`
    : '';

  const prompt = `Hãy chấm điểm và phân tích CV/hồ sơ sau của sinh viên trên nền tảng STULance:

--- CV/PROFILE ---
${cvText || 'Chưa có thông tin chi tiết'}
${profileInfo}

--- YÊU CẦU CHẤM ĐIỂM ---
1. ĐIỂM TỔNG (0-100): Đánh giá tổng quan
2. ĐIỂM MẠNH (3 điểm): Nên phát huy
3. ĐIỂM YẾU (3 điểm): Cần cải thiện
4. GỢI Ý CỤ THỂ: 3 hành động nên làm ngay
5. ĐÁNH GIÁ: Mức độ cạnh tranh trên STULance (Cao/Trung bình/Thấp)

Trả lời ngắn gọn, dễ hiểu, có emojis.`;

  return await callGemini(prompt);
}

// ===== CHỨC NĂNG 3: MATCHING JOB =====
export async function matchJobs(userProfile, availableJobs = []) {
  const jobsList = availableJobs.map(j =>
    `- ${j.title} (${j.jobType}) | Lương: ${j.salary?.toLocaleString() || 'Thỏa thuận'} VND | ${j.enterpriseName || 'N/A'} | Yêu cầu: ${j.requirements || 'Không có'}`
  ).join('\n');

  const prompt = `Phân tích hồ sơ sinh viên và gợi ý việc làm phù hợp nhất:

--- HỒ SƠ SINH VIÊN ---
Kỹ năng: ${userProfile.skills?.join(', ') || 'Chưa cập nhật'}
Kinh nghiệm: ${userProfile.experience || 'Chưa có kinh nghiệm'}
Vị trí: ${userProfile.location || 'Toàn quốc'}
Sở thích: ${userProfile.interests || 'Chưa rõ'}

--- DANH SÁCH VIỆC LÀM HIỆN CÓ ---
${jobsList || 'Hiện chưa có việc làm phù hợp'}

--- YÊU CẦU ---
1. Phân tích 3 việc làm PHÙ HỢP NHẤT (điểm matching %)
2. Giải thích TẠI SAO phù hợp
3. Gợi ý 2 việc làm MỚI nên thử (nếu có)
4. Lời khuyên để tăng cơ hội ứng tuyển

Trả lời ngắn gọn, dễ hiểu, có emojis.`;

  return await callGemini(prompt);
}

export default { chatWithAI, scoreCV, matchJobs };
