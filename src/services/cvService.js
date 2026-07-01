import { chatWithAI } from './googleai.service';

// Store CV history in localStorage
const CV_STORAGE_KEY = 'stulance_cv_history';

function getCvHistory() {
  try {
    return JSON.parse(localStorage.getItem(CV_STORAGE_KEY) || '[]');
  } catch { return []; }
}

function saveCvHistory(cv) {
  const history = getCvHistory();
  const idx = history.findIndex(h => h.id === cv.id);
  if (idx >= 0) history[idx] = cv;
  else history.push({ ...cv, id: Date.now(), savedAt: new Date().toISOString() });
  localStorage.setItem(CV_STORAGE_KEY, JSON.stringify(history));
}

// ===== AI: CHẤM ĐIỂM CV =====
export async function scoreMyCV(cvData) {
  const cvText = buildCVText(cvData);

  const prompt = `Hãy đóng vai chuyên gia tuyển dụng HR hàng đầu Việt Nam. Chấm điểm CV sau của sinh viên:

--- CV ---
${cvText}

--- YÊU CẦU CHẤM ĐIỂM ---
1. **ĐIỂM TỔNG (0-100):** Chấm theo thang điểm:
   - Nội dung & Độ đầy đủ (30đ)
   - Kinh nghiệm thực tế (25đ)
   - Kỹ năng phù hợp (20đ)
   - Mục tiêu nghề nghiệp (15đ)
   - Định dạng & Trình bày (10đ)

2. **ĐIỂM MẠNH:** 3 điểm sáng nhất cần phát huy

3. **ĐIỂM YẾU:** 3 điểm yếu nhất cần cải thiện

4. **GỢI Ý CỤ THỂ:** 5 hành động nên làm ngay để nâng điểm

5. **ĐÁNH GIÁ MỨC ĐỘ CẠNH TRANH:**
   - Cao (>80): Rất nổi bật
   - Khá (60-80): Đủ tiêu chuẩn
   - Trung bình (40-60): Cần cải thiện
   - Thấp (<40): Phải thay đổi ngay

6. **SO SÁNH VỚI THỊ TRƯỜNG:** CV này so với sinh viên cùng ngành như thế nào?

Trả lời ngắn gọn, chuyên nghiệp, có emojis, dùng bullet points.`;

  return await chatWithAI(prompt);
}

// ===== AI: TỐI ƯU CV =====
export async function improveMyCV(cvData) {
  const cvText = buildCVText(cvData);

  const prompt = `Hãy đóng vai chuyên gia CV hàng đầu. Viết lại và tối ưu hóa toàn bộ CV sau:

--- CV GỐC ---
${cvText}

--- YÊU CẦU ---
Viết lại CV theo format chuẩn quốc tế với:
1. **Mục tiêu nghề nghiệp:** Ngắn gọn 2-3 dòng, tập trung vào giá trị mang lại
2. **Kinh nghiệm:** Viết lại bằng action verbs (Phát triển, Triển khai, Quản lý, Tối ưu...)
   - Mỗi mục kinh nghiệm: 3-5 bullet points mô tả kết quả cụ thể
   - Thêm số liệu đo lường nếu có thể
3. **Kỹ năng:** Phân loại rõ ràng (Kỹ năng cứng / Kỹ năng mềm / Công cụ)
4. **Dự án:** Mô tả chi tiết hơn với công nghệ sử dụng

YÊU CẦU FORMAT:
- Trả về JSON format với các key: objective, skills, experience (array [{role, company, time, desc}]), projects (array [{name, role, time, desc}])
- Trả về ĐÚNG JSON, không thêm markdown code block
- Nếu phần nào không thay đổi, giữ nguyên giá trị gốc`;

  const result = await chatWithAI(prompt);

  try {
    let cleaned = result.trim();
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return { success: true, data: parsed, raw: result };
  } catch {
    return { success: false, raw: result };
  }
}

