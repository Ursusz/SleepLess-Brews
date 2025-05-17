window.addEventListener("DOMContentLoaded", function (){
    document.getElementById("schimba_tema").onclick=function (){
        console.log(document.body.classList);
        const themeIcon = document.getElementById('tema_icon');
        if(document.body.classList.toggle("dark")){
            localStorage.setItem("tema", "dark");
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }else{
            localStorage.removeItem("tema");
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
    }
});