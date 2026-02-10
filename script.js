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
    const IS_TEST_MODE = false; // 테스트가 끝나면 false로 바꾸세요.

    if (IS_TEST_MODE) {
        console.group("%c📢 [마스토돈 전송 테스트]", "color: orange; font-weight: bold;");
        console.log(`📄 내용: ${message}`);
        if (imageUrl) console.log(`🖼 이미지: ${imageUrl}`);
        console.groupEnd();
        return;
    }

    const API_BASE = "https://planet.moe/api/v1"; 
    const accessToken = "Q-Vskbi7VdfLdBS-ctgkDjoJ0uIkR_C-xFhTxbGzdvI"; 

    try {
        let mediaId = null;

        // 1. 이미지가 있을 경우 마스토돈 서버에 먼저 업로드
        if (imageUrl) {
            try {
                // 이미지 URL에서 파일 데이터를 가져옴
                const imageRes = await fetch(imageUrl);
                const blob = await imageRes.blob();
                
                // 마스토돈 미디어 업로드용 폼 데이터 생성
                const formData = new FormData();
                formData.append('file', blob, 'image.png');

                const mediaRes = await fetch(`${API_BASE}/media`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${accessToken}` },
                    body: formData
                });

                if (mediaRes.ok) {
                    const mediaData = await mediaRes.json();
                    mediaId = mediaData.id; // 업로드된 이미지의 ID 획득
                    console.log("🖼 미디어 업로드 성공 ID:", mediaId);
                }
            } catch (mediaErr) {
                console.error("🖼 미디어 업로드 중 오류:", mediaErr);
                
            }
        }

        // 2. 게시글 전송 (미디어 ID가 있으면 사진 게시물로 올라감)
        const payload = { 
            status: message,
            visibility: 'private' 
        };

        if (mediaId) {
            payload.media_ids = [mediaId]; // 사진 ID 첨부
        }

        const response = await fetch(`${API_BASE}/statuses`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            console.log("✅ 마스토돈 사진 게시글 전송 성공!");
        } else {
            console.error("❌ 게시글 전송 실패");
        }
    } catch (err) {
        console.error("🌐 서버 연결 실패:", err);
    }
}