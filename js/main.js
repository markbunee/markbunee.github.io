/**
 * 首页：加载图展示一段时间后隐藏 hero、显示主内容
 */
(function () {
    function initHomePage() {
        var hero = document.getElementById('hero');
        var mainContent = document.getElementById('main-content');
        var duration = 2500;
        setTimeout(function () {
            if (hero) hero.classList.add('hidden');
            if (mainContent) mainContent.classList.add('visible');
        }, duration);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHomePage);
    } else {
        initHomePage();
    }
})();
