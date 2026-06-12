document.addEventListener('DOMContentLoaded', () => {
    const themeSwitchBtn = document.querySelector("#theme-switch");
    const bodyElement = document.body;

    if (!themeSwitchBtn) return;

    let currentGraphLabels = ['10 am', '11 am', '12 pm', '01 pm'];
    let currentGraphTemps = [16, 17, 18, 19];

    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const applyDarkTheme = () => {
        bodyElement.classList.add('dark-theme');
        document.documentElement.classList.add('dark');
    };

    const removeDarkTheme = () => {
        bodyElement.classList.remove('dark-theme');
        document.documentElement.classList.remove('dark');
    };

  
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        applyDarkTheme();
    } else {
        removeDarkTheme();
    }

  
    themeSwitchBtn.addEventListener('click', () => {
        const isCurrentlyDark = document.documentElement.classList.contains('dark');

        if (isCurrentlyDark) {
            removeDarkTheme();
            localStorage.setItem('theme', 'light');
        } else {
            applyDarkTheme();
            localStorage.setItem('theme', 'dark');
        }

      
    });

 
});