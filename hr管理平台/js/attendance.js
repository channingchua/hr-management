var AttendancePage = (function() {
    var currentTab = 'clock';

    function render(data) {
        var html = '';
        html += '<div class="tab-nav">';
        html += '<button class="tab-btn ' + (currentTab === 'clock' ? 'active' : '') + '" onclick="AttendancePage.switchTab(\'clock\')">打卡签到</button>';
        html += '<button class="tab-btn ' + (currentTab === 'records' ? 'active' : '') + '" onclick="AttendancePage.switchTab(\'records\')">考勤记录</button>';
        html += '<button class="tab-btn ' + (currentTab === 'leave' ? 'active' : '') + '" onclick="AttendancePage.switchTab(\'leave\')">请假管理</button>';
        html += '<button class="tab-btn ' + (currentTab === 'overtime' ? 'active' : '') + '" onclick="AttendancePage.switchTab(\'overtime\')">加班管理</button>';
        html += '</div>';

        if (currentTab === 'clock') {
            html += renderClockIn(data);
        } else if (currentTab === 'records') {
            html += renderRecords(data);
        } else if (currentTab === 'leave') {
            html += renderLeave(data);
        } else if (currentTab === 'overtime') {
            html += renderOvertime(data);
        }

        return html;
    }

    function renderClockIn(data) {
        var today = HRData.getToday();
        var now = HRData.getCurrentTime();
        var todayRecords = data.attendance.filter(function(a) { return a.date === today; });
        var clockedIn = todayRecords.find(function(a) { return a.type === 'clock_in'; });
        var clockedOut = todayRecords.find(function(a) { return a.type === 'clock_out'; });

        var statusText = '未打卡';
        var btnClass = 'clock-in';
        var btnText = '上班打卡';
        var btnDisabled = '';
        if (clockedIn && !clockedOut) {
            statusText = '已签到 ' + clockedIn.time;
            btnClass = 'clock-out';
            btnText = '下班打卡';
        } else if (clockedIn && clockedOut) {
            statusText = '签到 ' + clockedIn.time + ' / 签退 ' + clockedOut.time;
            btnText = '已完成打卡';
            btnDisabled = 'disabled';
        }

        var recentHtml = todayRecords.map(function(r) {
            return '<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border)">' +
                '<span>' + (r.type === 'clock_in' ? '签到' : '签退') + '</span>' +
                '<span>' + r.time + '</span>' +
                '<span class="status-badge active">正常</span>' +
                '</div>';
        }).join('');

        return '<div class="grid-2">' +
            '<div class="card">' +
            '<div class="card-header"><span class="card-title">今日打卡</span></div>' +
            '<div class="card-body">' +
            '<div class="clock-in-area">' +
            '<div class="clock-date">' + today + '</div>' +
            '<div class="clock-display" id="liveClock">' + now + '</div>' +
            '<div class="clock-status">' + statusText + '</div>' +
            '<button class="clock-btn ' + btnClass + '" ' + btnDisabled + ' onclick="AttendancePage.doClock(\'' + (clockedIn ? 'clock_out' : 'clock_in') + '\')">' + btnText + '</button>' +
            '</div></div></div>' +
            '<div class="card">' +
            '<div class="card-header"><span class="card-title">今日打卡记录</span></div>' +
            '<div class="card-body">' +
            (recentHtml || '<div class="empty-state"><div class="empty-state-icon">📋</div><div class="empty-state-text">今日暂无打卡记录</div></div>') +
            '</div></div></div>' +
            renderAttendanceStats(data);
    }

    function renderAttendanceStats(data) {
        var today = HRData.getToday();
        var activeCount = data.employees.filter(function(e) { return e.status === 'active'; }).length;
        var todayClockIn = data.attendance.filter(function(a) { return a.date === today && a.type === 'clock_in'; }).length;
        var onLeave = data.leaveRequests.filter(function(l) {
            return l.status === 'approved' && l.startDate <= today && l.endDate >= today;
        }).length;
        var rate = activeCount > 0 ? Math.round(todayClockIn / activeCount * 100) : 0;

        return '<div class="stats-grid" style="margin-top:24px">' +
            renderStatMini('👤', 'blue', activeCount, '应出勤人数') +
            renderStatMini('✅', 'green', todayClockIn, '已出勤人数') +
            renderStatMini('📋', 'orange', onLeave, '请假人数') +
            renderStatMini('📊', 'purple', rate + '%', '出勤率') +
            '</div>';
    }

    function renderStatMini(icon, color, value, label) {
        return '<div class="stat-card"><div class="stat-card-header"><div class="stat-card-icon ' + color + '">' + icon + '</div></div>' +
            '<div class="stat-card-value">' + value + '</div><div class="stat-card-label">' + label + '</div></div>';
    }

    function renderRecords(data) {
        var records = data.attendance.slice().sort(function(a, b) { return b.date.localeCompare(a.date) || b.time.localeCompare(a.time); });

        var filterHtml = '<div class="filter-bar">' +
            '<select id="attDeptFilter" onchange="AttendancePage.filterRecords()">' +
            '<option value="">全部部门</option>' +
            '<option>技术部</option><option>产品部</option><option>市场部</option><option>运营部</option><option>人力资源部</option><option>财务部</option>' +
            '</select>' +
            '<input type="date" id="attDateFilter" value="' + HRData.getToday() + '" onchange="AttendancePage.filterRecords()">' +
            '</div>';

        var rowsHtml = records.length > 0 ? records.map(function(r) {
            var emp = data.employees.find(function(e) { return e.id === r.employeeId; });
            return '<tr>' +
                '<td>' + r.date + '</td>' +
                '<td><div class="employee-row"><div class="avatar-sm">' + (r.employeeName ? r.employeeName.charAt(0) : '?') + '</div><div><div class="employee-name">' + r.employeeName + '</div><div class="employee-dept">' + (emp ? emp.dept : '-') + '</div></div></div></td>' +
                '<td>' + (r.type === 'clock_in' ? '签到' : '签退') + '</td>' +
                '<td>' + r.time + '</td>' +
                '<td><span class="status-badge active">正常</span></td>' +
                '</tr>';
        }).join('') : '<tr><td colspan="5" style="text-align:center;color:#94a3b8">暂无考勤记录</td></tr>';

        return filterHtml +
            '<div class="card"><div class="card-body"><div class="table-container"><table>' +
            '<thead><tr><th>日期</th><th>员工</th><th>类型</th><th>时间</th><th>状态</th></tr></thead>' +
            '<tbody>' + rowsHtml + '</tbody>' +
            '</table></div></div></div>';
    }

    function renderLeave(data) {
        var leaves = data.leaveRequests.slice().sort(function(a, b) { return b.createTime.localeCompare(a.createTime); });

        var rowsHtml = leaves.map(function(l) {
            var statusClass = l.status === 'approved' ? 'approved' : (l.status === 'rejected' ? 'rejected' : 'pending');
            var statusText = l.status === 'approved' ? '已通过' : (l.status === 'rejected' ? '已拒绝' : '待审批');
            var actionsHtml = l.status === 'pending' ?
                '<div class="action-links">' +
                '<span class="action-link" onclick="AttendancePage.approveLeave(\'' + l.id + '\',\'approved\')">通过</span>' +
                '<span class="action-link danger" onclick="AttendancePage.approveLeave(\'' + l.id + '\',\'rejected\')">拒绝</span>' +
                '</div>' : '-';
            return '<tr>' +
                '<td>' + l.employeeName + '</td>' +
                '<td><span class="status-badge ' + (l.type === '年假' ? 'active' : (l.type === '病假' ? 'rejected' : 'pending')) + '">' + l.type + '</span></td>' +
                '<td>' + l.startDate + ' ~ ' + l.endDate + '</td>' +
                '<td>' + l.days + '天</td>' +
                '<td>' + l.reason + '</td>' +
                '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
                '<td>' + actionsHtml + '</td>' +
                '</tr>';
        }).join('');

        return '<div style="margin-bottom:16px"><button class="btn btn-primary" onclick="AttendancePage.showLeaveForm()">+ 新增请假</button></div>' +
            '<div class="card"><div class="card-body"><div class="table-container"><table>' +
            '<thead><tr><th>员工</th><th>类型</th><th>时间</th><th>天数</th><th>原因</th><th>状态</th><th>操作</th></tr></thead>' +
            '<tbody>' + rowsHtml + '</tbody>' +
            '</table></div></div></div>';
    }

    function renderOvertime(data) {
        var overtimes = data.overtimeRequests.slice().sort(function(a, b) { return b.createTime.localeCompare(a.createTime); });

        var rowsHtml = overtimes.map(function(o) {
            var statusClass = o.status === 'approved' ? 'approved' : (o.status === 'rejected' ? 'rejected' : 'pending');
            var statusText = o.status === 'approved' ? '已通过' : (o.status === 'rejected' ? '已拒绝' : '待审批');
            var actionsHtml = o.status === 'pending' ?
                '<div class="action-links">' +
                '<span class="action-link" onclick="AttendancePage.approveOvertime(\'' + o.id + '\',\'approved\')">通过</span>' +
                '<span class="action-link danger" onclick="AttendancePage.approveOvertime(\'' + o.id + '\',\'rejected\')">拒绝</span>' +
                '</div>' : '-';
            return '<tr>' +
                '<td>' + o.employeeName + '</td>' +
                '<td>' + o.date + '</td>' +
                '<td>' + o.hours + '小时</td>' +
                '<td>' + o.reason + '</td>' +
                '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
                '<td>' + actionsHtml + '</td>' +
                '</tr>';
        }).join('');

        return '<div style="margin-bottom:16px"><button class="btn btn-primary" onclick="AttendancePage.showOvertimeForm()">+ 新增加班</button></div>' +
            '<div class="card"><div class="card-body"><div class="table-container"><table>' +
            '<thead><tr><th>员工</th><th>日期</th><th>时长</th><th>原因</th><th>状态</th><th>操作</th></tr></thead>' +
            '<tbody>' + rowsHtml + '</tbody>' +
            '</table></div></div></div>';
    }

    function switchTab(tab) {
        currentTab = tab;
        App.refreshPage();
    }

    function doClock(type) {
        var data = HRData.loadData();
        var now = new Date();
        var timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        data.attendance.push({
            id: HRData.generateId('ATT'),
            employeeId: 'E005',
            employeeName: '陈晨',
            date: HRData.getToday(),
            time: timeStr,
            type: type
        });
        HRData.saveData(data);
        App.showToast(type === 'clock_in' ? '签到成功！' : '签退成功！', 'success');
        App.refreshPage();
    }

    function approveLeave(id, status) {
        var data = HRData.loadData();
        var leave = data.leaveRequests.find(function(l) { return l.id === id; });
        if (leave) {
            leave.status = status;
            leave.approver = '陈晨';
            HRData.saveData(data);
            App.showToast(status === 'approved' ? '请假已通过' : '请假已拒绝', status === 'approved' ? 'success' : 'warning');
            App.refreshPage();
        }
    }

    function approveOvertime(id, status) {
        var data = HRData.loadData();
        var ot = data.overtimeRequests.find(function(o) { return o.id === id; });
        if (ot) {
            ot.status = status;
            HRData.saveData(data);
            App.showToast(status === 'approved' ? '加班已通过' : '加班已拒绝', status === 'approved' ? 'success' : 'warning');
            App.refreshPage();
        }
    }

    function showLeaveForm() {
        var data = HRData.loadData();
        var optionsHtml = data.employees.map(function(e) { return '<option value="' + e.id + '">' + e.name + ' - ' + e.dept + '</option>'; }).join('');
        App.showModal('新增请假申请', 
            '<div class="form-group"><label>员工</label><select id="leaveEmployee">' + optionsHtml + '</select></div>' +
            '<div class="form-row">' +
            '<div class="form-group"><label>请假类型</label><select id="leaveType"><option>年假</option><option>病假</option><option>事假</option><option>婚假</option><option>产假</option></select></div>' +
            '<div class="form-group"><label>天数</label><input type="number" id="leaveDays" min="0.5" step="0.5" value="1"></div>' +
            '</div>' +
            '<div class="form-row">' +
            '<div class="form-group"><label>开始日期</label><input type="date" id="leaveStart" value="' + HRData.getToday() + '"></div>' +
            '<div class="form-group"><label>结束日期</label><input type="date" id="leaveEnd" value="' + HRData.getToday() + '"></div>' +
            '</div>' +
            '<div class="form-group"><label>请假原因</label><textarea id="leaveReason" rows="3" placeholder="请输入请假原因"></textarea></div>',
            function() { submitLeave(); }
        );
    }

    function submitLeave() {
        var data = HRData.loadData();
        var empId = document.getElementById('leaveEmployee').value;
        var emp = data.employees.find(function(e) { return e.id === empId; });
        if (!emp) return;

        data.leaveRequests.push({
            id: HRData.generateId('L'),
            employeeId: empId,
            employeeName: emp.name,
            type: document.getElementById('leaveType').value,
            startDate: document.getElementById('leaveStart').value,
            endDate: document.getElementById('leaveEnd').value,
            days: parseFloat(document.getElementById('leaveDays').value) || 1,
            reason: document.getElementById('leaveReason').value,
            status: 'pending',
            approver: '',
            createTime: HRData.getToday() + ' ' + HRData.getCurrentTime().substring(0, 5)
        });
        HRData.saveData(data);
        App.closeModal();
        App.showToast('请假申请已提交', 'success');
        App.refreshPage();
    }

    function showOvertimeForm() {
        var data = HRData.loadData();
        var optionsHtml = data.employees.map(function(e) { return '<option value="' + e.id + '">' + e.name + ' - ' + e.dept + '</option>'; }).join('');
        App.showModal('新增加班申请',
            '<div class="form-group"><label>员工</label><select id="otEmployee">' + optionsHtml + '</select></div>' +
            '<div class="form-row">' +
            '<div class="form-group"><label>加班日期</label><input type="date" id="otDate" value="' + HRData.getToday() + '"></div>' +
            '<div class="form-group"><label>加班时长(小时)</label><input type="number" id="otHours" min="0.5" step="0.5" value="2"></div>' +
            '</div>' +
            '<div class="form-group"><label>加班原因</label><textarea id="otReason" rows="3" placeholder="请输入加班原因"></textarea></div>',
            function() { submitOvertime(); }
        );
    }

    function submitOvertime() {
        var data = HRData.loadData();
        var empId = document.getElementById('otEmployee').value;
        var emp = data.employees.find(function(e) { return e.id === empId; });
        if (!emp) return;

        data.overtimeRequests.push({
            id: HRData.generateId('OT'),
            employeeId: empId,
            employeeName: emp.name,
            date: document.getElementById('otDate').value,
            hours: parseFloat(document.getElementById('otHours').value) || 2,
            reason: document.getElementById('otReason').value,
            status: 'pending',
            createTime: HRData.getToday() + ' ' + HRData.getCurrentTime().substring(0, 5)
        });
        HRData.saveData(data);
        App.closeModal();
        App.showToast('加班申请已提交', 'success');
        App.refreshPage();
    }

    function filterRecords() {
        App.refreshPage();
    }

    return {
        render: render,
        switchTab: switchTab,
        doClock: doClock,
        approveLeave: approveLeave,
        approveOvertime: approveOvertime,
        showLeaveForm: showLeaveForm,
        showOvertimeForm: showOvertimeForm,
        filterRecords: filterRecords
    };
})();