// ===== AI: GỢI Ý CẢI THIỆN =====
export async function suggestImprovements(cvData) {
  const cvText = buildCVText(cvData);

  const prompt = `Phân tích CV sau và đưa ra 8 gợi ý cải thiện CỤ THỂ và THỰC TẾ:

--- CV ---
${cvText}

--- YÊU CẦU ---
Mỗi gợi ý cần:
- Tiêu đề ngắn gọn
- Mô tả chi tiết (nên làm gì, tại sao, làm thế nào)
- Mức độ ưu tiên (Cao/Trung bình/Thấp)
- Ví dụ cụ thể

Gợi ý cần bao gồm:
1. Cải thiện nội dung mục tiêu
2. Bổ sung kỹ năng thiếu
3. Tối ưu kinh nghiệm
4. Thêm dự án/portfolio
5. Chứng chỉ nên có
6. Định dạng CV
7. SEO CV (từ khóaATS)
8. Mẹo phỏng vấn

Trả lời dễ hiểu, practical, có emojis.`;

  return await chatWithAI(prompt);
}

// ===== AI: VIẾT MỤC TIÊU =====
export async function generateObjective(cvData) {
  const cvText = buildCVText(cvData);

  const prompt = `Viết 3版本 MỤC TIÊU NGHỀ NGHIỆP cho CV sau:

--- THÔNG TIN ---
${cvData.name ? `Tên: ${cvData.name}` : ''}
${cvData.title ? `Vị trí: ${cvData.title}` : ''}
${cvData.skills ? `Kỹ năng: ${cvData.skills}` : ''}
${cvData.education?.major ? `Chuyên ngành: ${cvData.education.major}` : ''}
${cvData.experience?.length ? `Kinh nghiệm: ${cvData.experience.map(e => e.role).join(', ')}` : 'Chưa có kinh nghiệm'}

--- YÊU CẦU ---
Viết 3 phiên bản mục tiêu:
1. **Ngắn gọn** (2 dòng) - Cho fresher/sinh viên
2. **Trung bình** (3-4 dòng) - Cho người có 1-2 năm KN
3. **Chi tiết** (5-6 dòng) - Cho người có nhiều KN

Mỗi bản:
- Bắt đầu bằng vị trí mong muốn
- Nêu giá trị bản thân mang lại
- Kết thúc bằng mục tiêu dài hạn
- Professional, không sáo rỗng

Trả về JSON: { short: "...", medium: "...", long: "..." }
Không thêm markdown code block.`;

  const result = await chatWithAI(prompt);

  try {
    let cleaned = result.trim();
    if (cleaned.startsWith('```')) cleaned = cleaned.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return { success: true, data: parsed, raw: result };
  } catch {
    return { success: false, raw: result };
  }
}

// ===== Helper: Convert CV object to text =====
function buildCVText(cv) {
  const lines = [];
  if (cv.name) lines.push(`Họ tên: ${cv.name}`);
  if (cv.title) lines.push(`Vị trí: ${cv.title}`);
  if (cv.email) lines.push(`Email: ${cv.email}`);
  if (cv.phone) lines.push(`SĐT: ${cv.phone}`);
  if (cv.address) lines.push(`Địa chỉ: ${cv.address}`);
  if (cv.birthday) lines.push(`Ngày sinh: ${cv.birthday}`);
  if (cv.objective) lines.push(`\nMục tiêu:\n${cv.objective}`);
  if (cv.education?.school) lines.push(`\nHọc vấn: ${cv.education.school} (${cv.education.time}) - ${cv.education.major}`);
  if (cv.education?.detail) lines.push(`Thành tích: ${cv.education.detail}`);
  if (cv.skills) lines.push(`\nKỹ năng:\n${cv.skills.split('\n').map(s => `- ${s}`).join('\n')}`);
  if (cv.experience?.length) {
    lines.push(`\nKinh nghiệm:`);
    cv.experience.forEach(exp => {
      lines.push(`- ${exp.role} tại ${exp.company} (${exp.time})`);
      if (exp.desc) lines.push(`  ${exp.desc}`);
    });
  }
  if (cv.projects?.length) {
    lines.push(`\nDự án:`);
    cv.projects.forEach(p => {
      lines.push(`- ${p.name} | ${p.role} (${p.time})`);
      if (p.desc) lines.push(`  ${p.desc}`);
    });
  }
  if (cv.certificates?.length) {
    lines.push(`\nChứng chỉ:`);
    cv.certificates.forEach(c => lines.push(`- ${c.name} (${c.time})`));
  }
  if (cv.hobbies) lines.push(`\nSở thích:\n${cv.hobbies.split('\n').map(h => `- ${h}`).join('\n')}`);
  return lines.join('\n');
}

export { getCvHistory, saveCvHistory, buildCVText };
