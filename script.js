// script.js

// 1. 생존자 명단 (여기만 수정하면 인원을 계속 추가할 수 있습니다)
const userDB = {
    "13reaking_news":    { pw: "admin0303", nick: "관리자",   role: "admin" },
    "13reaking_system": { pw:"1234", nick: "시스템", role: "user"},
    "runner1":  { pw: "run1",      nick: "러너1",    role: "user" }
};

function checkLogin() {
    const id = document.getElementById('username').value;
    const pw = document.getElementById('password').value;

    // 명단에 아이디가 있고, 비밀번호가 맞는지 확인
    if (userDB[id] && userDB[id].pw === pw) {
        
        // 로그인 성공! 정보 저장
        const userInfo = userDB[id];
        
        // 1. 권한 저장 (기존 코드 호환성을 위해 admin 또는 success로 저장)
        localStorage.setItem("loginStatus", userInfo.role === "admin" ? "admin" : "success");
        
        // 2. 아이디, 닉네임 저장 (화면에 보여줄 이름)
        localStorage.setItem("userNick", userInfo.nick);
        localStorage.setItem("loginID", id); // 👈 이 줄을 꼭 추가하세요! (id는 13reaking_system 같은 값입니다)

        alert(`${userInfo.nick}님, 생존을 환영합니다.`);
        window.location.href = "main.html"; // 메인으로 이동

    } else {
        alert("신원 확인 불가. 아이디 또는 비밀번호를 확인하세요.");
    }
}

function logout() {
    if (confirm("정말로 로그아웃 하시겠습니까?")) {
        localStorage.clear(); // 모든 정보(상태, 닉네임 등) 삭제
        alert("로그아웃 되었습니다.");
        window.location.href = "index.html";
    }
}