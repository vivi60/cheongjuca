// board.js

let currentPage = 1;
const postsPerPage = 10; 
let allPosts = []; 

// 1. 실시간 데이터 불러오기
database.ref('posts').on('value', (snapshot) => {
    const data = snapshot.val();
    
    allPosts = data ? Object.entries(data).map(([key, value]) => ({ 
        id: key, 
        ...value,
        comments: value.comments ? Object.entries(value.comments).map(([ckey, cvalue]) => ({ id: ckey, ...cvalue })) : []
    })).reverse() : [];
    
    renderPosts(); 
});

// 2. 게시글 추가 (수정됨: authorID 저장 추가)
function addPost() {
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    
    // [중요] 현재 로그인한 사용자의 실제 ID 가져오기
    const myID = localStorage.getItem("loginID"); 
    
    // 화면에 보여줄 익명 닉네임 생성
    const anonymousNum = Math.floor(Math.random() * 900) + 100;
    const authorDisplay = `익명${anonymousNum}`;

    if (!title || !content) return alert("내용을 입력하세요.");
    const password = prompt(`${authorDisplay}님, 파기 비밀번호를 입력하세요:`);
    if (!password) return;

    database.ref('posts').push({
        author: authorDisplay, // 화면 표시용 (익명)
        authorID: myID,        // ★ [핵심] 알림 발송용 실제 ID (DB에만 저장됨)
        title: title,
        content: content,
        password: password,
        date: new Date().toLocaleString()
    });

    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
}

// 댓글 추가 함수 (익명 버전)
// 댓글 추가 함수 (수정됨: 비밀번호 입력 추가)
function addComment(postId) {
    const input = document.getElementById(`input-${postId}`);
    const text = input.value;
    if (!text) return alert("댓글 내용을 입력하세요.");

    // [추가됨] 비밀번호 입력 받기
    const password = prompt("댓글 삭제 시 사용할 비밀번호를 입력하세요:");
    if (!password) return; // 취소 누르면 중단

    // 닉네임 대신 랜덤 익명 이름 생성
    const randomNum = Math.floor(Math.random() * 900) + 100; 
    const anonymousNick = `익명${randomNum}`; 

    const myID = localStorage.getItem("loginID");

    const postRef = database.ref('posts/' + postId);
    
    postRef.once('value', snapshot => {
        const post = snapshot.val();
        
        // 댓글 저장
        const newCommentRef = postRef.child('comments').push();
        newCommentRef.set({
            author: anonymousNick,
            text: text,
            password: password, // ★ 비밀번호 저장
            timestamp: new Date().toISOString()
        });

        // 알림 메시지 발송
        if (post.authorID && post.authorID !== myID) {
            let shortTitle = post.title;
            if (shortTitle.length > 10) shortTitle = shortTitle.substring(0, 10) + "...";

            let shortComment = text;
            if (shortComment.length > 15) shortComment = shortComment.substring(0, 15) + "...";

            const message = `💬 [게시판] 내 '${shortTitle}' 게시물에 ${anonymousNick}님이 댓글을 남겼습니다: "${shortComment}"`;
            
            sendNotification(post.authorID, message);
        }
    });

    input.value = '';
}

// 4. 삭제 함수
function deletePost(postId) {
    const loginStatus = localStorage.getItem("loginStatus");
    database.ref(`posts/${postId}`).once('value', (snapshot) => {
        const post = snapshot.val();
        if (loginStatus === "admin" || prompt("게시글 파기 비밀번호:") === post.password) {
            database.ref(`posts/${postId}`).remove();
            alert("파기되었습니다.");
        } else { alert("권한이 없습니다."); }
    });
}

function deleteComment(postId, commentId) {
    const loginStatus = localStorage.getItem("loginStatus");
    database.ref(`posts/${postId}/comments/${commentId}`).once('value', (snapshot) => {
        const comment = snapshot.val();
        if (loginStatus === "admin" || prompt("댓글 삭제 비밀번호:") === comment.password) {
            database.ref(`posts/${postId}/comments/${commentId}`).remove();
            alert("댓글이 삭제되었습니다.");
        } else { alert("비밀번호가 틀렸습니다."); }
    });
}

// 5. 화면 그리기 및 페이징
function renderPosts() {
    const postList = document.getElementById('postList');
    const totalPages = Math.ceil(allPosts.length / postsPerPage);
    
    const startIndex = (currentPage - 1) * postsPerPage;
    const currentPosts = allPosts.slice(startIndex, startIndex + postsPerPage);

    postList.innerHTML = currentPosts.map(post => `
        <div class="post-item">
            <div class="post-header">
                <span style="color: #ab0000; font-weight: bold;">[${post.author}]</span>
                <span>${post.title}</span>
                <button onclick="deletePost('${post.id}')" class="btn-delete">삭제</button>
            </div>
            <div style="color: #666; font-size: 0.8em; margin: 5px 0 10px 0;">${post.date}</div>
            <div class="post-content">${post.content}</div>
            
            <div class="comment-section">
                ${post.comments ? post.comments.map(c => `
                    <div class="comment-item">
                        <span style="color: #ab0000; font-size: 0.8em; margin-right: 5px; font-weight: bold;">[${c.author}]</span>
                        ${c.text}
                        <span class="del-comment" onclick="deleteComment('${post.id}', '${c.id}')">x</span>
                    </div>
                `).join('') : ''}
                <div style="margin-top:10px; display: flex; gap: 5px;">
                    <input type="text" id="input-${post.id}" placeholder="댓글 입력..." style="flex: 1; background:#111; border:1px solid #444; color:white; padding:5px; border-radius:3px;">
                    <button onclick="addComment('${post.id}')" style="background:#444; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:3px;">등록</button>
                </div>
            </div>
        </div>
    `).join('');

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const paginationArea = document.getElementById('pagination');
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button onclick="goToPage(${i})" class="page-btn ${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
    paginationArea.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    renderPosts();
    window.scrollTo(0, 0);
}

// 알림 보내기 함수 (필수)
function sendNotification(targetId, message) {
    if(!targetId) return; // 타겟 ID가 없으면 중단
    
    database.ref('users/' + targetId + '/notifications').push({
        message: message,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        read: false
    });
}