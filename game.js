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
if (!userId) {
    userId = createUserId();
    localStorage.setItem("userId", userId);
}
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
window.onload = () => {
    loadUserData();
};
const skillList = document.querySelector(".skill-list");
async function loadUserData() {
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
        const data = snap.data();
        money = data.money || 0;
        userSkills = data.skills || {};
        equippedSkill = data.equippedSkill || undefined;
    } else {
        money = 0;
        userSkills = {};
        equippedSkill = null
    }
    updateMoney();
    renderSkills();
}
function getMoneyMultiplier() {
    switch (equippedSkill) {
        case "appMoney1": return 1.1;
        case "appMoney2": return 1.5;
        case "appMoney3": return 2;
        case "appMoney4": return 2.5;
        case "appMoney5": return 10;
        default: return 1;
    }
}
const startbtn = document.querySelector(".startbtn");
const rankingbtn = document.querySelector(".rankingbtn");
const skillshopbtn = document.querySelector(".skill-shop-btn");
const settingscreen = document.querySelector(".setting-screen");
const settingbtn = document.querySelector(".setting-btn");
const settingscreenshadow = document.querySelector(".setting-screen-shadow");
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
settingbtn.onclick = function() {
    settingscreen.style.display = "flex";
    settingscreenshadow.style.display = "flex";
    startbtn.style.display = "none";
    rankingbtn.style.display = "none";
    skillshopbtn.style.display = "none";
}
const closebtn = document.querySelector(".close-btn");
closebtn.onclick = function() {
    const name = nameinput.value.trim();
    if (name === "") {
        alert("名前を入力してください");
        return;
    } else {
        settingscreen.style.display = "none";
        settingscreenshadow.style.display = "none";
        startbtn.style.display = "flex";
        rankingbtn.style.display = "flex";
        skillshopbtn.style.display = "flex";
    }
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
    const newName = nameinput.value.trim();
    const oldName = localStorage.getItem("userName");
    if (newName === oldName) {
        settingscreen.style.display = "none";
        settingscreenshadow.style.display = "none";
        startbtn.style.display = "flex";
        rankingbtn.style.display = "flex";
        skillshopbtn.style.display = "flex";
    } else {
        userName = newName;
        alert("名前を保存しました");
        localStorage.setItem("userName", userName);
        settingscreen.style.display = "none";
        settingscreenshadow.style.display = "none";
        startbtn.style.display = "flex";
        rankingbtn.style.display = "flex";
        skillshopbtn.style.display = "flex";
    }
};
let money = 0;
function updateMoney() {
    document.querySelectorAll(".money").forEach(el => {
        el.textContent = money;
    });
    const moneyshadow = document.querySelector(".money-shadow");
    const moneydisplay = document.querySelector(".money-display");
    moneyshadow.style.width = moneydisplay.offsetWidth + "px";
}
let userSkills = {};
let equippedSkill = null
let autoSkillActive = false;
let autoSkillCooldown = false;
let autoSkillCooldownTimer = undefined;
let autoSkillDurationTimer = undefined;
let autoTypeInterval = undefined;
let score = 0;
let combo = 0;
let timer = 40;
let currentword = {};
let currentindex = 0;
let typeroma;
let displayscore;
let displaycombo;
let displaytimer;
let autoSkillRemain = 0;
let autoSkillCooldownRemain = 0;
let autoSkillDisplayTimer = undefined;
let resultShown = false;
let gameRunning = false;
let comboSaveUsed = false;
let timerInterval = undefined;
let keyHandler = undefined;
const autoSkillbtn = document.querySelector(".auto-skill-btn");
const autoSkillnameEl = document.querySelector(".auto-skill-name");
const autoSkilltimeEl = document.querySelector(".auto-skill-time");
autoSkillbtn.addEventListener("pointerdown", () => {
    startAutoTypeSkill();
});
function updateAutoSkillDisplay() {
    if (!isAutoTypeSkill()) {
        autoSkillnameEl.textContent = "";
        autoSkilltimeEl.textContent = "";
        autoSkillbtn.style.display = "none";
        return;
    }
    autoSkillbtn.style.display = "flex";
    const skill = skills.find(s => s.id === equippedSkill);
    if (!skill) return;
    if (autoSkillActive) {
        autoSkillnameEl.textContent = skill.name;
        autoSkilltimeEl.textContent = `終了まで${Math.ceil(autoSkillRemain / 1000)}s`;
    } else if (autoSkillCooldown) {
        autoSkillnameEl.textContent = skill.name;
        autoSkilltimeEl.textContent = `再度使えるまで${Math.ceil(autoSkillCooldownRemain / 1000)}s`;
    } else {
        autoSkillnameEl.textContent = skill.name;
        autoSkilltimeEl.textContent = "";
    }
}
function stopGame() {
    gameRunning = false;
    stopAutoTypeSkill();
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = undefined;
    }
    if (keyHandler) {
        document.removeEventListener("keydown", keyHandler);
        keyHandler = undefined;
    }
}
function resetgame() {
    score = 0;
    combo = 0;
    timer = 40;
    comboSaveUsed = false;
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = undefined;
    }
}
function isAutoTypeSkill() {
    return [
        "autoType1",
        "autoType2",
        "autoType3",
        "autoType4",
        "autoType5",
        "autoType6",
        "autoType7"
    ].includes(equippedSkill);
};
function getAutoTypeSkillData() {
    switch (equippedSkill) {
        case "autoType1":
            return {
                duration: 3000,
                interval: 90,
                cooldown: 45000
            };
        case "autoType2":
            return {
                duration: 5000,
                interval: 90,
                cooldown: 45000
            };
        case "autoType3":
            return {
                duration: 5000,
                interval: 90,
                cooldown: 40000
            };
        case "autoType4":
            return {
                duration: 6000,
                interval: 75,
                cooldown: 35000
            };
        case "autoType5":
            return {
                duration: 7000,
                interval: 70,
                cooldown: 30000
            };
        case "autoType6":
            return {
                duration: 8000,
                interval: 55,
                cooldown: 20000
            };
        case "autoType7":
            return {
                duration: 1000000,
                interval: 0,
                cooldown: 0
            };
        default:
            return null;
    }
}
function startAutoTypeSkill() {
    const data = getAutoTypeSkillData();
    if (!data) return;
    if (autoSkillActive) return;
    if (autoSkillCooldown) return;
    if (!gameRunning) return;
    autoSkillActive = true;
    autoSkillCooldown = true;
    autoSkillRemain = data.duration;
    autoSkillCooldownRemain = data.cooldown;
    updateAutoSkillDisplay();
    if (autoSkillDisplayTimer) {
        clearInterval(autoSkillDisplayTimer);
    }
    autoSkillDisplayTimer = setInterval(() => {
        if (autoSkillActive) {
            autoSkillRemain -= 100;
            if (autoSkillRemain <= 0) {
                autoSkillRemain = 0;
                autoSkillActive = false;
            }
        }
        if (autoSkillCooldown) {
            autoSkillCooldownRemain -= 100;
            if (autoSkillCooldownRemain <= 0) {
                autoSkillCooldownRemain = 0;
                autoSkillCooldown = false;
            }
        }
        updateAutoSkillDisplay();
        if (!autoSkillActive && !autoSkillCooldown) {
            clearInterval(autoSkillDisplayTimer);
            autoSkillDisplayTimer = undefined;
            updateAutoSkillDisplay();
        }
    }, 100);
    if (autoTypeInterval) {
        clearInterval(autoTypeInterval);
        autoTypeInterval = undefined;
    }
    autoTypeInterval = setInterval(() => {
        if (!gameRunning) {
            stopAutoTypeSkill();
            return;
        }
        if (!currentword.roma) return;
        const nextChar = currentword.roma[currentindex];
        if (!nextChar) return;
        const event = new KeyboardEvent("keydown", {
            key: nextChar,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
        if (currentindex >= currentword.roma.length) {
            setNewWord();
            return;
        }
    }, data.interval);
    autoSkillDurationTimer = setTimeout(() => {
        if (autoTypeInterval) {
            clearInterval(autoTypeInterval);
            autoTypeInterval = undefined;
        }
        autoSkillActive = false;
    }, data.duration);
    autoSkillCooldownTimer = setTimeout(() => {
        autoSkillCooldown = false;
    }, data.cooldown);
}
function stopAutoTypeSkill() {
    autoSkillActive = false;
    autoSkillCooldown = false;
    autoSkillRemain = 0;
    autoSkillCooldownRemain = 0;
    if (autoTypeInterval) {
        clearInterval(autoTypeInterval);
        autoTypeInterval = undefined;
    }
    if (autoSkillDurationTimer) {
        clearTimeout(autoSkillDurationTimer);
        autoSkillDurationTimer = undefined;
    }
    if (autoSkillCooldownTimer) {
        clearTimeout(autoSkillCooldownTimer);
        autoSkillCooldownTimer = undefined;
    }
    if (autoSkillDisplayTimer) {
        clearInterval(autoSkillDisplayTimer);
        autoSkillDisplayTimer = undefined;
    }
    updateAutoSkillDisplay();
}
const skills = [
    {
        id: "appMoney1",
        name: "金運アップLv.1",
        desc: "獲得金額が1.1倍になる",
        price: 50000
    },
    {
        id: "appMoney2",
        name: "金運アップLv.2",
        desc: "獲得金額が1.5倍になる",
        price: 100000
    },
    {
        id: "appMoney3",
        name: "金運アップLv.3",
        desc: "獲得金額が2倍になる",
        price: 300000
    },
    {
        id: "appMoney4",
        name: "金運アップLv.4",
        desc: "獲得金額が2.5倍になる",
        price: 650000
    },
    {
        id: "appMoney5",
        name: "金運アップLv.5",
        desc: "獲得金額が10倍になる",
        price: 10000000
    },
    {
        id: "comboSave",
        name: "ほけんの窓口",
        desc: "1度だけミスをしてもコンボが途切れない",
        price: 700000
    },
    {
        id: "autoType1",
        name: "自動入力(無印)",
        desc: "スペースキーで発動　3秒間 0.09秒間隔で自動入力する CT:45秒",
        price: 100000
    },
    {
        id: "autoType2",
        name: "自動入力＋",
        desc: "スペースキーで発動　5秒間 0.09秒間隔で自動入力する CT:45秒",
        price: 350000
    },
    {
        id: "autoType3",
        name: "自動入力ζ",
        desc: "スペースキーで発動　5秒間 0.09秒間隔で自動入力する CT:40秒",
        price: 450000
    },
    {
        id: "autoType4",
        name: "自動入力θ",
        desc: "スペースキーで発動　6秒間 0.075秒間隔で自動入力する CT:35秒",
        price: 700000
    },
    {
        id: "autoType5",
        name: "自動入力λ",
        desc: "スペースキーで発動　7秒間 0.07秒間隔で自動入力する CT:30秒",
        price: 1000000
    },
    {
        id: "autoType6",
        name: "自動入力ψ",
        desc: "スペースキーで発動　8秒間 0.055秒間隔で自動入力する CT:20秒",
        price: 10000000
    },
    {
        id: "autoType7",
        name: "自動入力χ",
        desc: "スペースキーで発動　1000秒間 0秒間隔で自動入力する CT:0秒",
        price: 0
    }
];
function hasComboSaveSkill() {
    return equippedSkill === "comboSave";
}
function renderSkills() {
    skillList.innerHTML = "";
    skills.forEach(skill => {
        if (skill.id === "autoType7" && !userSkills["autoType7"]) {
            return;
        }
        let btnText = "";
        let btnClass = "";
        if (!userSkills[skill.id]) {
            btnText = "購入する";
            btnClass = "buy";
        } else if (equippedSkill === skill.id) {
            btnText = "装備中";
            btnClass = "equipped";
        } else {
            btnText = "装備";
            btnClass = "equip";
        }
        const div = document.createElement("div");
        div.className = "skill-item";
        div.innerHTML = `
        <div class="skill-left">
                <div class="skill-text">
                <div class="skill-name">${skill.name}</div>
                <div class="skill-desc">${skill.desc}</div>
                <div class="skill-price">${skill.price}円</div>
                </div>
                </div>
                <button class="buy-btn ${btnClass}" data-id="${skill.id}">${btnText}</button>
                `;
                skillList.appendChild(div);
            });
        }
        async function saveMoney() {
            const ref = doc(db, "users", userId);
            const snap = await getDoc(ref);
            if (snap.exists()) {
                await setDoc(ref, {
                    userId: userId,
                    name: userName,
                    money: money,
                    skills: userSkills,
                    equippedSkill: equippedSkill,
                    updateAt: new Date()
                });
            } else {
                await setDoc(ref, {
                    userId: userId,
                    name: userName,
                    money: money,
                    skills: userSkills,
                    equippedSkill: equippedSkill,
                    createdAt: new Date()
                });
            }
        }
        const homebtn = document.querySelector(".home-btn");
        homebtn.onclick = function() {
            stopGame();
            resetgame();
            const typingscreen = document.querySelector(".typing-screen");
            const resultscreen = document.querySelector(".result-screen");
            typingscreen.style.display = "none";
            resultscreen.style.display = "none";
    startbtn.style.display = "flex";
    rankingbtn.style.display = "flex";
    skillshopbtn.style.display = "flex";
    timer = 40;
    score = 0;
    combo = 0;
    displaytimer.textContent = "残り時間： 40秒";
    displayscore.textContent = "スコア： 0";
    displaycombo.textContent = "コンボ： 0";
}
skillList.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("buy-btn")) return;
    const id = e.target.dataset.id;
    const skill = skills.find(s => s.id === id);
    
    // 未購入なら購入
    if (!userSkills[id]) {
        if (money < skill.price) {
            alert("お金が足りません！！");
            return;
        }
        
        alert(skill.name + "を購入した！！");
        money -= skill.price;
        userSkills[id] = true;
        await saveMoney();
    }

    // すでに装備中なら何もしない
    if (equippedSkill === id) return;

    // ★ここで前の装備は自動で“外れた扱い”になる
    equippedSkill = id;

    updateMoney();

    await setDoc(doc(db, "users", userId), {
        userId,
        name: userName,
        money,
        skills: userSkills,
        equippedSkill
    });

    renderSkills();
});
const shopscreen = document.querySelector(".skill-shop-screen");
const shopclose = document.querySelector(".shop-close");
skillshopbtn.onclick = function() {
    shopscreen.style.display = "flex";
    startbtn.style.display = "none";
    rankingbtn.style.display = "none";
    skillshopbtn.style.display = "none";
    renderSkills();
    updateMoney();
};
const skillremovebtn = document.querySelector(".skill-remove-btn");
skillremovebtn.onclick = async function () {
    if (!equippedSkill) {
        alert("装備中のスキルがありません！");
        return;
    }
    alert("スキルを外しました！");
    equippedSkill = null;
    const ref = doc(db, "users", userId);
    await setDoc(ref, {
        userId: userId,
        name: userName,
        money: money,
        skills: userSkills,
        equippedSkill
    });
    renderSkills();
    updateMoney();
};
shopclose.onclick = function() {
        shopscreen.style.display = "none";
        startbtn.style.display = "flex";
        rankingbtn.style.display = "flex";
        skillshopbtn.style.display = "flex";
    };
