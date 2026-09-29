// Mirrors backend_ai_smart_match/app/constants/job_taxonomy.py — keep
// slugs identical, this is the single source of truth for filter labels.
// Each entry: [slug, Vietnamese label, English label].

export type TaxonomyEntry = { value: string; label_vn: string; label_en: string };

const toEntries = (rows: [string, string, string][]): TaxonomyEntry[] =>
    rows.map(([value, label_vn, label_en]) => ({ value, label_vn, label_en }));

export const CATEGORY_L1 = toEntries([
    ["business_sales", "Kinh doanh/Bán hàng", "Business/Sales"],
    ["marketing_pr_ads", "Marketing/PR/Quảng cáo", "Marketing/PR/Advertising"],
    ["customer_service_ops", "Chăm sóc khách hàng/Vận hành", "Customer Service/Operations"],
    ["hr_admin_legal", "Nhân sự/Hành chính/Pháp chế", "HR/Admin/Legal"],
    ["it", "Công nghệ thông tin", "Information Technology"],
    ["finance_banking_insurance", "Tài chính/Ngân hàng/Bảo hiểm", "Finance/Banking/Insurance"],
    ["real_estate", "Bất động sản", "Real Estate"],
    ["construction", "Xây dựng", "Construction"],
    ["accounting_audit_tax", "Kế toán/Kiểm toán/Thuế", "Accounting/Audit/Tax"],
    ["manufacturing", "Sản xuất", "Manufacturing"],
    ["education_training", "Giáo dục/Đào tạo", "Education/Training"],
    ["retail_life_services", "Bán lẻ/Dịch vụ đời sống", "Retail/Life Services"],
    ["film_tv_media_publishing", "Phim/Truyền hình/Báo chí/Xuất bản", "Film/TV/Journalism/Publishing"],
    ["electrical_electronics_telecom", "Điện/Điện tử/Viễn thông", "Electrical/Electronics/Telecom"],
    ["logistics_procurement_warehouse", "Logistics/Thu mua/Kho/Vận tải", "Logistics/Procurement/Warehouse/Transport"],
    ["professional_consulting", "Tư vấn chuyên môn", "Professional Consulting"],
    ["pharma_healthcare_biotech", "Dược/Y tế/Sức khỏe/Công nghệ sinh học", "Pharma/Healthcare/Biotech"],
    ["design", "Thiết kế", "Design"],
    ["hospitality_tourism", "Nhà hàng/Khách sạn/Du lịch", "Restaurant/Hotel/Tourism"],
    ["energy_environment_agriculture", "Năng lượng/Môi trường/Nông nghiệp", "Energy/Environment/Agriculture"],
    ["general_labor", "Lao động phổ thông", "General Labor"],
    ["driver", "Tài xế", "Driver"],
    ["translation_interpretation", "Biên phiên dịch", "Translation/Interpretation"],
    ["law", "Luật", "Law"],
    ["other", "Nhóm nghề khác", "Other"],
]);

export const EXPERIENCE_LEVEL = toEntries([
    ["no_experience", "Không yêu cầu kinh nghiệm", "No experience required"],
    ["under_1y", "Dưới 1 năm", "Under 1 year"],
    ["1y", "1 năm", "1 year"],
    ["2y", "2 năm", "2 years"],
    ["3y", "3 năm", "3 years"],
    ["4y", "4 năm", "4 years"],
    ["5y", "5 năm", "5 years"],
    ["over_5y", "Trên 5 năm", "Over 5 years"],
]);

export const SENIORITY = toEntries([
    ["intern", "Thực tập sinh", "Intern"],
    ["staff", "Nhân viên", "Staff"],
    ["specialist", "Chuyên viên", "Specialist"],
    ["senior_specialist", "Chuyên viên cao cấp", "Senior Specialist"],
    ["team_lead", "Trưởng nhóm", "Team Lead"],
    ["department_head", "Trưởng/Phó phòng", "Department Head/Deputy"],
    ["manager_supervisor", "Quản lý/Giám sát", "Manager/Supervisor"],
    ["branch_head", "Trưởng chi nhánh", "Branch Head"],
    ["deputy_director", "Phó giám đốc", "Deputy Director"],
    ["director", "Giám đốc", "Director"],
    ["c_level", "Tổng giám đốc/C-level", "CEO/C-level"],
]);

export const EMPLOYMENT_TYPE = toEntries([
    ["full_time", "Toàn thời gian", "Full-time"],
    ["part_time", "Bán thời gian", "Part-time"],
    ["internship", "Thực tập", "Internship"],
    ["seasonal", "Thời vụ", "Seasonal"],
    ["fixed_term_contract", "Hợp đồng có thời hạn", "Fixed-term contract"],
    ["freelance", "Freelance", "Freelance"],
    ["project_based", "Theo dự án", "Project-based"],
    ["other", "Khác", "Other"],
]);

