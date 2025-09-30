// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
    getFunctions,//拿雲函數
    httpsCallable,//配合getFunctions呼叫雲函數
    connectFunctionsEmulator,//測試用，跑模擬
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-functions.js";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithCredential,//測試用
    createUserWithEmailAndPassword,//測試用
    signInWithEmailAndPassword,//測試用
    signOut,
    onAuthStateChanged,//監測登入狀態改變
    connectAuthEmulator,//測試用
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
    getFirestore,//初始化，無讀寫
    doc,//指向文件，無讀寫
    collection,//指向集合,無讀寫
    getDoc,//讀取
    addDoc,//指定集合新增文件
    setDoc,//覆蓋或merge  ,setDoc(userRef, { age: 19 }, { merge: true });
    updateDoc,//僅限已存在欄位
    connectFirestoreEmulator,//測試用
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCCIT70yei8qVk2j3_5l-kDE4b1XZCemos",
    authDomain: "magicianacademy.firebaseapp.com",
    projectId: "magicianacademy",
    storageBucket: "magicianacademy.firebasestorage.app",
    messagingSenderId: "1004595658126",
    appId: "1:1004595658126:web:b4f3a0014581fc7fa478df",
    measurementId: "G-LZS9ZCRCSC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions();
const saveGameData = httpsCallable(functions, "saveGameData");

//測試用的程式碼，跑模擬器
const IsLOCAL = Boolean(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
if (IsLOCAL) {
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(db, "127.0.0.1", 8081);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}
const sayHi = httpsCallable(functions, "sayHi");




const loginBtn = document.getElementById("loginBtn")

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // user 物件範例： user.uid, user.email, user.displayName
        window.user.id = user.uid;
        window.user.displayName = user.displayName;

        if (IsLOCAL) {
            window.user.displayName = "測試使用者"
        }

        console.log(window.user, window.user.displayName)
        loginBtn.textContent = `歡迎 (${window.user.displayName || "使用者"}) 再按一次登出`;

        //丟物件到雲函式，回傳也是物件
        sayHi({ userId: window.user.id })
            .then((result) => console.log(result.data.message))
            .catch(err => console.error(err));

        // 將使用者資料寫到 Firestore（若不存在則建立）-----------------------尚未實作或建立
        //await ensureUserDoc(user.uid, user.displayName);
    } else {
        loginBtn.textContent = "登入或註冊";
    }
});

loginBtn.addEventListener("click", async () => {
    if (auth.currentUser) {
        // 已登入 -> 登出
        await signOut(auth);
        alert("已登出");
    } else {
        // 未登入 -> 開 Google popup
        const provider = new GoogleAuthProvider();
        try {
            if (IsLOCAL) {
                //只在本機測試用 emulator 用假登入

                const fakeUser = {
                    sub: "1234567890",
                    email: "test@example.com",
                    email_verified: true,
                };

                // 建立假的 Google 憑證
                const fakeCredential = GoogleAuthProvider.credential(JSON.stringify(fakeUser));

                // 直接登入 emulator
                signInWithCredential(auth, fakeCredential).then(userCred => {
                    console.log("已登入假帳號:", userCred.user);
                });

                // // 先建立帳號（只會在 emulator 中）
                // await createUserWithEmailAndPassword(auth, "test@example.com", "password123")
                //     .catch(() => { }); // 如果已經有帳號就忽略錯誤

                // // 直接登入
                // const userCred = await signInWithEmailAndPassword(auth, "test@example.com", "password123");
                // console.log("已登入模擬器帳號:", userCred.user);



            } else {
                // 真實環境 → 用 signInWithPopup
                await signInWithPopup(auth, provider);
            }
            //await signInWithPopup(auth, provider);
        } catch (err) {
            console.error("登入失敗：", err);
            alert("登入失敗，請看 console");
        }
    }
});



// function uploadSave() {
//     try {
//         const result = await saveGameData({
//             userId: window.user.id,
//             gamedatas: window.user.gamedatas,
//         });

//         console.log(result.data.message);
//     } catch (err) {
//         console.error("存檔錯誤:", err.message);
//     }
// }

// window.uploadSave = 5;