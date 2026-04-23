var App = (function() {
    var currentPage = 'dashboard';
    var clockInterval = null;

    function init() {
        updateDate();
        setupNavigation();
        setupModal();
        setupNotifications();
        refreshPage();
        startClock();
    }

    function updateDate() {
        var now = new Date();
        var weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        var dateStr = now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日 周' + weekDays[now.getDay()];
        document.getElementById('currentDate').textContent = dateStr;
    }

    function startClock() {
        if (clockInterval) clearInterval(clockInterval);
        clockInterval = setInterval(function() {
            var clockEl = document.getElementById('liveClock');
            if (clockEl) {
                clockEl.textContent = HRData.getCurrentTime();
            }
        }, 1000);
    }

    function setupNavigation() {
        var navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(function(item) {
            item.addEventListener('click', function() {
                navItems.forEach(function(n) { n.classList.remove('active'); });
                item.classList.add('active');
                currentPage = item.getAttribute('data-page');
                var titles = {
                    'dashboard': '数据看板',
                    'attendance': '考勤管理',
                    'performance': '绩效管理',
                    'benefits': '员工福利',
                    'business': '业务服务',
                    'employees': '员工管理'
                };
                document.getElementById('pageTitle').textContent = titles[currentPage] || '';
                refreshPage();
            });
        });
    }

    function setupModal() {
        document.getElementById('modalClose').addEventListener('click', function() {
            closeModal();
        });
        document.getElementById('modalOverlay').addEventListener('click', function(e) {
            if (e.target === document.getElementById('modalOverlay')) {
                closeModal();
            }
        });
    }

    function setupNotifications() {
        document.getElementById('notificationBell').addEventListener('click', function() {
            var data = HRData.loadData();
            var notifs = data.notifications.filter(function(n) { return !n.read; });
            if (notifs.length === 0) {
                showToast('暂无新通知', 'info');
                return;
            }
            var html = notifs.map(function(n) {
                return '<div style="padding:10px 0;border-bottom:1px solid var(--border)">' +
                    '<div style="font-size:14px">' + n.message + '</div>' +
                    '<div style="font-size:12px;color:var(--text-secondary)">' + n.time + '</div></div>';
            }).join('');
            showModal('通知 (' + notifs.length + ')', html, function() {
                notifs.forEach(function(n) { n.read = true; });
                HRData.saveData(data);
                document.getElementById('notifBadge').style.display = 'none';
                closeModal();
            });
        });
    }

    function refreshPage() {
        var data = HRData.loadData();
        var contentArea = document.getElementById('contentArea');

        switch (currentPage) {
            case 'dashboard':
                contentArea.innerHTML = DashboardPage.render(data);
                break;
            case 'attendance':
                contentArea.innerHTML = AttendancePage.render(data);
                break;
            case 'performance':
                contentArea.innerHTML = PerformancePage.render(data);
                break;
            case 'benefits':
                contentArea.innerHTML = BenefitsPage.render(data);
                break;
            case 'business':
                contentArea.innerHTML = BusinessPage.render(data);
                break;
            case 'employees':
                contentArea.innerHTML = EmployeesPage.render(data);
                break;
            default:
                contentArea.innerHTML = DashboardPage.render(data);
        }

        updateNotificationBadge(data);
    }

    function updateNotificationBadge(data) {
        var unread = data.notifications.filter(function(n) { return !n.read; }).length;
        var badge = document.getElementById('notifBadge');
        if (unread > 0) {
            badge.textContent = unread;
            badge.style.display = '';
        } else {
            badge.style.display = 'none';
        }
    }

    function showModal(title, bodyHtml, onConfirm, readOnly, confirmText) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = bodyHtml;

        var footer = document.getElementById('modalFooter');
        if (readOnly) {
            footer.innerHTML = '<button class="btn btn-outline" onclick="App.closeModal()">关闭</button>';
        } else if (onConfirm) {
            footer.innerHTML = '<button class="btn btn-outline" onclick="App.closeModal()">取消</button>' +
                '<button class="btn btn-primary" id="modalConfirmBtn">' + (confirmText || '确认') + '</button>';
            document.getElementById('modalConfirmBtn').addEventListener('click', onConfirm);
        } else {
            footer.innerHTML = '<button class="btn btn-outline" onclick="App.closeModal()">关闭</button>';
        }

        document.getElementById('modalOverlay').classList.add('show');
    }

    function closeModal() {
        document.getElementById('modalOverlay').classList.remove('show');
    }

    function showToast(message, type) {
        type = type || 'info';
        var container = document.getElementById('toastContainer');
        var toast = document.createElement('div');
        toast.className = 'toast ' + type;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(function() {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(function() {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 3000);
    }

    function quickApprove(type, id) {
        var data = HRData.loadData();
        if (type === 'leave') {
            var leave = data.leaveRequests.find(function(l) { return l.id === id; });
            if (leave) {
                leave.status = 'approved';
                leave.approver = '陈晨';
            }
        } else if (type === 'overtime') {
            var ot = data.overtimeRequests.find(function(o) { return o.id === id; });
            if (ot) ot.status = 'approved';
        } else if (type === 'benefit') {
            var claim = data.benefitClaims.find(function(c) { return c.id === id; });
            if (claim) claim.status = 'approved';
        }
        HRData.saveData(data);
        showToast('已快速审批通过', 'success');
        refreshPage();
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        refreshPage: refreshPage,
        showModal: showModal,
        closeModal: closeModal,
        showToast: showToast,
        quickApprove: quickApprove
    };
})();
