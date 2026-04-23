var HRData = (function() {
    var STORAGE_KEY = 'hr_platform_data';

    var defaultEmployees = [
        { id: 'E001', name: '张伟', dept: '技术部', position: '高级工程师', level: 'P7', joinDate: '2021-03-15', status: 'active', phone: '138****1234', email: 'zhangwei@company.com' },
        { id: 'E002', name: '李娜', dept: '产品部', position: '产品经理', level: 'P6', joinDate: '2022-01-10', status: 'active', phone: '139****5678', email: 'lina@company.com' },
        { id: 'E003', name: '王强', dept: '技术部', position: '前端工程师', level: 'P5', joinDate: '2022-06-20', status: 'active', phone: '137****9012', email: 'wangqiang@company.com' },
        { id: 'E004', name: '赵敏', dept: '市场部', position: '市场总监', level: 'P8', joinDate: '2020-08-01', status: 'active', phone: '136****3456', email: 'zhaomin@company.com' },
        { id: 'E005', name: '陈晨', dept: '人力资源部', position: 'HRBP', level: 'P6', joinDate: '2021-11-05', status: 'active', phone: '135****7890', email: 'chenchen@company.com' },
        { id: 'E006', name: '刘洋', dept: '技术部', position: '后端工程师', level: 'P6', joinDate: '2022-03-18', status: 'active', phone: '134****2345', email: 'liuyang@company.com' },
        { id: 'E007', name: '孙丽', dept: '财务部', position: '财务主管', level: 'P7', joinDate: '2020-05-12', status: 'active', phone: '133****6789', email: 'sunli@company.com' },
        { id: 'E008', name: '周磊', dept: '运营部', position: '运营专员', level: 'P4', joinDate: '2023-02-14', status: 'active', phone: '132****0123', email: 'zhoulei@company.com' },
        { id: 'E009', name: '吴芳', dept: '产品部', position: '产品总监', level: 'P8', joinDate: '2019-09-01', status: 'active', phone: '131****4567', email: 'wufang@company.com' },
        { id: 'E010', name: '郑浩', dept: '技术部', position: '架构师', level: 'P8', joinDate: '2020-01-15', status: 'active', phone: '130****8901', email: 'zhenghao@company.com' },
        { id: 'E011', name: '黄静', dept: '人力资源部', position: '招聘专员', level: 'P5', joinDate: '2023-01-08', status: 'active', phone: '158****2233', email: 'huangjing@company.com' },
        { id: 'E012', name: '林涛', dept: '市场部', position: '品牌经理', level: 'P6', joinDate: '2021-07-22', status: 'active', phone: '159****4455', email: 'lintao@company.com' },
        { id: 'E013', name: '何雪', dept: '运营部', position: '运营经理', level: 'P6', joinDate: '2022-04-10', status: 'on_leave', phone: '157****6677', email: 'hexue@company.com' },
        { id: 'E014', name: '马超', dept: '技术部', position: '测试工程师', level: 'P5', joinDate: '2022-09-05', status: 'active', phone: '156****8899', email: 'machao@company.com' },
        { id: 'E015', name: '罗琳', dept: '财务部', position: '会计', level: 'P4', joinDate: '2023-06-01', status: 'active', phone: '155****0011', email: 'luolin@company.com' }
    ];

    var defaultAttendance = [];

    var defaultLeaveRequests = [
        { id: 'L001', employeeId: 'E013', employeeName: '何雪', type: '年假', startDate: '2026-04-18', endDate: '2026-04-22', days: 3, reason: '家庭事务', status: 'approved', approver: '陈晨', createTime: '2026-04-15 09:30' },
        { id: 'L002', employeeId: 'E003', employeeName: '王强', type: '病假', startDate: '2026-04-21', endDate: '2026-04-21', days: 1, reason: '身体不适', status: 'pending', approver: '', createTime: '2026-04-21 08:15' },
        { id: 'L003', employeeId: 'E008', employeeName: '周磊', type: '事假', startDate: '2026-04-25', endDate: '2026-04-25', days: 1, reason: '个人事务', status: 'pending', approver: '', createTime: '2026-04-20 14:22' }
    ];

    var defaultOvertimeRequests = [
        { id: 'OT001', employeeId: 'E001', employeeName: '张伟', date: '2026-04-19', hours: 3, reason: '项目上线', status: 'approved', createTime: '2026-04-19 18:00' },
        { id: 'OT002', employeeId: 'E006', employeeName: '刘洋', date: '2026-04-20', hours: 4, reason: '紧急Bug修复', status: 'pending', createTime: '2026-04-20 17:30' }
    ];

    var defaultPerformance = [
        { id: 'P001', employeeId: 'E001', employeeName: '张伟', period: '2026-Q1', kpis: [
            { name: '项目交付率', weight: 40, target: '100%', actual: '95%', score: 95 },
            { name: '代码质量', weight: 30, target: 'A级', actual: 'A级', score: 100 },
            { name: '团队协作', weight: 30, target: '优秀', actual: '良好', score: 80 }
        ], totalScore: 92, level: 'A', status: 'confirmed' },
        { id: 'P002', employeeId: 'E002', employeeName: '李娜', period: '2026-Q1', kpis: [
            { name: '产品上线率', weight: 40, target: '100%', actual: '100%', score: 100 },
            { name: '用户满意度', weight: 30, target: '90分', actual: '88分', score: 88 },
            { name: '需求响应', weight: 30, target: '24h内', actual: '20h内', score: 95 }
        ], totalScore: 95, level: 'S', status: 'confirmed' },
        { id: 'P003', employeeId: 'E004', employeeName: '赵敏', period: '2026-Q1', kpis: [
            { name: '市场增长率', weight: 40, target: '15%', actual: '18%', score: 100 },
            { name: '品牌曝光', weight: 30, target: '500万', actual: '480万', score: 90 },
            { name: '团队管理', weight: 30, target: '优秀', actual: '优秀', score: 95 }
        ], totalScore: 96, level: 'S', status: 'confirmed' },
        { id: 'P004', employeeId: 'E003', employeeName: '王强', period: '2026-Q1', kpis: [
            { name: '开发完成率', weight: 40, target: '100%', actual: '90%', score: 85 },
            { name: '代码质量', weight: 30, target: 'A级', actual: 'B级', score: 70 },
            { name: '学习成长', weight: 30, target: '通过认证', actual: '进行中', score: 60 }
        ], totalScore: 73, level: 'B', status: 'pending' },
        { id: 'P005', employeeId: 'E005', employeeName: '陈晨', period: '2026-Q1', kpis: [
            { name: '招聘达成率', weight: 35, target: '100%', actual: '95%', score: 90 },
            { name: '员工满意度', weight: 35, target: '90分', actual: '92分', score: 100 },
            { name: 'HRBP服务', weight: 30, target: '优秀', actual: '良好', score: 85 }
        ], totalScore: 92, level: 'A', status: 'confirmed' }
    ];

    var defaultBenefits = [
        { id: 'B001', name: '五险一金', icon: '🏥', category: '法定福利', description: '养老、医疗、失业、工伤、生育保险及住房公积金', eligibility: '全体员工', status: 'active', claimedCount: 15 },
        { id: 'B002', name: '补充医疗保险', icon: '💊', category: '医疗保障', description: '覆盖门诊、住院、重大疾病的补充医疗保障', eligibility: 'P5及以上', status: 'active', claimedCount: 10 },
        { id: 'B003', name: '年度体检', icon: '🩺', category: '健康关怀', description: '每年一次全面健康体检', eligibility: '全体员工', status: 'active', claimedCount: 12 },
        { id: 'B004', name: '带薪年假', icon: '🏖️', category: '假期福利', description: '根据工龄享受5-15天带薪年假', eligibility: '全体员工', status: 'active', claimedCount: 8 },
        { id: 'B005', name: '餐饮补贴', icon: '🍱', category: '生活补贴', description: '每日30元餐饮补贴', eligibility: '全体员工', status: 'active', claimedCount: 15 },
        { id: 'B006', name: '交通补贴', icon: '🚗', category: '生活补贴', description: '每月500元交通补贴', eligibility: 'P6及以上', status: 'active', claimedCount: 9 },
        { id: 'B007', name: '培训发展基金', icon: '📚', category: '成长发展', description: '每年5000元培训学习基金', eligibility: '全体员工', status: 'active', claimedCount: 6 },
        { id: 'B008', name: '节日礼品', icon: '🎁', category: '关怀福利', description: '传统节日礼品或购物卡', eligibility: '全体员工', status: 'active', claimedCount: 15 },
        { id: 'B009', name: '弹性工作', icon: '⏰', category: '工作方式', description: '核心工作时间外可弹性安排', eligibility: 'P5及以上', status: 'active', claimedCount: 7 },
        { id: 'B010', name: '股票期权', icon: '💎', category: '长期激励', description: '根据职级和绩效授予股票期权', eligibility: 'P7及以上', status: 'active', claimedCount: 4 }
    ];

    var defaultBenefitClaims = [
        { id: 'BC001', employeeId: 'E001', employeeName: '张伟', benefitId: 'B007', benefitName: '培训发展基金', claimDate: '2026-03-15', amount: 3000, reason: '参加技术培训课程', status: 'approved' },
        { id: 'BC002', employeeId: 'E002', employeeName: '李娜', benefitId: 'B003', benefitName: '年度体检', claimDate: '2026-04-10', amount: 0, reason: '年度常规体检', status: 'approved' },
        { id: 'BC003', employeeId: 'E008', employeeName: '周磊', benefitId: 'B007', benefitName: '培训发展基金', claimDate: '2026-04-18', amount: 2000, reason: '购买在线课程', status: 'pending' }
    ];

    var defaultOrgStructure = {
        name: '公司总部',
        headcount: 15,
        children: [
            { name: '技术部', headcount: 5, head: '郑浩', health: 'green' },
            { name: '产品部', headcount: 2, head: '吴芳', health: 'green' },
            { name: '市场部', headcount: 2, head: '赵敏', health: 'yellow' },
            { name: '运营部', headcount: 2, head: '何雪', health: 'green' },
            { name: '人力资源部', headcount: 2, head: '陈晨', health: 'green' },
            { name: '财务部', headcount: 2, head: '孙丽', health: 'green' }
        ]
    };

    var defaultBusinessServices = [
        { id: 'BS001', type: '人才盘点', title: 'Q1人才盘点报告', dept: '技术部', status: 'completed', priority: 'high', createTime: '2026-04-01', description: '对技术部全员进行能力评估和九宫格定位' },
        { id: 'BS002', type: '组织诊断', title: '市场部组织健康度诊断', dept: '市场部', status: 'in_progress', priority: 'high', createTime: '2026-04-10', description: '针对市场部近期离职率偏高进行组织诊断' },
        { id: 'BS003', type: '业务对齐', title: '产品线HC规划', dept: '产品部', status: 'pending', priority: 'medium', createTime: '2026-04-15', description: '根据Q2业务目标规划产品线人力编制' },
        { id: 'BS004', type: '文化建设', title: '技术部团建活动', dept: '技术部', status: 'completed', priority: 'low', createTime: '2026-03-20', description: 'Q1技术部团队建设活动策划与执行' },
        { id: 'BS005', type: '人才盘点', title: '核心骨干保留计划', dept: '全公司', status: 'in_progress', priority: 'high', createTime: '2026-04-12', description: '识别核心人才并制定个性化保留方案' }
    ];

    var defaultNotifications = [
        { id: 'N001', type: 'leave', message: '王强提交了病假申请', time: '08:15', read: false },
        { id: 'N002', type: 'overtime', message: '刘洋提交了加班申请', time: '17:30', read: false },
        { id: 'N003', type: 'benefit', message: '周磊申请了培训发展基金', time: '14:22', read: false }
    ];

    function getDefaultData() {
        return {
            employees: defaultEmployees,
            attendance: defaultAttendance,
            leaveRequests: defaultLeaveRequests,
            overtimeRequests: defaultOvertimeRequests,
            performance: defaultPerformance,
            benefits: defaultBenefits,
            benefitClaims: defaultBenefitClaims,
            orgStructure: defaultOrgStructure,
            businessServices: defaultBusinessServices,
            notifications: defaultNotifications
        };
    }

    function loadData() {
        try {
            var stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('数据加载失败:', e);
        }
        var data = getDefaultData();
        saveData(data);
        return data;
    }

    function saveData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('数据保存失败:', e);
        }
    }

    function resetData() {
        var data = getDefaultData();
        saveData(data);
        return data;
    }

    function generateId(prefix) {
        return prefix + Date.now().toString(36).toUpperCase();
    }

    function formatDate(dateStr) {
        if (!dateStr) return '-';
        var d = new Date(dateStr);
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function formatDateTime(dateStr) {
        if (!dateStr) return '-';
        return dateStr;
    }

    function getToday() {
        var d = new Date();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    }

    function getCurrentTime() {
        var d = new Date();
        return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0') + ':' + String(d.getSeconds()).padStart(2, '0');
    }

    function getDeptStats(employees) {
        var stats = {};
        employees.forEach(function(emp) {
            if (!stats[emp.dept]) {
                stats[emp.dept] = { total: 0, active: 0 };
            }
            stats[emp.dept].total++;
            if (emp.status === 'active') stats[emp.dept].active++;
        });
        return stats;
    }

    function getAttendanceRate(attendance, employees, date) {
        var dayRecords = attendance.filter(function(a) { return a.date === date; });
        return employees.filter(function(e) { return e.status === 'active'; }).length > 0
            ? Math.round(dayRecords.length / employees.filter(function(e) { return e.status === 'active'; }).length * 100)
            : 0;
    }

    return {
        loadData: loadData,
        saveData: saveData,
        resetData: resetData,
        generateId: generateId,
        formatDate: formatDate,
        formatDateTime: formatDateTime,
        getToday: getToday,
        getCurrentTime: getCurrentTime,
        getDeptStats: getDeptStats,
        getAttendanceRate: getAttendanceRate
    };
})();
