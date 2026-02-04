// board.js

let currentPage = 1;
const postsPerPage = 10; 

let allPosts = [];       // DB에서 가져온 전체 원본 데이터
let displayedPosts = []; // 화면에 실제로 보여줄 데이터 (검색 필터링 적용됨)

// 1. 실시간 데이터 불러오기
database.ref('posts').on('value', (snapshot) => {
    const data = snapshot.val();
    
    // 전체 게시글 로드
    allPosts = data ? Object.entries(data).map(([key, value]) => ({ 
        id: key, 
        ...value,
        comments: value.comments ? Object.entries(value.comments).map(([ckey, cvalue]) => ({ id: ckey, ...cvalue })) : []
    })).reverse() : [];
    
    // [수정됨] 처음에는 전체 게시글을 보여줌
    displayedPosts = allPosts;
    
    renderPosts(); 
});

// [NEW] 1-2. 게시글 검색 함수 (HTML 검색창에서 호출됨)
function searchPosts(keyword) {
    if (!keyword.trim()) {
        // 검색어가 없으면 전체 게시글 표시
        displayedPosts = allPosts;
    } else {
        const lowerKey = keyword.toLowerCase();
        // 제목(title) 또는 내용(content)에 검색어가 포함된 것만 필터링
        displayedPosts = allPosts.filter(post => 
            (post.title && post.title.toLowerCase().includes(lowerKey)) || 
            (post.content && post.content.toLowerCase().includes(lowerKey))
        );
    }
    
    // 검색 후에는 1페이지로 초기화하고 다시 그리기
    currentPage = 1;
    renderPosts();
}

// 2. 게시글 추가
function addPost() {
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const myID = localStorage.getItem("loginID"); 
    
    const anonymousNum = Math.floor(Math.random() * 900) + 100;
    const authorDisplay = `익명${anonymousNum}`;

    if (!title || !content) return alert("내용을 입력하세요.");
    const password = prompt(`${authorDisplay}님, 파기 비밀번호를 입력하세요:`);
    if (!password) return;

    database.ref('posts').push({
        author: authorDisplay,
        authorID: myID,
        title: title,
        content: content,
        password: password,
        date: new Date().toLocaleString()
    });

    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
}

// 3. 댓글 추가
function addComment(postId) {
    const input = document.getElementById(`input-${postId}`);
    const text = input.value;
    if (!text) return alert("댓글 내용을 입력하세요.");

    const password = prompt("댓글 삭제 시 사용할 비밀번호를 입력하세요:");
    if (!password) return; 

    const randomNum = Math.floor(Math.random() * 900) + 100; 
    const anonymousNick = `익명${randomNum}`; 
    const myID = localStorage.getItem("loginID");
    const postRef = database.ref('posts/' + postId);
    
    postRef.once('value', snapshot => {
        const post = snapshot.val();
        
        const newCommentRef = postRef.child('comments').push();
        newCommentRef.set({
            author: anonymousNick,
            text: text,
            password: password, 
            timestamp: new Date().toISOString()
        });

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

// 5. 화면 그리기 및 페이징 (수정됨: displayedPosts 사용)
function renderPosts() {
    const postList = document.getElementById('postList');
    
    // [수정] displayedPosts(검색 결과)가 비어있으면 안내 메시지 표시
    if (displayedPosts.length === 0) {
        postList.innerHTML = '<div style="text-align:center; padding:40px; color:#666;">검색 결과가 없습니다.</div>';
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    // [수정] allPosts 대신 displayedPosts를 사용하여 페이징 계산
    const totalPages = Math.ceil(displayedPosts.length / postsPerPage);
    const startIndex = (currentPage - 1) * postsPerPage;
    const currentPosts = displayedPosts.slice(startIndex, startIndex + postsPerPage);

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

function sendNotification(targetId, message) {
    if(!targetId) return;
    database.ref('users/' + targetId + '/notifications').push({
        message: message,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        read: false
    });
}