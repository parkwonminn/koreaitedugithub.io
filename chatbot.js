// 챗봇 관련 DOM 요소 변수 선언
let chatbotToggler, closeBtn, chatbox, chatInput, sendChatBtn;
let userMessage = null; // 사용자 메시지를 저장하는 변수
const API_KEY = "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"; // OpenAI API 키
let inputInitHeight; // 텍스트 입력창의 초기 높이

// 채팅 메시지 리스트 아이템을 생성하는 함수
const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    // 나가는 메시지와 들어오는 메시지의 HTML 구조를 다르게 생성
    let chatContent = className === "outgoing" 
        ? `<p></p>` 
        : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

// OpenAI API를 호출하여 응답을 생성하는 함수
const generateResponse = (chatElement) => {
    const API_URL = "https://api.openai.com/v1/chat/completions";
    const messageElement = chatElement.querySelector("p");

    // API 요청 옵션 설정
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
                { 
                    role: "system", 
                    content: "당신은 코리아 IT 아카데미의 친절한 AI 상담사입니다. 교육 과정, 커리큘럼, 취업 지원 등에 대해 도움을 드립니다. 항상 한국어로 답변해주세요." 
                },
                { 
                    role: "user", 
                    content: userMessage 
                }
            ],
        })
    }

    // API 요청 전송 및 응답 처리
    fetch(API_URL, requestOptions)
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            if (data.choices && data.choices[0] && data.choices[0].message) {
                messageElement.textContent = data.choices[0].message.content.trim();
            } else {
                throw new Error("Invalid response format");
            }
        })
        .catch((error) => {
            console.error("Chatbot error:", error);
            messageElement.classList.add("error");
            messageElement.textContent = "죄송합니다. 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
        })
        .finally(() => {
            // 응답 후 채팅창을 맨 아래로 스크롤
            if (chatbox) {
                chatbox.scrollTo(0, chatbox.scrollHeight);
            }
        });
}

// 사용자 메시지를 처리하고 응답을 요청하는 함수
const handleChat = () => {
    if (!chatInput || !chatbox) return;
    
    userMessage = chatInput.value.trim(); // 사용자 입력 메시지 가져오기
    if (!userMessage) return; // 빈 메시지면 처리하지 않음

    // 입력창 초기화
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // 사용자 메시지를 채팅창에 추가
    chatbox.appendChild(createChatLi(userMessage, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    // AI 응답을 위한 "생각 중..." 메시지 표시
    setTimeout(() => {
        const incomingChatLi = createChatLi("생각 중...", "incoming");
        chatbox.appendChild(incomingChatLi);
        chatbox.scrollTo(0, chatbox.scrollHeight);
        generateResponse(incomingChatLi);
    }, 600);
}

// DOM이 로드된 후 챗봇 초기화
document.addEventListener("DOMContentLoaded", () => {
    // 필요한 DOM 요소 선택
    chatbotToggler = document.querySelector(".chatbot-toggler");
    closeBtn = document.querySelector(".close-btn");
    chatbox = document.querySelector(".chatbox");
    chatInput = document.querySelector(".chat-input textarea");
    sendChatBtn = document.querySelector("#send-btn") || document.querySelector(".chat-input span");

    // 필수 요소가 없으면 초기화 중단
    if (!chatInput || !chatbox) {
        console.error("Chatbot elements not found");
        return;
    }
    
    inputInitHeight = chatInput.scrollHeight;

    // 텍스트 입력창 높이 자동 조절
    chatInput.addEventListener("input", () => {
        chatInput.style.height = `${inputInitHeight}px`;
        chatInput.style.height = `${chatInput.scrollHeight}px`;
    });

    // Enter 키로 메시지 전송 (Shift+Enter는 줄바꿈)
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleChat();
        }
    });

    // 전송 버튼 클릭 이벤트
    if (sendChatBtn) {
        sendChatBtn.addEventListener("click", handleChat);
    }

    // 챗봇 닫기 버튼 이벤트
    if (closeBtn) {
        closeBtn.addEventListener("click", () => {
            document.body.classList.remove("show-chatbot");
        });
    }

    // 챗봇 토글 버튼 이벤트
    if (chatbotToggler) {
        chatbotToggler.addEventListener("click", () => {
            document.body.classList.toggle("show-chatbot");
        });
    }
});
