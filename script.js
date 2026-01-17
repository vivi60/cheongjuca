// script.js
// script.js
function checkLogin() {
    const id = document.getElementById('username').value;
    const pw = document.getElementById('password').value;

    if (id === "admin" && pw === "admin0303") {
        localStorage.setItem("loginStatus", "admin"); // 브라우저를 꺼도 남음
        alert("관리자 권한으로 접속합니다.");
        window.location.href = "main.html"; // 경로 주의!
    } else if (id === "outbreak" && pw === "1234") {
        localStorage.setItem("loginStatus", "success");
        alert("또 그들이 온다.");
        window.location.href = "main.html";
    } else {
        alert("아이디 또는 비밀번호가 틀렸습니다.");
    }

    function logout() {
    // 저장된 로그인 정보를 지웁니다.
    localStorage.removeItem("loginStatus");
    alert("로그아웃 되었습니다.");
    window.location.href = "index.html"; // 로그인 페이지로 튕겨내기
}
}