// board.js

let currentPage = 1;
const postsPerPage = 10; 
let allPosts = []; // Firebase에서 가져온 전체 데이터를 담을 변수

// 1. 실시간 데이터 불러오기 (최초 1회 실행 및 데이터 변경 시 자동 호출)
database.ref('posts').on('value', (snapshot) => {
    const data = snapshot.val();
    
    // 데이터를 배열로 변환하고 최신순(역순)으로 정렬하여 저장
    allPosts = data ? Object.entries(data).map(([key, value]) => ({ 
        id: key, 
        ...value,
        comments: value.comments ? Object.entries(value.comments).map(([ckey, cvalue]) => ({ id: ckey, ...cvalue })) : []
    })).reverse() : [];
    
    renderPosts(); // 데이터가 오면 화면을 그립니다.
});

// 2. 게시글 추가 (Firebase 저장)
function addPost() {
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const anonymousNum = Math.floor(Math.random() * 900) + 100;
    const author = `익명${anonymousNum}`;

    if (!title || !content) return alert("내용을 입력하세요.");
    const password = prompt(`${author}님, 파기 비밀번호를 입력하세요:`);
    if (!password) return;

    database.ref('posts').push({
        author: author,
        title: title,
        content: content,
        password: password,
        date: new Date().toLocaleString()
    });

    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
}

// 3. 댓글 추가 (해당 게시글 하위에 저장)
function addComment(postId) {
    const commentInput = document.getElementById(`input-${postId}`);
    const commentText = commentInput.value;
    if (!commentText) return;

    const anonymousNum = Math.floor(Math.random() * 900) + 100;
    const author = `익명${anonymousNum}`;
    const password = prompt(`${author}님, 댓글 삭제용 비밀번호를 입력하세요:`);
    if (!password) return;

    database.ref(`posts/${postId}/comments`).push({
        author: author,
        text: commentText,
        password: password
    });

    commentInput.value = '';
}

// 4. 삭제 함수 (게시글 & 댓글 통합)
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

// 5. 화면 그리기 및 페이징 로직
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