var BenefitsPage = (function() {
    var currentTab = 'catalog';

    function render(data) {
        var html = '';
        html += '<div class="tab-nav">';
        html += '<button class="tab-btn ' + (currentTab === 'catalog' ? 'active' : '') + '" onclick="BenefitsPage.switchTab(\'catalog\')">福利目录</button>';
        html += '<button class="tab-btn ' + (currentTab === 'claims' ? 'active' : '') + '" onclick="BenefitsPage.switchTab(\'claims\')">申领记录</button>';
        html += '<button class="tab-btn ' + (currentTab === 'stats' ? 'active' : '') + '" onclick="BenefitsPage.switchTab(\'stats\')">福利统计</button>';
        html += '</div>';

        if (currentTab === 'catalog') {
            html += renderCatalog(data);
        } else if (currentTab === 'claims') {
            html += renderClaims(data);
        } else if (currentTab === 'stats') {
            html += renderStats(data);
        }

        return html;
    }

    function renderCatalog(data) {
        var categories = {};
        data.benefits.forEach(function(b) {
            if (!categories[b.category]) categories[b.category] = [];
            categories[b.category].push(b);
        });

        var html = '<div style="margin-bottom:16px"><button class="btn btn-primary" onclick="BenefitsPage.showAddBenefitForm()">+ 新增福利项目</button></div>';

        Object.keys(categories).forEach(function(cat) {
            html += '<h3 style="font-size:16px;font-weight:700;margin:20px 0 12px;color:var(--text)">' + cat + '</h3>';
            html += '<div class="benefit-grid">';
            categories[cat].forEach(function(b) {
                html += '<div class="benefit-card" onclick="BenefitsPage.viewBenefit(\'' + b.id + '\')">' +
                    '<div class="benefit-icon">' + b.icon + '</div>' +
                    '<div class="benefit-name">' + b.name + '</div>' +
                    '<div class="benefit-desc">' + b.description + '</div>' +
                    '<div class="benefit-meta">' +
                    '<span class="benefit-count">' + b.claimedCount + '人已申领</span>' +
                    '<span class="status-badge active">' + b.eligibility + '</span>' +
                    '</div></div>';
            });
            html += '</div>';
        });

        return html;
    }

    function renderClaims(data) {
        var claims = data.benefitClaims.slice().sort(function(a, b) { return b.claimDate.localeCompare(a.claimDate); });

        var rowsHtml = claims.map(function(c) {
            var statusClass = c.status === 'approved' ? 'approved' : (c.status === 'rejected' ? 'rejected' : 'pending');
            var statusText = c.status === 'approved' ? '已通过' : (c.status === 'rejected' ? '已拒绝' : '待审批');
            var actions = c.status === 'pending' ?
                '<div class="action-links">' +
                '<span class="action-link" onclick="BenefitsPage.approveClaim(\'' + c.id + '\',\'approved\')">通过</span>' +
                '<span class="action-link danger" onclick="BenefitsPage.approveClaim(\'' + c.id + '\',\'rejected\')">拒绝</span>' +
                '</div>' : '-';

            return '<tr>' +
                '<td>' + c.employeeName + '</td>' +
                '<td>' + c.benefitName + '</td>' +
                '<td>' + c.claimDate + '</td>' +
                '<td>' + (c.amount > 0 ? '¥' + c.amount.toLocaleString() : '-') + '</td>' +
                '<td>' + c.reason + '</td>' +
                '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
                '<td>' + actions + '</td>' +
                '</tr>';
        }).join('');

        return '<div style="margin-bottom:16px"><button class="btn btn-primary" onclick="BenefitsPage.showClaimForm()">+ 新增申领</button></div>' +
            '<div class="card"><div class="card-body"><div class="table-container"><table>' +
            '<thead><tr><th>员工</th><th>福利项目</th><th>申领日期</th><th>金额</th><th>原因</th><th>状态</th><th>操作</th></tr></thead>' +
            '<tbody>' + rowsHtml + '</tbody>' +
            '</table></div></div></div>';
    }

    function renderStats(data) {
        var totalBenefits = data.benefits.length;
        var totalClaims = data.benefitClaims.length;
        var approvedClaims = data.benefitClaims.filter(function(c) { return c.status === 'approved'; });
        var totalAmount = approvedClaims.reduce(function(s, c) { return s + c.amount; }, 0);
        var pendingClaims = data.benefitClaims.filter(function(c) { return c.status === 'pending'; }).length;

        var html = '<div class="stats-grid">';
        html += '<div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon blue">🎁</div></div><div class="stat-card-value">' + totalBenefits + '</div><div class="stat-card-label">福利项目总数</div></div>';
        html += '<div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon green">📋</div></div><div class="stat-card-value">' + totalClaims + '</div><div class="stat-card-label">申领总次数</div></div>';
        html += '<div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon orange">💰</div></div><div class="stat-card-value">¥' + totalAmount.toLocaleString() + '</div><div class="stat-card-label">已审批金额</div></div>';
        html += '<div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon purple">⏳</div></div><div class="stat-card-value">' + pendingClaims + '</div><div class="stat-card-label">待审批申领</div></div>';
        html += '</div>';

        var categoryStats = {};
        data.benefits.forEach(function(b) {
            if (!categoryStats[b.category]) categoryStats[b.category] = { count: 0, claims: 0 };
            categoryStats[b.category].count++;
            var relatedClaims = data.benefitClaims.filter(function(c) { return c.benefitId === b.id && c.status === 'approved'; });
            categoryStats[b.category].claims += relatedClaims.length;
        });

        html += '<div class="card"><div class="card-header"><span class="card-title">各类福利申领情况</span></div>';
        html += '<div class="card-body"><table>';
        html += '<thead><tr><th>福利类别</th><th>项目数</th><th>已申领次数</th><th>使用率</th></tr></thead><tbody>';
        Object.keys(categoryStats).forEach(function(cat) {
            var s = categoryStats[cat];
            var rate = s.count > 0 ? Math.round(s.claims / (s.count * data.employees.length) * 100) : 0;
            html += '<tr><td>' + cat + '</td><td>' + s.count + '</td><td>' + s.claims + '</td>' +
                '<td><div class="progress-bar" style="width:120px;display:inline-block;vertical-align:middle"><div class="progress-bar-fill blue" style="width:' + Math.min(rate, 100) + '%"></div></div> ' + rate + '%</td></tr>';
        });
        html += '</tbody></table></div></div>';

        return html;
    }

    function switchTab(tab) {
        currentTab = tab;
        App.refreshPage();
    }

    function viewBenefit(id) {
        var data = HRData.loadData();
        var benefit = data.benefits.find(function(b) { return b.id === id; });
        if (!benefit) return;

        var claims = data.benefitClaims.filter(function(c) { return c.benefitId === id; });
        var claimsHtml = claims.length > 0 ? claims.map(function(c) {
            return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">' +
                '<span>' + c.employeeName + '</span><span>' + c.claimDate + '</span>' +
                '<span class="status-badge ' + (c.status === 'approved' ? 'approved' : 'pending') + '">' + (c.status === 'approved' ? '已通过' : '待审批') + '</span></div>';
        }).join('') : '<div style="color:var(--text-secondary);text-align:center;padding:16px">暂无申领记录</div>';

        App.showModal(benefit.icon + ' ' + benefit.name,
            '<div style="margin-bottom:16px">' +
            '<div style="font-size:14px;color:var(--text-secondary);margin-bottom:8px">' + benefit.description + '</div>' +
            '<div style="display:flex;gap:16px;font-size:13px">' +
            '<span>适用范围: <strong>' + benefit.eligibility + '</strong></span>' +
            '<span>已申领: <strong>' + benefit.claimedCount + '人</strong></span>' +
            '</div></div>' +
            '<h4 style="margin-bottom:8px">申领记录</h4>' + claimsHtml,
            function() {
                App.closeModal();
                BenefitsPage.showClaimForm(id);
            }, false, '申领'
        );
    }

    function showClaimForm(benefitId) {
        var data = HRData.loadData();
        var empOptions = data.employees.map(function(e) { return '<option value="' + e.id + '">' + e.name + '</option>'; }).join('');
        var benefitOptions = data.benefits.map(function(b) { return '<option value="' + b.id + '"' + (b.id === benefitId ? ' selected' : '') + '>' + b.icon + ' ' + b.name + '</option>'; }).join('');

        App.showModal('新增福利申领',
            '<div class="form-group"><label>员工</label><select id="claimEmployee">' + empOptions + '</select></div>' +
            '<div class="form-group"><label>福利项目</label><select id="claimBenefit">' + benefitOptions + '</select></div>' +
            '<div class="form-group"><label>申领金额</label><input type="number" id="claimAmount" placeholder="无金额则填0" value="0"></div>' +
            '<div class="form-group"><label>申领原因</label><textarea id="claimReason" rows="3" placeholder="请输入申领原因"></textarea></div>',
            function() { submitClaim(); }
        );
    }

    function submitClaim() {
        var data = HRData.loadData();
        var empId = document.getElementById('claimEmployee').value;
        var benefitId = document.getElementById('claimBenefit').value;
        var emp = data.employees.find(function(e) { return e.id === empId; });
        var benefit = data.benefits.find(function(b) { return b.id === benefitId; });
        if (!emp || !benefit) return;

        data.benefitClaims.push({
            id: HRData.generateId('BC'),
            employeeId: empId,
            employeeName: emp.name,
            benefitId: benefitId,
            benefitName: benefit.name,
            claimDate: HRData.getToday(),
            amount: parseFloat(document.getElementById('claimAmount').value) || 0,
            reason: document.getElementById('claimReason').value,
            status: 'pending'
        });

        benefit.claimedCount++;
        HRData.saveData(data);
        App.closeModal();
        App.showToast('福利申领已提交', 'success');
        App.refreshPage();
    }

    function approveClaim(id, status) {
        var data = HRData.loadData();
        var claim = data.benefitClaims.find(function(c) { return c.id === id; });
        if (claim) {
            claim.status = status;
            HRData.saveData(data);
            App.showToast(status === 'approved' ? '申领已通过' : '申领已拒绝', status === 'approved' ? 'success' : 'warning');
            App.refreshPage();
        }
    }

    function showAddBenefitForm() {
        App.showModal('新增福利项目',
            '<div class="form-group"><label>福利名称</label><input type="text" id="newBenefitName" placeholder="如：健身房会员"></div>' +
            '<div class="form-row">' +
            '<div class="form-group"><label>图标</label><input type="text" id="newBenefitIcon" placeholder="如：🏋️" value="🎁"></div>' +
            '<div class="form-group"><label>类别</label><select id="newBenefitCat"><option>法定福利</option><option>医疗保障</option><option>健康关怀</option><option>假期福利</option><option>生活补贴</option><option>成长发展</option><option>关怀福利</option><option>长期激励</option><option>工作方式</option></select></div>' +
            '</div>' +
            '<div class="form-group"><label>适用范围</label><select id="newBenefitElig"><option>全体员工</option><option>P5及以上</option><option>P6及以上</option><option>P7及以上</option><option>管理层</option></select></div>' +
            '<div class="form-group"><label>描述</label><textarea id="newBenefitDesc" rows="3" placeholder="请输入福利描述"></textarea></div>',
            function() {
                var data = HRData.loadData();
                data.benefits.push({
                    id: HRData.generateId('B'),
                    name: document.getElementById('newBenefitName').value,
                    icon: document.getElementById('newBenefitIcon').value || '🎁',
                    category: document.getElementById('newBenefitCat').value,
                    description: document.getElementById('newBenefitDesc').value,
                    eligibility: document.getElementById('newBenefitElig').value,
                    status: 'active',
                    claimedCount: 0
                });
                HRData.saveData(data);
                App.closeModal();
                App.showToast('福利项目已添加', 'success');
                App.refreshPage();
            }
        );
    }

    return {
        render: render,
        switchTab: switchTab,
        viewBenefit: viewBenefit,
        showClaimForm: showClaimForm,
        approveClaim: approveClaim,
        showAddBenefitForm: showAddBenefitForm
    };
})();