export const WORK_ARRANGEMENT = toEntries([
    ["onsite", "Làm việc tại văn phòng", "Office-based"],
    ["hybrid", "Hybrid", "Hybrid"],
    ["remote", "Remote", "Remote"],
    ["field", "Làm việc tại hiện trường", "Field-based"],
    ["frequent_travel", "Đi công tác thường xuyên", "Frequent travel"],
    ["shift", "Làm việc theo ca", "Shift work"],
]);

export const SATURDAY_WORK = toEntries([
    ["works_saturday", "Làm thứ Bảy", "Works Saturday"],
    ["off_saturday", "Nghỉ thứ Bảy", "Saturday off"],
    ["not_mentioned", "Tin đăng không đề cập", "Not mentioned in posting"],
]);

export const WORK_SCHEDULE = toEntries([
    ["mon_fri", "Thứ Hai–Thứ Sáu", "Mon–Fri"],
    ["mon_sat_morning", "Thứ Hai–Sáng thứ Bảy", "Mon–Sat morning"],
    ["mon_sat", "Thứ Hai–Thứ Bảy", "Mon–Sat"],
    ["shift_based", "Làm theo ca", "Shift-based"],
    ["office_shift", "Ca hành chính", "Office shift"],
    ["night_shift", "Ca đêm", "Night shift"],
    ["flexible", "Lịch linh hoạt", "Flexible schedule"],
    ["rotating_shift", "Xoay ca", "Rotating shift"],
    ["fixed_day_off", "Nghỉ cố định", "Fixed day off"],
    ["rotating_day_off", "Nghỉ luân phiên", "Rotating day off"],
]);

export const SALARY_UNIT = toEntries([
    ["vnd_month", "VND/tháng", "VND/month"],
    ["usd_month", "USD/tháng", "USD/month"],
    ["vnd_hour", "VND/giờ", "VND/hour"],
    ["vnd_day", "VND/ngày", "VND/day"],
    ["vnd_project", "VND/dự án", "VND/project"],
]);

export const SALARY_BANDS: { value: string; label_vn: string; label_en: string; min: number | null; max: number | null }[] = [
    { value: "under_10", label_vn: "Dưới 10 triệu", label_en: "Under 10M", min: null, max: 10 },
    { value: "10_15", label_vn: "10–15 triệu", label_en: "10–15M", min: 10, max: 15 },
    { value: "15_20", label_vn: "15–20 triệu", label_en: "15–20M", min: 15, max: 20 },
    { value: "20_25", label_vn: "20–25 triệu", label_en: "20–25M", min: 20, max: 25 },
    { value: "25_30", label_vn: "25–30 triệu", label_en: "25–30M", min: 25, max: 30 },
    { value: "30_50", label_vn: "30–50 triệu", label_en: "30–50M", min: 30, max: 50 },
    { value: "over_50", label_vn: "Trên 50 triệu", label_en: "Over 50M", min: 50, max: null },
];

export const COMPANY_INDUSTRY = toEntries([
    ["manufacturing", "Sản xuất", "Manufacturing"],
    ["textile_footwear", "Dệt may/Da giày", "Textile/Footwear"],
    ["food_fmcg", "Thực phẩm/FMCG", "Food/FMCG"],
    ["retail", "Bán lẻ", "Retail"],
    ["ecommerce", "Thương mại điện tử", "E-commerce"],
    ["tech_software", "Công nghệ/Phần mềm", "Technology/Software"],
    ["electronics_refrigeration", "Điện tử/Điện lạnh", "Electronics/Refrigeration"],
    ["mechanical_automation", "Cơ khí/Tự động hóa", "Mechanical/Automation"],
    ["construction", "Xây dựng", "Construction"],
    ["real_estate", "Bất động sản", "Real Estate"],
    ["banking", "Ngân hàng", "Banking"],
    ["finance", "Tài chính", "Finance"],
    ["securities", "Chứng khoán", "Securities"],
    ["insurance", "Bảo hiểm", "Insurance"],
    ["logistics_transport", "Logistics/Vận tải", "Logistics/Transport"],
    ["import_export", "Xuất nhập khẩu", "Import/Export"],
    ["education_training", "Giáo dục/Đào tạo", "Education/Training"],
    ["healthcare_pharma", "Y tế/Dược phẩm", "Healthcare/Pharma"],
    ["restaurant_hotel", "Nhà hàng/Khách sạn", "Restaurant/Hotel"],
    ["marketing_media", "Marketing/Truyền thông", "Marketing/Media"],
    ["consulting", "Tư vấn", "Consulting"],
    ["agriculture", "Nông nghiệp", "Agriculture"],
    ["energy_environment", "Năng lượng/Môi trường", "Energy/Environment"],
    ["other", "Khác", "Other"],
]);
