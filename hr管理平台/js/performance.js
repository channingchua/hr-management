var PerformancePage = (function() {
    var currentTab = 'overview';

    function render(data) {
        var html = '';
        html += '<div class="tab-nav">';
        html += '<button class="tab-btn ' + (currentTab === 'overview' ? 'active' : '') + '" onclick="PerformancePage.switchTab(\'overview\')">绩效总览</button>';
        html += '<button class="tab-btn ' + (currentTab === 'detail' ? 'active' : '') + '" onclick="PerformancePage.switchTab(\'detail\')">绩效详情</button>';
        html += '<button class="tab-btn ' + (currentTab === 'setting' ? 'active' : '') + '" onclick="PerformancePage.switchTab(\'setting\')">KPI设定</button>';
        html += '</div>';

        if (currentTab === 'overview') {
            html += renderOverview(data);
        } else if (currentTab === 'detail') {
            html += renderDetail(data);
        } else if (currentTab === 'setting') {
            html += renderSetting(data);
        }

        return html;
    }

    function renderOverview(data) {
        var perf = data.performance;
        var avgScore = perf.length > 0 ? Math.round(perf.reduce(function(s, p) { return s + p.totalScore; }, 0) / perf.length) : 0;
        var sCount = perf.filter(function(p) { return p.level === 'S'; }).length;
        var aCount = perf.filter(function(p) { return p.level === 'A'; }).length;
        var bCount = perf.filter(function(p) { return p.level === 'B'; }).length;
        var pendingCount = perf.filter(function(p) { return p.status === 'pending'; }).length;

        var html = '<div class="stats-grid">';
        html += '<div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon purple">⭐</div></div><div class="stat-card-value">' + avgScore + '分</div><div class="stat-card-label">平均绩效分</div></div>';
        html += '<div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon green">🏆</div></div><div class="stat-card-value">' + sCount + '人</div><div class="stat-card-label">S级（卓越）</div></div>';
        html += '<div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon blue">👍</div></div><div class="stat-card-value">' + aCount + '人</div><div class="stat-card-label">A级（优秀）</div></div>';
        html += '<div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon orange">📋</div></div><div class="stat-card-value">' + pendingCount + '项</div><div class="stat-card-label">待确认绩效</div></div>';
        html += '</div>';

        html += '<div class="card"><div class="card-header"><span class="card-title">绩效排名</span><select onchange="PerformancePage.filterPeriod(this.value)" style="padding:6px 12px;border:1px solid var(--border);border-radius:var(--radius-sm);font-size:13px"><option value="2026-Q1">2026 Q1</option><option value="2025-Q4">2025 Q4</option></select></div>';
        html += '<div class="card-body"><div class="table-container"><table>';
        html += '<thead><tr><th>排名</th><th>员工</th><th>部门</th><th>总分</th><th>等级</th><th>状态</th><th>操作</th></tr></thead><tbody>';

        var sorted = perf.slice().sort(function(a, b) { return b.totalScore - a.totalScore; });
        sorted.forEach(function(p, i) {
            var emp = data.employees.find(function(e) { return e.id === p.employeeId; });
            var levelColor = p.level === 'S' ? 'active' : (p.level === 'A' ? 'active' : (p.level === 'B' ? 'pending' : 'rejected'));
            var statusClass = p.status === 'confirmed' ? 'approved' : 'pending';
            var statusText = p.status === 'confirmed' ? '已确认' : '待确认';
            var actions = p.status === 'pending' ?
                '<span class="action-link" onclick="PerformancePage.confirmPerformance(\'' + p.id + '\')">确认</span>' :
                '<span class="action-link" onclick="PerformancePage.viewDetail(\'' + p.id + '\')">查看</span>';

            html += '<tr>' +
                '<td><strong>' + (i + 1) + '</strong></td>' +
                '<td><div class="employee-row"><div class="avatar-sm">' + p.employeeName.charAt(0) + '</div><div class="employee-name">' + p.employeeName + '</div></div></td>' +
                '<td>' + (emp ? emp.dept : '-') + '</td>' +
                '<td><strong>' + p.totalScore + '</strong></td>' +
                '<td><span class="status-badge ' + levelColor + '">' + p.level + '级</span></td>' +
                '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
                '<td>' + actions + '</td>' +
                '</tr>';
        });

        html += '</tbody></table></div></div></div>';

        return html;
    }

    function renderDetail(data) {
        var html = '<div class="filter-bar">' +
            '<select id="perfDeptFilter" onchange="PerformancePage.filterDetail()">' +
            '<option value="">全部部门</option>' +
            '<option>技术部</option><option>产品部</option><option>市场部</option><option>运营部</option><option>人力资源部</option><option>财务部</option>' +
            '</select>' +
            '<select id="perfLevelFilter" onchange="PerformancePage.filterDetail()">' +
            '<option value="">全部等级</option><option>S</option><option>A</option><option>B</option><option>C</option><option>D</option>' +
            '</select></div>';

        data.performance.forEach(function(p) {
            var emp = data.employees.find(function(e) { return e.id === p.employeeId; });
            var kpiHtml = p.kpis.map(function(kpi) {
                var scoreColor = kpi.score >= 90 ? 'green' : (kpi.score >= 70 ? 'blue' : (kpi.score >= 50 ? 'orange' : 'red'));
                return '<div class="kpi-card">' +
                    '<div class="kpi-header"><span class="kpi-name">' + kpi.name + '</span><span class="kpi-weight">权重 ' + kpi.weight + '%</span></div>' +
                    '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">目标: ' + kpi.target + ' | 实际: ' + kpi.actual + '</div>' +
                    '<div class="progress-bar"><div class="progress-bar-fill ' + scoreColor + '" style="width:' + kpi.score + '%"></div></div>' +
                    '<div class="kpi-score-area"><span style="font-weight:700;font-size:18px">' + kpi.score + '</span><span style="color:var(--text-secondary);font-size:13px">分</span></div>' +
                    '</div>';
            }).join('');

            var levelColor = p.level === 'S' ? 'active' : (p.level === 'A' ? 'active' : (p.level === 'B' ? 'pending' : 'rejected'));
            html += '<div class="card">' +
                '<div class="card-header">' +
                '<div class="employee-row"><div class="avatar-sm">' + p.employeeName.charAt(0) + '</div><div><div class="employee-name">' + p.employeeName + '</div><div class="employee-dept">' + (emp ? emp.dept + ' · ' + emp.position : '') + '</div></div></div>' +
                '<div style="display:flex;align-items:center;gap:12px"><span class="status-badge ' + levelColor + '">' + p.level + '级</span><strong style="font-size:20px">' + p.totalScore + '分</strong></div>' +
                '</div>' +
                '<div class="card-body">' + kpiHtml + '</div></div>';
        });

        return html;
    }

    function renderSetting(data) {
        var html = '<div style="margin-bottom:16px"><button class="btn btn-primary" onclick="PerformancePage.showAddKPIForm()">+ 新增KPI模板</button></div>';

        var templates = [
            { role: '技术岗', kpis: [{ name: '项目交付率', weight: 40 }, { name: '代码质量', weight: 30 }, { name: '团队协作', weight: 30 }] },
            { role: '产品岗', kpis: [{ name: '产品上线率', weight: 40 }, { name: '用户满意度', weight: 30 }, { name: '需求响应', weight: 30 }] },
            { role: '市场岗', kpis: [{ name: '市场增长率', weight: 40 }, { name: '品牌曝光', weight: 30 }, { name: '团队管理', weight: 30 }] },
            { role: 'HRBP岗', kpis: [{ name: '招聘达成率', weight: 35 }, { name: '员工满意度', weight: 35 }, { name: 'HRBP服务', weight: 30 }] }
        ];

        templates.forEach(function(t) {
            var kpiRows = t.kpis.map(function(k) {
                return '<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">' +
                    '<span>' + k.name + '</span><span class="status-badge active">' + k.weight + '%</span></div>';
            }).join('');

            html += '<div class="card"><div class="card-header"><span class="card-title">' + t.role + ' KPI模板</span>' +
                '<button class="btn btn-outline btn-sm" onclick="PerformancePage.editKPITemplate(\'' + t.role + '\')">编辑</button></div>' +
                '<div class="card-body">' + kpiRows + '</div></div>';
        });

        return html;
    }

    function switchTab(tab) {
        currentTab = tab;
        App.refreshPage();
    }

    function confirmPerformance(id) {
        var data = HRData.loadData();
        var perf = data.performance.find(function(p) { return p.id === id; });
        if (perf) {
            perf.status = 'confirmed';
            HRData.saveData(data);
            App.showToast('绩效已确认', 'success');
            App.refreshPage();
        }
    }

    function viewDetail(id) {
        var data = HRData.loadData();
        var perf = data.performance.find(function(p) { return p.id === id; });
        if (!perf) return;

        var kpiDetail = perf.kpis.map(function(k) {
            return '<div style="padding:8px 0;border-bottom:1px solid var(--border)">' +
                '<div style="display:flex;justify-content:space-between"><strong>' + k.name + '</strong><span>' + k.score + '分</span></div>' +
                '<div style="font-size:13px;color:var(--text-secondary)">目标: ' + k.target + ' | 实际: ' + k.actual + ' | 权重: ' + k.weight + '%</div>' +
                '</div>';
        }).join('');

        App.showModal(perf.employeeName + ' - 绩效详情 (' + perf.period + ')',
            '<div style="text-align:center;margin-bottom:16px"><span style="font-size:36px;font-weight:800">' + perf.totalScore + '</span><span style="font-size:16px;color:var(--text-secondary)">分</span><br><span class="status-badge active" style="font-size:14px">' + perf.level + '级</span></div>' +
            kpiDetail,
            null, true
        );
    }

    function showAddKPIForm() {
        App.showModal('新增KPI模板',
            '<div class="form-group"><label>岗位类型</label><input type="text" id="kpiRole" placeholder="如：运营岗"></div>' +
            '<div class="form-group"><label>KPI 1</label><div class="form-row"><input type="text" id="kpi1Name" placeholder="指标名称"><input type="number" id="kpi1Weight" placeholder="权重%" value="40"></div></div>' +
            '<div class="form-group"><label>KPI 2</label><div class="form-row"><input type="text" id="kpi2Name" placeholder="指标名称"><input type="number" id="kpi2Weight" placeholder="权重%" value="30"></div></div>' +
            '<div class="form-group"><label>KPI 3</label><div class="form-row"><input type="text" id="kpi3Name" placeholder="指标名称"><input type="number" id="kpi3Weight" placeholder="权重%" value="30"></div></div>',
            function() {
                App.closeModal();
                App.showToast('KPI模板已保存', 'success');
            }
        );
    }

    function editKPITemplate(role) {
        App.showToast('编辑 ' + role + ' KPI模板（功能开发中）', 'info');
    }

    function filterPeriod(period) {
        App.refreshPage();
    }

    function filterDetail() {
        App.refreshPage();
    }

    return {
        render: render,
        switchTab: switchTab,
        confirmPerformance: confirmPerformance,
        viewDetail: viewDetail,
        showAddKPIForm: showAddKPIForm,
        editKPITemplate: editKPITemplate,
        filterPeriod: filterPeriod,
        filterDetail: filterDetail
    };
})();
