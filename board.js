// board.js

// board.js 상단에 현재 페이지 변수 추가
let currentPage = 1;
const postsPerPage = 10; // 한 페이지에 보여줄 게시글 수

document.addEventListener("DOMContentLoaded", loadPosts);

// 1. 게시글 추가 (익명 번호 및 비밀번호 포함)
function addPost() {
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    
    // 100~999 사이의 랜덤 숫자 생성
    const anonymousNum = Math.floor(Math.random() * 900) + 100;
    const author = `익명${anonymousNum}`;

    const password = prompt(`${author}님, 파기 비밀번호를 입력하세요:`);

    if (!title || !content) {
        alert("내용을 입력해 주세요.");
        return;
    }
    if (!password) {
        alert("비밀번호가 있어야 기록을 남길 수 있습니다.");
        return;
    }

    const posts = JSON.parse(localStorage.getItem('outbreakPosts') || '[]');
    const newPost = {
        id: Date.now(),
        author: author,
        title: title,
        content: content,
        password: password,
        date: new Date().toLocaleString(),
        comments: []
    };

    posts.unshift(newPost);
    localStorage.setItem('outbreakPosts', JSON.stringify(posts));
    
    document.getElementById('postTitle').value = '';
    document.getElementById('postContent').value = '';
    loadPosts();
}

// 2. 게시글 삭제 (관리자 프리패스 추가)
function deletePost(postId) {
    const loginStatus = localStorage.getItem("loginStatus"); // 현재 로그인 상태 확인
    const posts = JSON.parse(localStorage.getItem('outbreakPosts') || '[]');
    const targetPost = posts.find(p => p.id === postId);

    // 관리자라면 바로 삭제, 일반 유저라면 비밀번호 확인
    if (loginStatus === "admin") {
        if (confirm("관리자 권한으로 이 기록을 즉시 파기하시겠습니까?")) {
            const updatedPosts = posts.filter(p => p.id !== postId);
            localStorage.setItem('outbreakPosts', JSON.stringify(updatedPosts));
            loadPosts();
        }
    } else {
        const inputPw = prompt("파기 비밀번호를 입력하세요:");
        if (inputPw === targetPost.password) {
            const updatedPosts = posts.filter(p => p.id !== postId);
            localStorage.setItem('outbreakPosts', JSON.stringify(updatedPosts));
            alert("기록이 파기되었습니다.");
            loadPosts();
        } else {
            alert("비밀번호가 틀렸습니다.");
        }
    }
}

// 3. 댓글 추가 (익명 번호 및 비밀번호 포함)
function addComment(postId) {
    const commentInput = document.getElementById(`input-${postId}`);
    const commentText = commentInput.value;

    if (!commentText) return;

    // 댓글용 랜덤 익명 번호 생성
    const anonymousNum = Math.floor(Math.random() * 900) + 100;
    const author = `익명${anonymousNum}`;

    const password = prompt(`${author}님, 댓글 삭제용 비밀번호를 입력하세요:`);

    if (!password) {
        alert("비밀번호가 필요합니다.");
        return;
    }

    let posts = JSON.parse(localStorage.getItem('outbreakPosts'));
    posts = posts.map(post => {
        if (post.id === postId) {
            post.comments.push({
                id: Date.now(),
                author: author, // 댓글 작성자 익명 번호 저장
                text: commentText,
                password: password
            });
        }
        return post;
    });

    localStorage.setItem('outbreakPosts', JSON.stringify(posts));
    commentInput.value = ''; // 입력창 비우기
    loadPosts();
}

// 4. 댓글 삭제 (관리자 프리패스 추가)
function deleteComment(postId, commentId) {
    const loginStatus = localStorage.getItem("loginStatus");
    let posts = JSON.parse(localStorage.getItem('outbreakPosts'));
    
    if (loginStatus === "admin") {
        if (confirm("관리자 권한으로 이 댓글을 삭제하시겠습니까?")) {
            posts = posts.map(post => {
                if (post.id === postId) {
                    post.comments = post.comments.filter(c => c.id !== commentId);
                }
                return post;
            });
            localStorage.setItem('outbreakPosts', JSON.stringify(posts));
            loadPosts();
        }
    } else {
        // 기존 비밀번호 확인 로직 동일...
        let targetComment;
        posts.forEach(post => { if (post.id === postId) targetComment = post.comments.find(c => c.id === commentId); });
        const inputPw = prompt("댓글 비밀번호를 입력하세요:");
        if (inputPw === targetComment.password) {
            posts = posts.map(post => {
                if (post.id === postId) post.comments = post.comments.filter(c => c.id !== commentId);
                return post;
            });
            localStorage.setItem('outbreakPosts', JSON.stringify(posts));
            loadPosts();
        } else {
            alert("비밀번호가 틀렸습니다.");
        }
    }
}

// 5. 화면 그리기 (페이징 기능 포함)
function loadPosts() {
    const postList = document.getElementById('postList');
    const posts = JSON.parse(localStorage.getItem('outbreakPosts') || '[]');
    
    // 페이징 계산
    const totalPosts = posts.length;
    const totalPages = Math.ceil(totalPosts / postsPerPage);
    
    // 현재 페이지에 해당하는 글만 추출
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const currentPosts = posts.slice(startIndex, endIndex);

    // 게시글 출력
    postList.innerHTML = currentPosts.map(post => `
        <div class="post-item">
            <div class="post-header">
                <span style="color: #ab0000; font-weight: bold;">[${post.author || '익명'}]</span>
                <span>${post.title}</span>
                <button onclick="deletePost(${post.id})" class="btn-delete">삭제</button>
            </div>
            <div style="color: #666; font-size: 0.8em; margin: 5px 0 10px 0;">${post.date}</div>
            <div class="post-content">${post.content}</div>
            
            <div class="comment-section">
                ${post.comments.map(c => `
                    <div class="comment-item">
                        <span style="color: #ab0000; font-size: 0.8em; margin-right: 5px; font-weight: bold;">[${c.author || '익명'}]</span>
                        ${c.text}
                        <span class="del-comment" onclick="deleteComment(${post.id}, ${c.id})" title="삭제">x</span>
                    </div>
                `).join('')}
                <div style="margin-top:10px; display: flex; gap: 5px;">
                    <input type="text" id="input-${post.id}" placeholder="댓글 입력..." style="flex: 1; background:#111; border:1px solid #444; color:white; padding:5px; border-radius:3px;">
                    <button onclick="addComment(${post.id})" style="background:#444; color:white; border:none; padding:5px 10px; cursor:pointer; border-radius:3px;">등록</button>
                </div>
            </div>
        </div>
    `).join('');

    // 페이지 번호 버튼 출력
    renderPagination(totalPages);
}

// 6. 페이지 버튼 생성 함수
function renderPagination(totalPages) {
    const paginationArea = document.getElementById('pagination');
    if (!paginationArea) return;

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button onclick="goToPage(${i})" class="page-btn ${i === currentPage ? 'active' : ''}">${i}</button>`;
    }
    paginationArea.innerHTML = html;
}

// 7. 페이지 이동 함수
function goToPage(page) {
    currentPage = page;
    loadPosts();
    window.scrollTo(0, 0); // 페이지 이동 시 맨 위로 스크롤
}