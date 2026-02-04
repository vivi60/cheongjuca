// script.js

// 1. 회원 명단 (비밀번호 관리)
const userDB = {
    "13reaking_news": { pw: "admin0303", nick: "관리자", role: "admin" }, // 관리자 계정
    "runner1":        { pw: "outbreak",      nick: "강나리",  role: "user" },
    "runner2":        { pw: "outbreak",      nick: "강진혁",  role: "user" },
    "runner3":        { pw: "outbreak",      nick: "강초아",  role: "user" },
    "runner4":        { pw: "outbreak",      nick: "강하나",  role: "user" },
    "runner5":        { pw: "outbreak",      nick: "고요한",  role: "user" },
    "runner6":        { pw: "outbreak",      nick: "매튜 백",  role: "user" },
    "runner7":        { pw: "outbreak",      nick: "백람",  role: "user" },
    "runner8":        { pw: "outbreak",      nick: "범지태",  role: "user" },
    "runner9":        { pw: "outbreak",      nick: "양희진",  role: "user" },
    "runner10":        { pw: "outbreak",      nick: "유재이",  role: "user" },
    "runner11":        { pw: "outbreak",      nick: "유한결",  role: "user" },
    "runner12":        { pw: "outbreak",      nick: "윤태",  role: "user" },
    "runner13":        { pw: "outbreak",      nick: "이기조",  role: "user" },
    "runner14":        { pw: "outbreak",      nick: "이은정",  role: "user" },
    "runner15":        { pw: "outbreak",      nick: "이필우",  role: "user" },
    "runner16":        { pw: "outbreak",      nick: "임새언",  role: "user" },
    "runner17":        { pw: "outbreak",      nick: "임해신",  role: "user" },
    "runner18":        { pw: "outbreak",      nick: "장만우",  role: "user" },
    "runner19":        { pw: "outbreak",      nick: "정해찬",  role: "user" },
    "runner20":        { pw: "outbreak",      nick: "청록",  role: "user" },
    "runner21":        { pw: "outbreak",      nick: "최도화",  role: "user" },
    "runner22":        { pw: "outbreak",      nick: "한바다",  role: "user" },
};

// 2. 로그인 체크 함수 (index.html에서 사용)
function checkLogin() {
    const id = document.getElementById('username').value;
    const pw = document.getElementById('password').value;

    if (userDB[id] && userDB[id].pw === pw) {
        // 정보 가져오기
        const userInfo = userDB[id];
        
        // ★ 핵심: 관리자인지 확인하여 상태 저장
        const status = userInfo.role === "admin" ? "admin" : "success";
        
        localStorage.setItem("loginStatus", status); // "admin" 또는 "success"
        localStorage.setItem("loginID", id);         // "13reaking_news"
        localStorage.setItem("userNick", userInfo.nick); // "관리자"

        alert(`[${userInfo.nick}]님, 접속 승인되었습니다.`);
        window.location.href = "main.html"; // 메인으로 이동
    } else {
        alert("아이디 또는 비밀번호가 일치하지 않습니다.");
    }
}

// 3. 로그아웃 함수
function logout() {
    if(confirm("로그아웃 하시겠습니까?")) {
        localStorage.clear();
        window.location.href = "index.html";
    }
}

// script.js 수정 버전
/* script.js 수정 버전 */
async function postToMastodon(message) {
    // 1. API 기본 경로 설정 (알려주신 대로 api/v1을 포함합니다)
    const API_BASE = "https://planet.moe/api/v1"; 
    const accessToken = "85ZTzpmUp0BRskvE9uOXZ_9NnjBOJSCbyGQ3pAXr0Ag"; // 기존 토큰 유지

    try {
        // 2. 최종 호출 주소는 API_BASE 뒤에 /statuses를 붙인 형태가 됩니다.
        const response = await fetch(`${API_BASE}/statuses`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: message })
        });

        if (response.ok) {
            console.log("✅ 마스토돈 시스템 툿 게시 성공!");
        } else {
            const errorData = await response.json();
            console.error("❌ 마스토돈 에러:", errorData);
        }
    } catch (err) {
        console.error("🌐 서버 연결 실패:", err);
    }
}