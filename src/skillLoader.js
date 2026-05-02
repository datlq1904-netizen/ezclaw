const fs = require('fs');
const path = require('path');

/**
 * Quét thư mục custom_skills và tải danh sách schema cùng hàm thực thi.
 * Trả về 2 đối tượng:
 * - schemas: Mảng chứa các JSON Object theo chuẩn Function Calling của OpenAI/Gemini.
 * - executables: Map chứa các hàm thực thi tương ứng với tên công cụ.
 * 
 * @param {string} customSkillsDir - Đường dẫn tuyệt đối đến thư mục chứa các skills.
 * @returns {Promise<{schemas: Array<Object>, executables: Map<string, Function>}>}
 */
async function loadCustomSkills(customSkillsDir) {
  const schemas = [];
  const executables = new Map();

  // Kiểm tra xem thư mục có tồn tại không, nếu không thì tự động tạo để user dễ copy
  if (!fs.existsSync(customSkillsDir)) {
    console.log(`[SkillLoader] Tạo mới thư mục custom_skills tại: ${customSkillsDir}`);
    fs.mkdirSync(customSkillsDir, { recursive: true });
    return { schemas, executables };
  }

  try {
    const folders = fs.readdirSync(customSkillsDir, { withFileTypes: true });

    for (const folder of folders) {
      if (!folder.isDirectory()) continue;

      const skillPath = path.join(customSkillsDir, folder.name);
      const schemaPath = path.join(skillPath, 'schema.json');
      const indexPath = path.join(skillPath, 'index.js');

      try {
        // 1. Đọc và parse schema.json
        if (!fs.existsSync(schemaPath)) {
          console.warn(`[SkillLoader] Bỏ qua skill '${folder.name}': Không tìm thấy schema.json`);
          continue;
        }
        
        const schemaRaw = fs.readFileSync(schemaPath, 'utf8');
        const schema = JSON.parse(schemaRaw);

        // Kiểm tra tính hợp lệ cơ bản của schema
        if (!schema.name || !schema.description) {
          console.warn(`[SkillLoader] Bỏ qua skill '${folder.name}': schema.json thiếu 'name' hoặc 'description'`);
          continue;
        }

        // 2. Nạp file index.js chứa hàm thực thi
        if (!fs.existsSync(indexPath)) {
          console.warn(`[SkillLoader] Bỏ qua skill '${folder.name}': Không tìm thấy index.js`);
          continue;
        }

        // Require module index.js
        const skillModule = require(indexPath);

        // Kiểm tra xem skill có export hàm execute không
        if (typeof skillModule.execute !== 'function') {
          console.warn(`[SkillLoader] Bỏ qua skill '${folder.name}': index.js không export hàm 'execute'`);
          continue;
        }

        // Nếu tất cả đều hợp lệ, lưu trữ
        schemas.push(schema);
        executables.set(schema.name, skillModule.execute);
        
        console.log(`[SkillLoader] Đã nạp thành công skill: ${schema.name}`);

      } catch (err) {
        // Log lỗi cụ thể của từng skill và tiếp tục vòng lặp
        // Điều này đảm bảo 1 skill lỗi không làm sụp toàn bộ danh sách skill
        console.error(`[SkillLoader] Lỗi khi nạp skill từ thư mục '${folder.name}':`, err.message);
      }
    }
  } catch (err) {
    console.error(`[SkillLoader] Lỗi nghiêm trọng khi đọc thư mục custom_skills:`, err.message);
  }

  return { schemas, executables };
}

module.exports = { loadCustomSkills };
