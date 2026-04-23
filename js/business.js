var BusinessPage = (function() {
    var currentTab = 'services';

    function render(data) {
        var html = '';
        html += '<div class="tab-nav">';
        html += '<button class="tab-btn ' + (currentTab === 'services' ? 'active' : '') + '" onclick="BusinessPage.switchTab(\'services\')">业务服务</button>';
        html += '<button class="tab-btn ' + (currentTab === 'talent' ? 'active' : '') + '" onclick="BusinessPage.switchTab(\'talent\')">人才盘点</button>';
        html += '<button class="tab-btn ' + (currentTab === 'org' ? 'active' : '') + '" onclick="BusinessPage.switchTab(\'org\')">组织诊断</button>';
        html += '<button class="tab-btn ' + (currentTab === 'alignment' ? 'active' : '') + '" onclick="BusinessPage.switchTab(\'alignment\')">业务对齐</button>';
        html += '</div>';

        if (currentTab === 'services') {
            html += renderServices(data);
        } else if (currentTab === 'talent') {
            html += renderTalent(data);
        } else if (currentTab === 'org') {
            html += renderOrg(data);
        } else if (currentTab === 'alignment') {
            html += renderAlignment(data);
        }

        return html;
    }

    function renderServices(data) {
        var services = data.businessServices;
        var inProgress = services.filter(function(s) { return s.status === 'in_progress'; }).length;
        var completed = services.filter(function(s) { return s.status === 'completed'; }).length;
        var highPriority = services.filter(function(s) { return s.priority === 'high'; }).length;

        var html = '<div class="stats-grid">';
        html += '<div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon blue">🤝</div></div><div class="stat-card-value">' + services.length + '</div><div class="stat-card-label">服务项目总数</div></div>';
        html += '<div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon orange">🔄</div></div><div class="stat-card-value">' + inProgress + '</div><div class="stat-card-label">进行中</div></div>';
        html += '<div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon green">✅</div></div><div class="stat-card-value">' + completed + '</div><div class="stat-card-label">已完成</div></div>';
        html += '<div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon red">🔥</div></div><div class="stat-card-value">' + highPriority + '</div><div class="stat-card-label">高优先级</div></div>';
        html += '</div>';

        html += '<div style="margin-bottom:16px"><button class="btn btn-primary" onclick="BusinessPage.showAddServiceForm()">+ 新增服务</button></div>';

        var rowsHtml = services.map(function(s) {
            var statusClass = s.status === 'completed' ? 'approved' : (s.status === 'in_progress' ? 'pending' : 'inactive');
            var statusText = s.status === 'completed' ? '已完成' : (s.status === 'in_progress' ? '进行中' : '待启动');
            var priorityClass = s.priority === 'high' ? 'rejected' : (s.priority === 'medium' ? 'pending' : 'active');
            var typeIcon = s.type === '人才盘点' ? '📊' : (s.type === '组织诊断' ? '🔍' : (s.type === '业务对齐' ? '🎯' : '🌟'));

            return '<tr>' +
                '<td>' + typeIcon + ' ' + s.type + '</td>' +
                '<td><strong>' + s.title + '</strong><br><span style="font-size:12px;color:var(--text-secondary)">' + s.description + '</span></td>' +
                '<td>' + s.dept + '</td>' +
                '<td><span class="status-badge ' + priorityClass + '">' + (s.priority === 'high' ? '高' : (s.priority === 'medium' ? '中' : '低')) + '</span></td>' +
                '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
                '<td>' + s.createTime + '</td>' +
                '<td><div class="action-links">' +
                (s.status === 'pending' ? '<span class="action-link" onclick="BusinessPage.updateServiceStatus(\'' + s.id + '\',\'in_progress\')">启动</span>' : '') +
                (s.status === 'in_progress' ? '<span class="action-link" onclick="BusinessPage.updateServiceStatus(\'' + s.id + '\',\'completed\')">完成</span>' : '') +
                '<span class="action-link" onclick="BusinessPage.viewService(\'' + s.id + '\')">详情</span>' +
                '</div></td>' +
                '</tr>';
        }).join('');

        html += '<div class="card"><div class="card-body"><div class="table-container"><table>' +
            '<thead><tr><th>类型</th><th>项目</th><th>部门</th><th>优先级</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead>' +
            '<tbody>' + rowsHtml + '</tbody></table></div></div></div>';

        return html;
    }

    function renderTalent(data) {
        var html = '<div class="card"><div class="card-header"><span class="card-title">人才九宫格</span><span style="font-size:13px;color:var(--text-secondary)">潜力 × 绩效</span></div>';
        html += '<div class="card-body">';

        html += '<div style="display:grid;grid-template-columns:60px 1fr 1fr 1fr;grid-template-rows:auto 1fr 1fr 1fr;gap:2px;font-size:13px">';

        html += '<div></div><div style="text-align:center;padding:8px;font-weight:700;background:var(--bg)">低绩效</div><div style="text-align:center;padding:8px;font-weight:700;background:var(--bg)">中绩效</div><div style="text-align:center;padding:8px;font-weight:700;background:var(--bg)">高绩效</div>';

        var gridData = [
            { label: '高潜力', cells: [
                { color: '#fef3c7', text: '待发展', emps: ['周磊'] },
                { color: '#dbeafe', text: '核心培养', emps: ['王强'] },
                { color: '#d1fae5', text: '明星员工', emps: ['李娜', '赵敏'] }
            ]},
            { label: '中潜力', cells: [
                { color: '#fef2f2', text: '关注改进', emps: [] },
                { color: '#f5f3ff', text: '稳定贡献', emps: ['刘洋', '陈晨'] },
                { color: '#dbeafe', text: '高绩效中坚', emps: ['张伟', '林涛'] }
            ]},
            { label: '低潜力', cells: [
                { color: '#fef2f2', text: '需改善', emps: [] },
                { color: '#fef3c7', text: '待激活', emps: ['马超'] },
                { color: '#f5f3ff', text: '专业骨干', emps: ['郑浩', '吴芳'] }
            ]}
        ];

        gridData.forEach(function(row) {
            html += '<div style="writing-mode:vertical-lr;text-align:center;padding:8px;font-weight:700;background:var(--bg);display:flex;align-items:center;justify-content:center">' + row.label + '</div>';
            row.cells.forEach(function(cell) {
                var empTags = cell.emps.map(function(e) { return '<span style="background:#fff;padding:2px 8px;border-radius:10px;font-size:11px;margin:2px;display:inline-block;border:1px solid var(--border)">' + e + '</span>'; }).join('');
                html += '<div style="background:' + cell.color + ';padding:12px;border-radius:8px;min-height:80px">' +
                    '<div style="font-weight:700;font-size:12px;margin-bottom:4px">' + cell.text + '</div>' + empTags + '</div>';
            });
        });

        html += '</div></div></div>';

        html += '<div class="card"><div class="card-header"><span class="card-title">关键人才保留风险</span></div>';
        html += '<div class="card-body">';

        var riskData = [
            { name: '郑浩', dept: '技术部', risk: '中', reason: '市场薪资竞争力不足', action: '启动调薪流程' },
            { name: '赵敏', dept: '市场部', risk: '高', reason: '近期多次表达不满', action: 'HRBP一对一沟通' },
            { name: '吴芳', dept: '产品部', risk: '低', reason: '团队氛围良好', action: '持续关注' }
        ];

        riskData.forEach(function(r) {
            var dotColor = r.risk === '高' ? 'red' : (r.risk === '中' ? 'yellow' : 'green');
            html += '<div class="health-indicator">' +
                '<div class="health-dot ' + dotColor + '"></div>' +
                '<div class="health-label"><strong>' + r.name + '</strong> · ' + r.dept + '<br><span style="font-size:12px;color:var(--text-secondary)">' + r.reason + '</span></div>' +
                '<div class="health-value"><span class="action-link" onclick="App.showToast(\'已安排: ' + r.action + '\', \'success\')">' + r.action + '</span></div>' +
                '</div>';
        });

        html += '</div></div>';

        return html;
    }

    function renderOrg(data) {
        var org = data.orgStructure;

        var html = '<div class="card"><div class="card-header"><span class="card-title">组织架构概览</span></div>';
        html += '<div class="card-body">';

        html += '<div style="text-align:center;margin-bottom:24px">' +
            '<div class="org-node" style="display:inline-block;border-color:var(--primary);border-width:3px">' +
            '<div class="org-node-title" style="font-size:16px">' + org.name + '</div>' +
            '<div class="org-node-count">总人数: ' + org.headcount + '</div></div></div>';

        html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px">';
        org.children.forEach(function(dept) {
            var healthColor = dept.health === 'green' ? 'var(--success)' : (dept.health === 'yellow' ? 'var(--warning)' : 'var(--danger)');
            html += '<div class="org-node" style="border-color:' + healthColor + '">' +
                '<div class="org-node-title">' + dept.name + '</div>' +
                '<div class="org-node-count">' + dept.headcount + '人</div>' +
                '<div style="font-size:11px;color:var(--text-secondary);margin-top:4px">负责人: ' + dept.head + '</div>' +
                '<div style="margin-top:6px"><div class="health-dot ' + dept.health + '" style="display:inline-block;vertical-align:middle"></div>' +
                '<span style="font-size:11px;margin-left:4px">' + (dept.health === 'green' ? '健康' : (dept.health === 'yellow' ? '需关注' : '预警')) + '</span></div>' +
                '</div>';
        });
        html += '</div></div></div>';

        html += '<div class="card"><div class="card-header"><span class="card-title">组织健康度指标</span></div>';
        html += '<div class="card-body">';

        var indicators = [
            { label: '员工满意度', value: '87分', status: 'green', desc: '较上季度+3分' },
            { label: '离职率', value: '8.2%', status: 'yellow', desc: '市场部偏高' },
            { label: '内部流动率', value: '12%', status: 'green', desc: '处于健康水平' },
            { label: '招聘达成率', value: '92%', status: 'green', desc: 'Q1目标基本达成' },
            { label: '培训覆盖率', value: '78%', status: 'yellow', desc: '技术部需加强' },
            { label: '团队协作评分', value: '4.2/5', status: 'green', desc: '整体良好' }
        ];

        indicators.forEach(function(ind) {
            html += '<div class="health-indicator">' +
                '<div class="health-dot ' + ind.status + '"></div>' +
                '<div class="health-label"><strong>' + ind.label + '</strong><br><span style="font-size:12px;color:var(--text-secondary)">' + ind.desc + '</span></div>' +
                '<div class="health-value">' + ind.value + '</div>' +
                '</div>';
        });

        html += '</div></div>';

        return html;
    }

    function renderAlignment(data) {
        var html = '<div class="card"><div class="card-header"><span class="card-title">业务目标与人力对齐</span></div>';
        html += '<div class="card-body">';

        var alignments = [
            { goal: 'Q2营收增长20%', hrAction: '市场部+2HC，销售培训', progress: 65, status: 'in_progress' },
            { goal: '新产品6月上线', hrAction: '技术部+3HC，产品团队重组', progress: 80, status: 'in_progress' },
            { goal: '客户满意度提升至90%', hrAction: '客服团队培训，绩效KPI调整', progress: 45, status: 'in_progress' },
            { goal: '海外市场拓展', hrAction: '招聘海外运营，跨文化培训', progress: 20, status: 'pending' },
            { goal: '技术架构升级', hrAction: '架构师招聘，技术培训计划', progress: 90, status: 'near_complete' }
        ];

        alignments.forEach(function(a) {
            var progressColor = a.progress >= 80 ? 'green' : (a.progress >= 50 ? 'blue' : 'orange');
            html += '<div style="padding:16px;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:12px">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
                '<strong>' + a.goal + '</strong>' +
                '<span class="status-badge ' + (a.progress >= 80 ? 'approved' : 'pending') + '">' + a.progress + '%</span>' +
                '</div>' +
                '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px">HR行动: ' + a.hrAction + '</div>' +
                '<div class="progress-bar"><div class="progress-bar-fill ' + progressColor + '" style="width:' + a.progress + '%"></div></div>' +
                '</div>';
        });

        html += '</div></div>';

        html += '<div class="card"><div class="card-header"><span class="card-title">HC编制规划</span></div>';
        html += '<div class="card-body"><table>';
        html += '<thead><tr><th>部门</th><th>现有人数</th><th>计划编制</th><th>缺口</th><th>状态</th></tr></thead><tbody>';

        var hcPlans = [
            { dept: '技术部', current: 5, plan: 8, status: '招聘中' },
            { dept: '产品部', current: 2, plan: 3, status: '招聘中' },
            { dept: '市场部', current: 2, plan: 4, status: '待审批' },
            { dept: '运营部', current: 2, plan: 2, status: '已满编' },
            { dept: '人力资源部', current: 2, plan: 2, status: '已满编' },
            { dept: '财务部', current: 2, plan: 2, status: '已满编' }
        ];

        hcPlans.forEach(function(hc) {
            var gap = hc.plan - hc.current;
            var statusClass = hc.status === '已满编' ? 'approved' : (hc.status === '招聘中' ? 'pending' : 'inactive');
            html += '<tr><td>' + hc.dept + '</td><td>' + hc.current + '</td><td>' + hc.plan + '</td>' +
                '<td style="font-weight:700;color:' + (gap > 0 ? 'var(--danger)' : 'var(--success)') + '">' + (gap > 0 ? '+' + gap : '0') + '</td>' +
                '<td><span class="status-badge ' + statusClass + '">' + hc.status + '</span></td></tr>';
        });

        html += '</tbody></table></div></div>';

        return html;
    }

    function switchTab(tab) {
        currentTab = tab;
        App.refreshPage();
    }

    function showAddServiceForm() {
        App.showModal('新增业务服务',
            '<div class="form-group"><label>服务类型</label><select id="svcType"><option>人才盘点</option><option>组织诊断</option><option>业务对齐</option><option>文化建设</option><option>员工关怀</option></select></div>' +
            '<div class="form-group"><label>项目标题</label><input type="text" id="svcTitle" placeholder="请输入项目标题"></div>' +
            '<div class="form-row">' +
            '<div class="form-group"><label>服务部门</label><select id="svcDept"><option>技术部</option><option>产品部</option><option>市场部</option><option>运营部</option><option>人力资源部</option><option>财务部</option><option>全公司</option></select></div>' +
            '<div class="form-group"><label>优先级</label><select id="svcPriority"><option value="high">高</option><option value="medium" selected>中</option><option value="low">低</option></select></div>' +
            '</div>' +
            '<div class="form-group"><label>描述</label><textarea id="svcDesc" rows="3" placeholder="请输入项目描述"></textarea></div>',
            function() {
                var data = HRData.loadData();
                data.businessServices.push({
                    id: HRData.generateId('BS'),
                    type: document.getElementById('svcType').value,
                    title: document.getElementById('svcTitle').value,
                    dept: document.getElementById('svcDept').value,
                    status: 'pending',
                    priority: document.getElementById('svcPriority').value,
                    createTime: HRData.getToday(),
                    description: document.getElementById('svcDesc').value
                });
                HRData.saveData(data);
                App.closeModal();
                App.showToast('业务服务已创建', 'success');
                App.refreshPage();
            }
        );
    }

    function updateServiceStatus(id, status) {
        var data = HRData.loadData();
        var svc = data.businessServices.find(function(s) { return s.id === id; });
        if (svc) {
            svc.status = status;
            HRData.saveData(data);
            App.showToast('状态已更新为: ' + (status === 'in_progress' ? '进行中' : '已完成'), 'success');
            App.refreshPage();
        }
    }

    function viewService(id) {
        var data = HRData.loadData();
        var svc = data.businessServices.find(function(s) { return s.id === id; });
        if (!svc) return;

        var statusText = svc.status === 'completed' ? '已完成' : (svc.status === 'in_progress' ? '进行中' : '待启动');
        var priorityText = svc.priority === 'high' ? '高' : (svc.priority === 'medium' ? '中' : '低');

        App.showModal(svc.title,
            '<div style="margin-bottom:12px"><strong>类型:</strong> ' + svc.type + '</div>' +
            '<div style="margin-bottom:12px"><strong>部门:</strong> ' + svc.dept + '</div>' +
            '<div style="margin-bottom:12px"><strong>优先级:</strong> ' + priorityText + '</div>' +
            '<div style="margin-bottom:12px"><strong>状态:</strong> ' + statusText + '</div>' +
            '<div style="margin-bottom:12px"><strong>创建时间:</strong> ' + svc.createTime + '</div>' +
            '<div style="margin-bottom:12px"><strong>描述:</strong><br>' + svc.description + '</div>',
            null, true
        );
    }

    return {
        render: render,
        switchTab: switchTab,
        showAddServiceForm: showAddServiceForm,
        updateServiceStatus: updateServiceStatus,
        viewService: viewService
    };
})();
