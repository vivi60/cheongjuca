// script.js

// 1. 회원 명단 (비밀번호 관리)
const userDB = {
    "13reaking_news": { pw: "admin0303", nick: "NPC", role: "admin" }, // 관리자 계정
    "forsythia_cast":        { pw: "outbreak",      nick: "강나리",  role: "user" },
    "K_JH":        { pw: "outbreak",      nick: "강진혁",  role: "user" },
    "CHOA_cast":        { pw: "outbreak",      nick: "강초아",  role: "user" },
    "K_Hana_cast":        { pw: "outbreak",      nick: "강하나",  role: "user" },
    "K_Yohan_cast":        { pw: "outbreak",      nick: "고요한",  role: "user" },
    "MrBlueSky_cast":        { pw: "outbreak",      nick: "매튜 백",  role: "user" },
    "BackRam_cast":        { pw: "outbreak",      nick: "백람",  role: "user" },
    "JiJi_cast":        { pw: "outbreak",      nick: "범지태",  role: "user" },
    "JIN_cast":        { pw: "outbreak",      nick: "양희진",  role: "user" },
    "UJ_cast":        { pw: "outbreak",      nick: "유재이",  role: "user" },
    "H_gyeol55_cast":        { pw: "outbreak",      nick: "유한결",  role: "user" },
    "YT_cast":        { pw: "outbreak",      nick: "윤태",  role: "user" },
    "anchor_cast":        { pw: "outbreak",      nick: "이기조",  role: "user" },
    "Eunjeong_cast":        { pw: "outbreak",      nick: "이은정",  role: "user" },
    "2PU0_cast":        { pw: "outbreak",      nick: "이필우",  role: "user" },
    "SAE2ON_cast":        { pw: "outbreak",      nick: "임새언",  role: "user" },
    "SEA__FOREST_cast":        { pw: "outbreak",      nick: "임해신",  role: "user" },
    "dumpling_cast":        { pw: "outbreak",      nick: "장만우",  role: "user" },
    "HAECHAN":        { pw: "outbreak",      nick: "정해찬",  role: "user" },
    "BlueGreen_cast":        { pw: "outbreak",      nick: "청록",  role: "user" },
    "CDH_cast":        { pw: "outbreak",      nick: "최도화",  role: "user" },
    "sea_cast":        { pw: "outbreak",      nick: "한바다",  role: "user" },
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

// [업그레이드 + 테스트 모드] 마스토돈 봇 연동 함수
async function postToMastodon(message, imageUrl = null) {
    
    // ★★★ [중요] 테스트 모드 설정 ★★★
    // true = 테스트 모드 (F12 콘솔에만 출력, 마스토돈 전송 X)
    // false = 실전 모드 (실제 마스토돈으로 전송)
    const IS_TEST_MODE = false; 

    // --- 테스트 모드일 때 실행되는 부분 ---
    if (IS_TEST_MODE) {
        console.group("%c📢 [마스토돈 전송 테스트 (발송 차단됨)]", "color: orange; font-size: 14px; font-weight: bold;");
        console.log(`📄 내용: ${message}`);
        if (imageUrl) {
            console.log(`🖼 이미지: ${imageUrl}`);
            // 이미지가 있다면 콘솔에 미리보기 띄우기 (크롬 등에서 지원)
            console.log("%c ", `font-size: 1px; padding: 50px; background: url(${imageUrl}) no-repeat; background-size: contain;`);
        }
        console.log(">> 실제 서버로는 전송되지 않았습니다.");
        console.groupEnd();
        return; // 여기서 함수를 강제 종료해서 API 요청을 막습니다.
    }

    // --- 실전 모드일 때 실행되는 부분 (기존 코드) ---
    const API_BASE = "https://planet.moe/api/v1"; 
    const accessToken = "85ZTzpmUp0BRskvE9uOXZ_9NnjBOJSCbyGQ3pAXr0Ag"; 

    let statusText = message;
    if (imageUrl) {
        statusText += `\n\n(이미지: ${imageUrl})`;
    }

    try {
        const response = await fetch(`${API_BASE}/statuses`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                status: statusText,
                visibility: 'private' // 팔로워 전용
            })
        });

        if (response.ok) {
            console.log("✅ 마스토돈 봇 전송 성공!");
        } else {
            console.error("❌ 마스토돈 전송 실패");
        }
    } catch (err) {
        console.error("🌐 서버 연결 실패:", err);
    }

}
