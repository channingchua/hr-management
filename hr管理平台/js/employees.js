var EmployeesPage = (function() {
    var currentFilter = '';

    function render(data) {
        var html = '';
        html += '<div class="filter-bar">';
        html += '<select id="empDeptFilter" onchange="EmployeesPage.filter()">';
        html += '<option value="">全部部门</option>';
        html += '<option>技术部</option><option>产品部</option><option>市场部</option><option>运营部</option><option>人力资源部</option><option>财务部</option>';
        html += '</select>';
        html += '<select id="empStatusFilter" onchange="EmployeesPage.filter()">';
        html += '<option value="">全部状态</option><option value="active">在职</option><option value="on_leave">休假中</option><option value="inactive">离职</option>';
        html += '</select>';
        html += '<input type="text" id="empSearchInput" placeholder="搜索员工姓名..." oninput="EmployeesPage.filter()">';
        html += '<button class="btn btn-primary" onclick="EmployeesPage.showAddForm()">+ 新增员工</button>';
        html += '</div>';

        var employees = data.employees;
        var deptFilter = document.getElementById('empDeptFilter');
        var statusFilter = document.getElementById('empStatusFilter');
        var searchInput = document.getElementById('empSearchInput');

        if (deptFilter && deptFilter.value) {
            employees = employees.filter(function(e) { return e.dept === deptFilter.value; });
        }
        if (statusFilter && statusFilter.value) {
            employees = employees.filter(function(e) { return e.status === statusFilter.value; });
        }
        if (searchInput && searchInput.value) {
            var keyword = searchInput.value.toLowerCase();
            employees = employees.filter(function(e) { return e.name.toLowerCase().indexOf(keyword) >= 0; });
        }

        var activeCount = employees.filter(function(e) { return e.status === 'active'; }).length;
        var onLeaveCount = employees.filter(function(e) { return e.status === 'on_leave'; }).length;

        html += '<div class="stats-grid" style="margin-bottom:20px">';
        html += '<div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon blue">👥</div></div><div class="stat-card-value">' + employees.length + '</div><div class="stat-card-label">显示人数</div></div>';
        html += '<div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon green">✅</div></div><div class="stat-card-value">' + activeCount + '</div><div class="stat-card-label">在职</div></div>';
        html += '<div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon orange">📋</div></div><div class="stat-card-value">' + onLeaveCount + '</div><div class="stat-card-label">休假中</div></div>';
        html += '</div>';

        var rowsHtml = employees.map(function(e) {
            var statusClass = e.status === 'active' ? 'active' : (e.status === 'on_leave' ? 'pending' : 'inactive');
            var statusText = e.status === 'active' ? '在职' : (e.status === 'on_leave' ? '休假中' : '离职');
            return '<tr>' +
                '<td><div class="employee-row"><div class="avatar-sm">' + e.name.charAt(0) + '</div><div><div class="employee-name">' + e.name + '</div><div class="employee-dept">' + e.id + '</div></div></div></td>' +
                '<td>' + e.dept + '</td>' +
                '<td>' + e.position + '</td>' +
                '<td>' + e.level + '</td>' +
                '<td>' + e.joinDate + '</td>' +
                '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
                '<td><div class="action-links">' +
                '<span class="action-link" onclick="EmployeesPage.viewEmployee(\'' + e.id + '\')">查看</span>' +
                '<span class="action-link" onclick="EmployeesPage.editEmployee(\'' + e.id + '\')">编辑</span>' +
                '</div></td>' +
                '</tr>';
        }).join('');

        html += '<div class="card"><div class="card-body"><div class="table-container"><table>' +
            '<thead><tr><th>员工</th><th>部门</th><th>职位</th><th>职级</th><th>入职日期</th><th>状态</th><th>操作</th></tr></thead>' +
            '<tbody>' + rowsHtml + '</tbody></table></div></div></div>';

        return html;
    }

    function filter() {
        App.refreshPage();
    }

    function showAddForm() {
        App.showModal('新增员工',
            '<div class="form-row">' +
            '<div class="form-group"><label>姓名</label><input type="text" id="newEmpName" placeholder="请输入姓名"></div>' +
            '<div class="form-group"><label>工号</label><input type="text" id="newEmpId" placeholder="如: E016"></div>' +
            '</div>' +
            '<div class="form-row">' +
            '<div class="form-group"><label>部门</label><select id="newEmpDept"><option>技术部</option><option>产品部</option><option>市场部</option><option>运营部</option><option>人力资源部</option><option>财务部</option></select></div>' +
            '<div class="form-group"><label>职位</label><input type="text" id="newEmpPos" placeholder="如: 前端工程师"></div>' +
            '</div>' +
            '<div class="form-row">' +
            '<div class="form-group"><label>职级</label><select id="newEmpLevel"><option>P4</option><option>P5</option><option>P6</option><option>P7</option><option>P8</option></select></div>' +
            '<div class="form-group"><label>入职日期</label><input type="date" id="newEmpJoin" value="' + HRData.getToday() + '"></div>' +
            '</div>' +
            '<div class="form-row">' +
            '<div class="form-group"><label>手机</label><input type="text" id="newEmpPhone" placeholder="138****1234"></div>' +
            '<div class="form-group"><label>邮箱</label><input type="email" id="newEmpEmail" placeholder="name@company.com"></div>' +
            '</div>',
            function() { submitAddEmployee(); }
        );
    }

    function submitAddEmployee() {
        var data = HRData.loadData();
        var name = document.getElementById('newEmpName').value;
        if (!name) {
            App.showToast('请输入员工姓名', 'error');
            return;
        }

        data.employees.push({
            id: document.getElementById('newEmpId').value || HRData.generateId('E'),
            name: name,
            dept: document.getElementById('newEmpDept').value,
            position: document.getElementById('newEmpPos').value,
            level: document.getElementById('newEmpLevel').value,
            joinDate: document.getElementById('newEmpJoin').value,
            status: 'active',
            phone: document.getElementById('newEmpPhone').value,
            email: document.getElementById('newEmpEmail').value
        });

        HRData.saveData(data);
        App.closeModal();
        App.showToast('员工已添加', 'success');
        App.refreshPage();
    }

    function viewEmployee(id) {
        var data = HRData.loadData();
        var emp = data.employees.find(function(e) { return e.id === id; });
        if (!emp) return;

        var perf = data.performance.find(function(p) { return p.employeeId === id; });
        var leaves = data.leaveRequests.filter(function(l) { return l.employeeId === id; });
        var claims = data.benefitClaims.filter(function(c) { return c.employeeId === id; });

        var statusText = emp.status === 'active' ? '在职' : (emp.status === 'on_leave' ? '休假中' : '离职');
        var perfHtml = perf ? '<div style="margin-top:8px"><strong>最新绩效:</strong> ' + perf.totalScore + '分 (' + perf.level + '级)</div>' : '<div style="margin-top:8px;color:var(--text-secondary)">暂无绩效记录</div>';

        var leavesHtml = leaves.length > 0 ? leaves.slice(-3).map(function(l) {
            return '<div style="font-size:13px;padding:4px 0">' + l.type + ' ' + l.startDate + '~' + l.endDate + ' (' + l.days + '天) - ' + (l.status === 'approved' ? '已通过' : '待审批') + '</div>';
        }).join('') : '<div style="color:var(--text-secondary);font-size:13px">暂无请假记录</div>';

        var claimsHtml = claims.length > 0 ? claims.slice(-3).map(function(c) {
            return '<div style="font-size:13px;padding:4px 0">' + c.benefitName + ' ' + c.claimDate + (c.amount > 0 ? ' ¥' + c.amount : '') + ' - ' + (c.status === 'approved' ? '已通过' : '待审批') + '</div>';
        }).join('') : '<div style="color:var(--text-secondary);font-size:13px">暂无福利申领</div>';

        App.showModal(emp.name + ' - 员工详情',
            '<div style="text-align:center;margin-bottom:20px">' +
            '<div class="avatar-sm" style="width:64px;height:64px;font-size:24px;margin:0 auto 8px">' + emp.name.charAt(0) + '</div>' +
            '<div style="font-size:18px;font-weight:700">' + emp.name + '</div>' +
            '<div style="color:var(--text-secondary)">' + emp.dept + ' · ' + emp.position + '</div>' +
            '<span class="status-badge active" style="margin-top:8px">' + statusText + '</span>' +
            '</div>' +
            '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px;margin-bottom:16px">' +
            '<div><strong>工号:</strong> ' + emp.id + '</div>' +
            '<div><strong>职级:</strong> ' + emp.level + '</div>' +
            '<div><strong>入职:</strong> ' + emp.joinDate + '</div>' +
            '<div><strong>手机:</strong> ' + emp.phone + '</div>' +
            '<div><strong>邮箱:</strong> ' + emp.email + '</div>' +
            '</div>' +
            perfHtml +
            '<div style="margin-top:16px"><strong>请假记录</strong>' + leavesHtml + '</div>' +
            '<div style="margin-top:16px"><strong>福利申领</strong>' + claimsHtml + '</div>',
            null, true
        );
    }

    function editEmployee(id) {
        var data = HRData.loadData();
        var emp = data.employees.find(function(e) { return e.id === id; });
        if (!emp) return;

        App.showModal('编辑员工 - ' + emp.name,
            '<div class="form-row">' +
            '<div class="form-group"><label>姓名</label><input type="text" id="editEmpName" value="' + emp.name + '"></div>' +
            '<div class="form-group"><label>部门</label><select id="editEmpDept">' +
            ['技术部','产品部','市场部','运营部','人力资源部','财务部'].map(function(d) {
                return '<option' + (d === emp.dept ? ' selected' : '') + '>' + d + '</option>';
            }).join('') + '</select></div>' +
            '</div>' +
            '<div class="form-row">' +
            '<div class="form-group"><label>职位</label><input type="text" id="editEmpPos" value="' + emp.position + '"></div>' +
            '<div class="form-group"><label>职级</label><select id="editEmpLevel">' +
            ['P4','P5','P6','P7','P8'].map(function(l) {
                return '<option' + (l === emp.level ? ' selected' : '') + '>' + l + '</option>';
            }).join('') + '</select></div>' +
            '</div>' +
            '<div class="form-row">' +
            '<div class="form-group"><label>手机</label><input type="text" id="editEmpPhone" value="' + emp.phone + '"></div>' +
            '<div class="form-group"><label>邮箱</label><input type="email" id="editEmpEmail" value="' + emp.email + '"></div>' +
            '</div>' +
            '<div class="form-group"><label>状态</label><select id="editEmpStatus">' +
            '<option value="active"' + (emp.status === 'active' ? ' selected' : '') + '>在职</option>' +
            '<option value="on_leave"' + (emp.status === 'on_leave' ? ' selected' : '') + '>休假中</option>' +
            '<option value="inactive"' + (emp.status === 'inactive' ? ' selected' : '') + '>离职</option>' +
            '</select></div>',
            function() {
                emp.name = document.getElementById('editEmpName').value;
                emp.dept = document.getElementById('editEmpDept').value;
                emp.position = document.getElementById('editEmpPos').value;
                emp.level = document.getElementById('editEmpLevel').value;
                emp.phone = document.getElementById('editEmpPhone').value;
                emp.email = document.getElementById('editEmpEmail').value;
                emp.status = document.getElementById('editEmpStatus').value;
                HRData.saveData(data);
                App.closeModal();
                App.showToast('员工信息已更新', 'success');
                App.refreshPage();
            }
        );
    }

    return {
        render: render,
        filter: filter,
        showAddForm: showAddForm,
        viewEmployee: viewEmployee,
        editEmployee: editEmployee
    };
})();
