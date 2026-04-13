import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
    getFirestore,
    collection,
    getDocs,
    query,
    orderBy,
    limit,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyDro-FXkPQkvCqZB_eGoPYyoIh-n21LhgA",
    authDomain: "new-typing.firebaseapp.com",
    projectId: "new-typing",
    storageBucket: "new-typing.firebasestorage.app",
    messagingSenderId: "977148105214",
    appId: "1:977148105214:web:eaf96516cc9e754aae30af",
    measurementId: "G-KZZNWWMEGN"
};
function createUserId() {
    return "user_" + Math.random().toString(36).substring(2, 10);
}
let userId = localStorage.getItem("userId");
console.log("取得したID： ", userId);
if (!userId) {
    userId = createUserId();
    localStorage.setItem("userId", userId);
    console.log("新規ユーザー： ", userId);
} else {
    console.log("既存ユーザー： ", userId);
}
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const startbtn = document.querySelector(".startbtn");
const rankingbtn = document.querySelector(".rankingbtn");
const settingscreen = document.querySelector(".setting-screen");
const settingbtn = document.querySelector(".setting-btn");
const settingscreenshadow = document.querySelector(".setting-screen-shadow");
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
settingbtn.onclick = function() {
    settingscreen.style.display = "flex";
    startbtn.style.display = "none";
    rankingbtn.style.display = "none";
    settingscreenshadow.style.display = "flex";
}
const closebtn = document.querySelector(".close-btn");
closebtn.onclick = function() {
    settingscreen.style.display = "none";
    startbtn.style.display = "flex";
    rankingbtn.style.display = "flex";
    settingscreenshadow.style.display = "none";
}
const nameinput = document.querySelector(".name-input");
const savebtn = document.querySelector(".save-btn");
let userName = localStorage.getItem("userName");
if (!userName) {
    userName = "noob";
}
nameinput.value = userName;
savebtn.onclick = function() {
    if (nameinput.value.trim() === "") {
        alert("名前を入力してください");
        return;
    }
    userName = nameinput.value;
    localStorage.setItem("userName", userName);
    settingscreen.style.display = "none";
    settingscreenshadow.style.display = "none";
    startbtn.style.display = "flex";
    rankingbtn.style.display = "flex";
}
let score = 0;
let combo = 0;
let timer = 40;
let timerInterval;
let keyHandler;
function resetgame() {
    score = 0;
    combo = 0;
    timer = 40;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = undefined;
    }
}
startbtn.onclick = function() {
    resetgame();
    startbtn.style.display = "none";
    rankingbtn.style.display = "none";
    const typingscreen = document.querySelector(".typing-screen");
    const typeword = document.querySelector(".type-word");
    const typeroma = document.querySelector(".type-roma");
    const displayscore = document.querySelector(".score");
    const displaycombo = document.querySelector(".combo");
    const displaytimer = document.querySelector(".timer");
    const resultscreen = document.querySelector(".result-screen");
    const finalscore = document.querySelector(".finalscore");
    const homebtn = document.querySelector(".home-btn");
    typingscreen.style.display = "flex";
    timerInterval = setInterval(() => {
        timer--;
        displaytimer.textContent = "残り時間： " + timer + "秒";
        if (timer <= 0) {
            clearInterval(timerInterval);
            showResult();
            startbtn.style.display = "none";
            rankingbtn.style.display = "none";
            resultscreen.style.display = "flex";
        }
    }, 1000);
    async function saveScore() {
        const ref = doc(db, "scores", today, "users", userId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
            const oldScore = snap.data().score;
            if (score > oldScore) {
                await setDoc(ref, {
                    userId: userId,
                    name: userName,
                    score: score,
                    updateAt: new Date()
                });
            }
        } else {
            await setDoc(ref, {
                userId: userId,
                name: userName,
                score: score,
                createdAt: new Date()
            });
        }
    }
    async function showResult() {
        document.removeEventListener("keydown", keyHandler);
        typingscreen.style.display = "none";
        finalscore.textContent = score;
        await saveScore();
        resultscreen.style.display = "flex";
    }
    homebtn.onclick = function() {
        resetgame();
        typingscreen.style.display = "none";
        resultscreen.style.display = "none";
        startbtn.style.display = "flex";
        rankingbtn.style.display = "flex";
        document.removeEventListener("keydown", keyHandler);
        timer = 40;
        score = 0;
        combo = 0;
        displaytimer.textContent = "残り時間： 40秒";
        displayscore.textContent = "スコア： 0";
        displaycombo.textContent = "コンボ： 0";
    }
    const wordlist = [
        { kana: "情報通信技術", roma: "jouhoutuusinngijutu" },
        { kana: "東京都庁舎", roma: "toukyoutotyousya" },
        { kana: "自動販売機", roma: "jidouhannbaiki" },
        { kana: "集団組織", roma: "syuudannsosiki" },
        { kana: "必要不可欠", roma: "hituyouhukaketu" },
        { kana: "雰囲気", roma: "hunniki"},
        { kana: "環境保護", roma: "kannkyouhogo" },
        { kana: "フィンセント・ファン・ゴッホ", roma: "finnsenntofanngohho" },
        { kana: "最大公約数", roma: "saidaikouyakusuu" },
        { kana: "最小公倍数", roma: "saisyoukoubaisuu" },
        { kana: "アルミニウム", roma: "aruminiumu" },
        { kana: "インフルエンザ", roma: "innhuruennza" },
        { kana: "新型コロナウイルス", roma: "sinngatakoronauirusu" },
        { kana: "光の屈折", roma: "hikarinokussetu" },
        { kana: "救急救命士", roma: "kyuukyuukyuumeisi" },
        { kana: "シチュエーション", roma: "sityue-syonn" },
        { kana: "地球温暖化", roma: "tikyuuonndannka" },
        { kana: "鬼にケツバット", roma: "oniniketubatto" },
        { kana: "洗濯科学のアリエーヌ", roma: "senntakukagakunoarie-nu" },
        { kana: "アソパソマソ", roma: "asopasomaso" },
        { kana: "バイキソマソ", roma: "baikisomaso" }
    ];
    let currentword = {};
    let currentindex = 0;
    setNewWord();
    function setNewWord() {
        currentword = wordlist[Math.floor(Math.random() * wordlist.length)];
        typeword.textContent = currentword.kana;
        typeroma.innerHTML = currentword.roma.split("").map(c => `<span>${c}</span>`).join("");
        currentindex = 0;
    }
    keyHandler = function(e) {
        const key = e.key.toLowerCase();
        if (key.length !== 1)return;
        if (key === currentword.roma[currentindex]) {
            const spans = typeroma.querySelectorAll("span");
            if (spans[currentindex]) {
                spans[currentindex].style.color = "rgb(16, 0, 123)";
            }
            currentindex++;
            combo++;
            const basescore = 100;
            let multiplier;
            multiplier = 1 + (combo * 1e+308);
            const thisscore = Math.floor(basescore * multiplier);
            score += thisscore;
            displayscore.textContent = `スコア： ${score}`;
            displaycombo.textContent = `コンボ： ${combo}`;
            if (currentindex >= currentword.roma.length) {
                setNewWord();
            }
        } else {
            combo = 0;
            displaycombo.textContent = `コンボ： ${combo}`;
        }
    };
    document.addEventListener("keydown", keyHandler);
};
const rankingscreen = document.querySelector(".ranking-screen");
const rankinglist = document.querySelector(".ranking-list");
const closebtn2 = document.querySelector(".close-btn2");
rankingbtn.onclick = async function() {
    rankingscreen.style.display = "flex";
    startbtn.style.display = "none";
    rankingbtn.style.display = "none";
    const q = query(
        collection(db, "scores", today, "users"),
        orderBy("score", "desc"),
        limit(10)
    );
    const snapshot = await getDocs(q);
    rankinglist.innerHTML = "";
    const list = [];
    const seen = new Set();
    snapshot.forEach(doc => {
        const data = doc.data();
        if (seen.has(data.userId)) return;
        seen.add(data.userId);
        list.push(data);
    });
    list.sort((a, b) => b.score - a.score);
    let rank = 0;
    let prevScore = undefined;
    let skip = 0;
    list.forEach((data, index) => {
        if (data.score !== prevScore) {
            rank = rank + skip + 1;
            skip = 0;
        } else {
            skip++;
        }
        let icon = "";
        if (rank === 1) {
            icon = "👑";
        } else if (rank === 2) {
            icon = "🥈";
        } else if (rank === 3) {
            icon = "🥉";
        } else if (rank >= 4 && rank <= 10) {
            icon = "🔹";
        }
        const li = document.createElement("li");
        li.textContent = `${icon} ${rank}位 ${data["name"]}： ${data["score"]}`;
        rankinglist.appendChild(li);
        prevScore = data.score;
    });
};
closebtn2.onclick = function() {
    rankingscreen.style.display = "none";
    startbtn.style.display = "flex";
    rankingbtn.style.display = "flex";
};
const countdown = document.querySelector(".countdown");
function updateCountdown() {
    const now = new Date();
    const next = new Date();
    next.setHours(24, 0, 0, 0);
    const diff = next - now;
    const hours = Math.floor(diff / 1000 / 60 / 60);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    countdown.textContent = `ランキング更新まで： ${hours}時間 ${minutes}分 ${seconds}秒`;
}
setInterval(updateCountdown, 1000);
updateCountdown();