const keys = {};
document.addEventListener("keydown", async (e) => {
    keys[e.key.toLowerCase()] = true;
    if (keys["shift"] && keys["s"] && keys["p"]) {
        const input = prompt("Please enter the cheat pass");
        if (input === null) {
            keys["shift"] = false;
            keys["s"] = false;
            keys["p"] = false;
            return;
        }
        if (input === "AFχ") {
            if (userSkills["autoType7"]) {
                alert("入手済みです！");
                keys["shift"] = false;
                keys["s"] = false;
                keys["p"] = false;
                return;
            }
            alert("自動入力χをゲットした！！");
            userSkills["autoType7"] = true;
            equippedSkill = "autoType7";
            await setDoc(doc(db, "users", userId), {
                userId: userId,
                name: userName,
                money: money,
                skills: userSkills,
                equippedSkill: equippedSkill
            });
            if (!skills.find(s => s.id === "autoType7")) {
                skills.push({
                    id: "autoType7",
                    name: "自動入力χ",
                    desc: "1000秒間 0秒間隔で自動入力する CT:0秒",
                    price: 0
                });
            }
            renderSkills();
            keys["shift"] = false;
            keys["s"] = false;
            keys["p"] = false;
        } else {
            alert("path not found");
            keys["shift"] = false;
            keys["s"] = false;
            keys["p"] = false;
        }
    }
});
document.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});
startbtn.onclick = function() {
    stopGame();
    resultShown = false;
    gameRunning = true;
    resetgame();
    startbtn.style.display = "none";
    rankingbtn.style.display = "none";
    skillshopbtn.style.display = "none";
    const typingscreen = document.querySelector(".typing-screen");
    const typeword = document.querySelector(".type-word");
    typeroma = document.querySelector(".type-roma");
    displayscore = document.querySelector(".score");
    displaycombo = document.querySelector(".combo");
    displaytimer = document.querySelector(".timer");
    const resultscreen = document.querySelector(".result-screen");
    const finalscore = document.querySelector(".finalscore");
    typingscreen.style.display = "flex";
    timerInterval = setInterval(() => {
        if (!gameRunning) return;
        timer--;
        displaytimer.textContent = "残り時間： " + timer + "秒";
        if (timer <= 0) {
            clearInterval(timerInterval);
            timerInterval = undefined;
            if (gameRunning) showResult();
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
        if (resultShown) return;
        resultShown = true;
        gameRunning = false;
        document.removeEventListener("keydown", keyHandler);
        typingscreen.style.display = "none";
        finalscore.textContent = score;
        const baseEarned = score
        const multiplier = getMoneyMultiplier();
        const earned = Math.floor(baseEarned * multiplier + combo);
        money += earned;
        updateMoney();
        resultscreen.style.display = "flex";
        await saveMoney();
        await saveScore();
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
    setNewWord();
    function setNewWord() {
        const typeword = document.querySelector(".type-word");
        const typeromaEl = document.querySelector(".type-roma");
        if (!typeword || !typeromaEl) {
            return;
        }

        currentword = wordlist[Math.floor(Math.random() * wordlist.length)];

        typeword.textContent = currentword.kana;

        typeromaEl.innerHTML = currentword.roma
            .split("")
            .map(c => `<span>${c}</span>`)
            .join("");

        typeroma = typeromaEl; // ←これ重要（グローバル更新）

        currentindex = 0;
    }
    keyHandler = function(e) {
        if (!gameRunning) return;
        if (e.code === "Space") {
            e.preventDefault();
            startAutoTypeSkill();
            return;
        }
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
            multiplier = 1 + (combo * 0.15);
            const thisscore = Math.floor(basescore * multiplier);
            score += thisscore;
            displayscore.textContent = `スコア： ${score}`;
            displaycombo.textContent = `コンボ： ${combo}`;
            if (currentindex >= currentword.roma.length) {
                setNewWord();
                return;
            }
        } else {
            if (hasComboSaveSkill() && !comboSaveUsed && combo > 0) {
                comboSaveUsed = true;
                displaycombo.textContent = `コンボ： ${combo}`;
            } else {
                combo = 0;
                displaycombo.textContent = `コンボ： ${combo}`;
            }
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
    skillshopbtn.style.display = "none";
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
    let rank = 0;
    let prevScore = undefined;
    list.forEach((data, index) => {
        if (data.score !== prevScore) {
            rank = index + 1;
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
    skillshopbtn.style.display = "flex";
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