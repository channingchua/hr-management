var DashboardPage = (function() {
    function render(data) {
        var activeEmployees = data.employees.filter(function(e) { return e.status === 'active'; }).length;
        var todayAttendance = HRData.getAttendanceRate(data.attendance, data.employees, HRData.getToday());
        var pendingLeaves = data.leaveRequests.filter(function(l) { return l.status === 'pending'; }).length;
        var avgPerformance = 0;
        if (data.performance.length > 0) {
            var totalScore = data.performance.reduce(function(sum, p) { return sum + p.totalScore; }, 0);
            avgPerformance = Math.round(totalScore / data.performance.length);
        }

        var html = '';
        html += '<div class="stats-grid">';
        html += renderStatCard('👥', 'blue', activeEmployees, '在职员工', '+2', 'up', '较上月');
        html += renderStatCard('✅', 'green', todayAttendance + '%', '今日出勤率', '+3%', 'up', '较昨日');
        html += renderStatCard('📋', 'orange', pendingLeaves, '待审批请假', '需处理', '', '');
        html += renderStatCard('⭐', 'purple', avgPerformance + '分', '平均绩效', '+5', 'up', '较上季度');
        html += '</div>';

        html += '<div class="grid-2">';
        html += renderDeptDistribution(data);
        html += renderPerformanceDistribution(data);
        html += '</div>';

        html += '<div class="grid-2">';
        html += renderRecentActivities(data);
        html += renderPendingItems(data);
        html += '</div>';

        return html;
    }

    function renderStatCard(icon, color, value, label, trend, trendDir, trendLabel) {
        var trendHtml = '';
        if (trend) {
            trendHtml = '<span class="stat-card-trend ' + trendDir + '">' + trend + '</span>';
        }
        return '<div class="stat-card">' +
            '<div class="stat-card-header">' +
            '<div class="stat-card-icon ' + color + '">' + icon + '</div>' +
            trendHtml +
            '</div>' +
            '<div class="stat-card-value">' + value + '</div>' +
            '<div class="stat-card-label">' + label + (trendLabel ? ' · ' + trendLabel : '') + '</div>' +
            '</div>';
    }

    function renderDeptDistribution(data) {
        var deptStats = HRData.getDeptStats(data.employees);
        var depts = Object.keys(deptStats);
        var maxCount = Math.max.apply(null, depts.map(function(d) { return deptStats[d].total; }));
        var colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

        var barsHtml = depts.map(function(dept, i) {
            var count = deptStats[dept].total;
            var height = Math.max(20, (count / maxCount) * 150);
            return '<div class="bar-item">' +
                '<div class="bar-value">' + count + '</div>' +
                '<div class="bar" style="height:' + height + 'px;background:' + colors[i % colors.length] + '"></div>' +
                '<div class="bar-label">' + dept.replace('部', '') + '</div>' +
                '</div>';
        }).join('');

        return '<div class="card">' +
            '<div class="card-header"><span class="card-title">部门人员分布</span></div>' +
            '<div class="card-body">' +
            '<div class="bar-chart">' + barsHtml + '</div>' +
            '</div></div>';
    }

    function renderPerformanceDistribution(data) {
        var levels = { 'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
        data.performance.forEach(function(p) {
            if (levels.hasOwnProperty(p.level)) levels[p.level]++;
        });
        var total = data.performance.length || 1;
        var colors = { 'S': '#10b981', 'A': '#3b82f6', 'B': '#f59e0b', 'C': '#ef4444', 'D': '#6b7280' };

        var conicParts = [];
        var currentAngle = 0;
        Object.keys(levels).forEach(function(level) {
            var pct = (levels[level] / total) * 100;
            if (pct > 0) {
                conicParts.push(colors[level] + ' ' + currentAngle + '% ' + (currentAngle + pct) + '%');
            }
            currentAngle += pct;
        });

        var gradient = conicParts.length > 0 ? 'conic-gradient(' + conicParts.join(', ') + ')' : '#e2e8f0';

        var legendHtml = Object.keys(levels).map(function(level) {
            return '<div class="pie-legend-item">' +
                '<div class="pie-legend-color" style="background:' + colors[level] + '"></div>' +
                '<span>' + level + '级: ' + levels[level] + '人 (' + Math.round(levels[level] / total * 100) + '%)</span>' +
                '</div>';
        }).join('');

        return '<div class="card">' +
            '<div class="card-header"><span class="card-title">绩效等级分布</span></div>' +
            '<div class="card-body">' +
            '<div class="pie-chart-simple">' +
            '<div class="pie-visual" style="background:' + gradient + '"></div>' +
            '<div class="pie-legend">' + legendHtml + '</div>' +
            '</div></div></div>';
    }

    function renderRecentActivities(data) {
        var activities = [];
        data.leaveRequests.slice(-3).forEach(function(l) {
            activities.push({ time: l.createTime, content: l.employeeName + ' 提交了' + l.type + '申请 (' + l.status + ')' });
        });
        data.overtimeRequests.slice(-2).forEach(function(o) {
            activities.push({ time: o.createTime, content: o.employeeName + ' 提交了加班申请' });
        });
        activities.sort(function(a, b) { return b.time.localeCompare(a.time); });
        activities = activities.slice(0, 5);

        var itemsHtml = activities.map(function(a) {
            return '<div class="timeline-item">' +
                '<div class="time">' + a.time + '</div>' +
                '<div class="content">' + a.content + '</div>' +
                '</div>';
        }).join('');

        return '<div class="card">' +
            '<div class="card-header"><span class="card-title">最近动态</span></div>' +
            '<div class="card-body">' +
            '<div class="timeline">' + itemsHtml + '</div>' +
            '</div></div>';
    }

    function renderPendingItems(data) {
        var items = [];
        data.leaveRequests.filter(function(l) { return l.status === 'pending'; }).forEach(function(l) {
            items.push({ type: '请假', content: l.employeeName + ' - ' + l.type + ' (' + l.days + '天)', action: 'leave', id: l.id });
        });
        data.overtimeRequests.filter(function(o) { return o.status === 'pending'; }).forEach(function(o) {
            items.push({ type: '加班', content: o.employeeName + ' - ' + o.hours + '小时', action: 'overtime', id: o.id });
        });
        data.benefitClaims.filter(function(b) { return b.status === 'pending'; }).forEach(function(b) {
            items.push({ type: '福利', content: b.employeeName + ' - ' + b.benefitName, action: 'benefit', id: b.id });
        });

        var rowsHtml = items.length > 0 ? items.map(function(item) {
            return '<tr>' +
                '<td><span class="status-badge pending">' + item.type + '</span></td>' +
                '<td>' + item.content + '</td>' +
                '<td><span class="action-link" onclick="App.quickApprove(\'' + item.action + '\',\'' + item.id + '\')">审批</span></td>' +
                '</tr>';
        }).join('') : '<tr><td colspan="3" style="text-align:center;color:#94a3b8">暂无待办事项</td></tr>';

        return '<div class="card">' +
            '<div class="card-header"><span class="card-title">待办事项</span><span class="status-badge pending">' + items.length + '项待处理</span></div>' +
            '<div class="card-body"><table>' +
            '<thead><tr><th>类型</th><th>内容</th><th>操作</th></tr></thead>' +
            '<tbody>' + rowsHtml + '</tbody>' +
            '</table></div></div>';
    }

    return { render: render };
})();
