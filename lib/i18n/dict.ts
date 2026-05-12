/**
 * Translation dictionary. Flat keys with dot-notation for grouping.
 *
 * Source-of-truth language is English; other languages cascade. Missing
 * keys fall back to English at lookup time (see `useI18n.ts`).
 *
 * NOTE on JA/ZH: these are best-effort initial translations to ship the
 * language switch — refine with native review later.
 */

export const LANGUAGES = ["en", "th", "ja", "zh"] as const;
export type Lang = (typeof LANGUAGES)[number];

export const LANGUAGE_META: Record<Lang, { label: string; native: string }> = {
  en: { label: "English", native: "English" },
  th: { label: "Thai", native: "ไทย" },
  ja: { label: "Japanese", native: "日本語" },
  zh: { label: "Chinese", native: "中文" },
};

export type Dict = Record<string, string>;

const en: Dict = {
  // Onboarding
  "onboarding.brand": "Typhoon Chat",
  "onboarding.title": "Set up",
  "onboarding.subtitle":
    "No sign-up. Everything lives in your browser — clearing your cache erases it.",
  "onboarding.name.label": "Display name",
  "onboarding.name.placeholder": "e.g. Alex",
  "onboarding.key.label": "Typhoon API key",
  "onboarding.key.placeholder": "sk-...",
  "onboarding.key.link": "Get a key at opentyphoon.ai",
  "onboarding.cta": "Continue",
  "onboarding.cta.validating": "Verifying key…",
  "onboarding.security":
    "Your API key is sent from your browser through our server to Typhoon — it is never stored on the server.",
  "onboarding.error.name": "Please enter a display name",
  "onboarding.error.keyEmpty": "Please enter your Typhoon API key",
  "onboarding.error.keyShort": "API key looks too short — please double-check",
  "onboarding.error.keyInvalid":
    "That API key is invalid. Verify it and try again.",
  "onboarding.error.network":
    "Couldn't verify your key — check your network and try again.",

  // Greeting
  "greeting.morning": "Good morning, {name}",
  "greeting.afternoon": "Good afternoon, {name}",
  "greeting.evening": "Good evening, {name}",
  "greeting.night": "Working late, {name}?",
  "greeting.subtitle": "What's on your mind today?",

  // Composer
  "composer.placeholder": "Ask anything",
  "composer.attach": "Attach image",
  "composer.deepSearch": "Deep Search",
  "composer.reason": "Reason",
  "composer.more": "More",
  "composer.send": "Send message",
  "composer.stop": "Stop generation",
  "composer.kbd.send": "send",
  "composer.kbd.newline": "newline",
  "composer.ocr.reading": "Reading image…",
  "composer.ocr.failed": "Couldn't read the image",

  // Footer
  "footer.disclaimer": "AI can make mistakes. Please double-check responses.",

  // Top bar
  "topbar.settings": "Settings",
  "topbar.account": "Account",
  "topbar.theme.light": "Switch to light theme",
  "topbar.theme.dark": "Switch to dark theme",

  // Sidebar / history
  "rail.newChat": "New chat",
  "rail.toggle": "Toggle history",
  "history.title": "History",
  "history.search": "Search",
  "history.empty": "No conversations yet",
  "history.today": "Today",
  "history.earlier": "Earlier",
  "history.delete": "Delete chat",
  "history.delete.title": "Delete this chat?",
  "history.delete.desc": "This will permanently remove the conversation.",
  "history.delete.confirm": "Delete",
  "history.delete.cancel": "Cancel",

  // Message actions
  "message.copy": "Copy",
  "message.regenerate": "Regenerate",
  "message.good": "Good response",
  "message.bad": "Bad response",
  "message.error": "error",
  "message.you": "You",
  "message.assistant": "Typhoon",
  "message.image": "Image",

  // Settings
  "settings.title": "Settings",
  "settings.tab.basic": "Basic",
  "settings.tab.advanced": "Advanced",
  "settings.cancel": "Cancel",
  "settings.save": "Save",
  "settings.reset": "Reset to defaults",
  "settings.reset.title": "These settings will be reset:",
  "settings.reset.confirm": "Reset",
  "settings.reset.cancel": "Cancel",
  "settings.reset.empty": "Nothing to reset — everything is already at defaults.",

  // Settings · basic
  "settings.basic.name": "Display name",
  "settings.basic.key": "Typhoon API key",
  "settings.basic.theme": "Theme",
  "settings.basic.theme.light": "Light",
  "settings.basic.theme.dark": "Dark",
  "settings.basic.language": "Language",

  // Settings · advanced
  "settings.adv.maxTokens": "Max Completion Tokens",
  "settings.adv.maxTokens.desc":
    "The maximum length of the model's reply. Higher values allow longer answers but cost more tokens.",
  "settings.adv.temperature": "Temperature",
  "settings.adv.temperature.desc":
    "Controls randomness. Higher values (>1.0) produce more creative output; lower values (<0.3) make answers more focused and deterministic.",
  "settings.adv.topP": "Top-P",
  "settings.adv.topP.desc":
    "Nucleus sampling — restricts the model to the most likely tokens whose probabilities sum to this threshold.",
  "settings.adv.freqPenalty": "Frequency Penalty",
  "settings.adv.freqPenalty.desc":
    "Discourages the model from repeating the same words. Higher values reduce repetition.",

  // Danger zone
  "settings.danger.title": "Danger zone",
  "settings.danger.clear": "Clear all data",
  "settings.danger.confirm": "Delete everything?",
  "settings.danger.confirmYes": "Confirm",
  "settings.danger.confirmNo": "Cancel",

  // About
  "rail.about": "About this project",
  "about.tagline": "Open-source Typhoon AI chat client",
  "about.description":
    "A minimalist client for Typhoon, the Thai-first AI from SCB 10X. Everything lives in your browser — no accounts, no servers, no tracking. Bring your own API key from opentyphoon.ai.",
  "about.github": "View source on GitHub",
  "about.issues": "Report an issue",
  "about.license": "License",
  "about.builtWith": "Built with",
  "about.thanks": "Thanks to SCB 10X for making Typhoon open and accessible.",
};

const th: Dict = {
  "onboarding.brand": "Typhoon Chat",
  "onboarding.title": "ตั้งค่าเริ่มต้น",
  "onboarding.subtitle":
    "ไม่ต้องลงทะเบียน ทุกอย่างเก็บไว้ใน browser ของคุณ — ล้าง cache เมื่อไหร่ ข้อมูลก็หายไป",
  "onboarding.name.label": "ชื่อที่จะแสดง",
  "onboarding.name.placeholder": "เช่น เก่ง, Nat, Alex",
  "onboarding.key.label": "Typhoon API key",
  "onboarding.key.placeholder": "sk-...",
  "onboarding.key.link": "ขอ API key ที่ opentyphoon.ai",
  "onboarding.cta": "เริ่มใช้งาน",
  "onboarding.cta.validating": "กำลังตรวจสอบ key…",
  "onboarding.security":
    "API key จะถูกส่งจาก browser ผ่าน server ไปยัง Typhoon โดยไม่ถูกเก็บไว้ที่ server ของเรา",
  "onboarding.error.name": "กรุณาใส่ชื่อผู้ใช้",
  "onboarding.error.keyEmpty": "กรุณาใส่ Typhoon API key",
  "onboarding.error.keyShort": "API key สั้นเกินไป โปรดตรวจสอบอีกครั้ง",
  "onboarding.error.keyInvalid":
    "API key ไม่ถูกต้อง โปรดตรวจสอบและลองใหม่",
  "onboarding.error.network":
    "ตรวจสอบ key ไม่สำเร็จ — โปรดเช็คเครือข่ายและลองอีกครั้ง",

  "greeting.morning": "อรุณสวัสดิ์, {name}",
  "greeting.afternoon": "สวัสดีตอนบ่าย, {name}",
  "greeting.evening": "สวัสดีตอนเย็น, {name}",
  "greeting.night": "ดึกแล้วนะ {name}",
  "greeting.subtitle": "วันนี้คิดอะไรอยู่?",

  "composer.placeholder": "ถามอะไรก็ได้",
  "composer.attach": "แนบรูป",
  "composer.deepSearch": "Deep Search",
  "composer.reason": "Reason",
  "composer.more": "เพิ่มเติม",
  "composer.send": "ส่งข้อความ",
  "composer.stop": "หยุดสร้างคำตอบ",
  "composer.kbd.send": "ส่ง",
  "composer.kbd.newline": "ขึ้นบรรทัดใหม่",
  "composer.ocr.reading": "กำลังอ่านรูป…",
  "composer.ocr.failed": "อ่านรูปไม่สำเร็จ",

  "footer.disclaimer": "AI อาจตอบผิดได้ โปรดตรวจสอบข้อมูลซ้ำ",

  "topbar.settings": "ตั้งค่า",
  "topbar.account": "บัญชี",
  "topbar.theme.light": "เปลี่ยนเป็นธีมสว่าง",
  "topbar.theme.dark": "เปลี่ยนเป็นธีมมืด",

  "rail.newChat": "แชทใหม่",
  "rail.toggle": "เปิด/ปิดประวัติ",
  "history.title": "ประวัติแชท",
  "history.search": "ค้นหา",
  "history.empty": "ยังไม่มีประวัติแชท",
  "history.today": "วันนี้",
  "history.earlier": "ก่อนหน้า",
  "history.delete": "ลบแชท",
  "history.delete.title": "ลบแชทนี้?",
  "history.delete.desc": "การสนทนาจะถูกลบถาวรจาก browser ของคุณ",
  "history.delete.confirm": "ลบ",
  "history.delete.cancel": "ยกเลิก",

  "message.copy": "คัดลอก",
  "message.regenerate": "สร้างใหม่",
  "message.good": "ตอบดี",
  "message.bad": "ตอบไม่ดี",
  "message.error": "ข้อผิดพลาด",
  "message.you": "คุณ",
  "message.assistant": "Typhoon",
  "message.image": "รูปภาพ",

  "settings.title": "การตั้งค่า",
  "settings.tab.basic": "พื้นฐาน",
  "settings.tab.advanced": "ขั้นสูง",
  "settings.cancel": "ยกเลิก",
  "settings.save": "บันทึก",
  "settings.reset": "Reset ค่าเริ่มต้น",
  "settings.reset.title": "ค่าต่อไปนี้จะถูก reset:",
  "settings.reset.confirm": "Reset",
  "settings.reset.cancel": "ยกเลิก",
  "settings.reset.empty": "ไม่มีอะไรต้อง reset — ทุกค่าเป็นค่าเริ่มต้นแล้ว",

  "settings.basic.name": "ชื่อที่จะแสดง",
  "settings.basic.key": "Typhoon API key",
  "settings.basic.theme": "ธีม",
  "settings.basic.theme.light": "สว่าง",
  "settings.basic.theme.dark": "มืด",
  "settings.basic.language": "ภาษา",

  "settings.adv.maxTokens": "Max Completion Tokens",
  "settings.adv.maxTokens.desc":
    "ความยาวสูงสุดของคำตอบ ค่ามาก = ตอบยาวได้ แต่ใช้ token เยอะ",
  "settings.adv.temperature": "Temperature",
  "settings.adv.temperature.desc":
    "ควบคุมความสุ่ม ค่ามาก (>1.0) = สร้างสรรค์ขึ้น, ค่าน้อย (<0.3) = ตอบตรงและคงเส้นคงวา",
  "settings.adv.topP": "Top-P",
  "settings.adv.topP.desc":
    "Nucleus sampling — จำกัด token ที่โมเดลเลือกใช้ ให้รวมความน่าจะเป็นเท่ากับค่านี้",
  "settings.adv.freqPenalty": "Frequency Penalty",
  "settings.adv.freqPenalty.desc": "ลดการพูดคำซ้ำ ค่ามาก = ซ้ำน้อยลง",

  "settings.danger.title": "โซนอันตราย",
  "settings.danger.clear": "ลบข้อมูลทั้งหมด",
  "settings.danger.confirm": "ลบทุกอย่าง?",
  "settings.danger.confirmYes": "ยืนยัน",
  "settings.danger.confirmNo": "ยกเลิก",

  "rail.about": "เกี่ยวกับโปรเจกต์",
  "about.tagline": "Typhoon AI chat client แบบ open-source",
  "about.description":
    "หน้าจอแชทมินิมัลสำหรับ Typhoon โมเดล AI ภาษาไทยจาก SCB 10X ข้อมูลทุกอย่างเก็บไว้ใน browser ของคุณ — ไม่มีบัญชี ไม่มี server ไม่มี tracking ใช้ API key ของคุณเองจาก opentyphoon.ai",
  "about.github": "ดูซอร์สโค้ดบน GitHub",
  "about.issues": "แจ้งปัญหา",
  "about.license": "License",
  "about.builtWith": "สร้างด้วย",
  "about.thanks": "ขอบคุณ SCB 10X ที่เปิดให้ใช้ Typhoon",
};

const ja: Dict = {
  "onboarding.brand": "Typhoon Chat",
  "onboarding.title": "初期設定",
  "onboarding.subtitle":
    "サインアップ不要。すべてブラウザに保存され、キャッシュをクリアすると消えます。",
  "onboarding.name.label": "表示名",
  "onboarding.name.placeholder": "例：Alex",
  "onboarding.key.label": "Typhoon API キー",
  "onboarding.key.placeholder": "sk-...",
  "onboarding.key.link": "opentyphoon.ai でキーを取得",
  "onboarding.cta": "続ける",
  "onboarding.cta.validating": "キーを確認中…",
  "onboarding.security":
    "API キーはブラウザからサーバーを経由して Typhoon に送信されます。サーバーには保存されません。",
  "onboarding.error.name": "表示名を入力してください",
  "onboarding.error.keyEmpty": "Typhoon API キーを入力してください",
  "onboarding.error.keyShort": "API キーが短すぎます。もう一度確認してください",
  "onboarding.error.keyInvalid":
    "API キーが無効です。確認してもう一度お試しください。",
  "onboarding.error.network":
    "キーを確認できませんでした。ネットワークを確認してもう一度お試しください。",

  "greeting.morning": "おはようございます、{name}さん",
  "greeting.afternoon": "こんにちは、{name}さん",
  "greeting.evening": "こんばんは、{name}さん",
  "greeting.night": "夜遅くまでお疲れさまです、{name}さん",
  "greeting.subtitle": "今日は何をお手伝いしましょう?",

  "composer.placeholder": "何でも聞いてください",
  "composer.attach": "画像を添付",
  "composer.deepSearch": "Deep Search",
  "composer.reason": "Reason",
  "composer.more": "その他",
  "composer.send": "送信",
  "composer.stop": "生成を停止",
  "composer.kbd.send": "送信",
  "composer.kbd.newline": "改行",
  "composer.ocr.reading": "画像を読み取り中…",
  "composer.ocr.failed": "画像を読み取れませんでした",

  "footer.disclaimer": "AI は間違える場合があります。重要な情報は必ず確認してください。",

  "topbar.settings": "設定",
  "topbar.account": "アカウント",
  "topbar.theme.light": "ライトテーマに切り替え",
  "topbar.theme.dark": "ダークテーマに切り替え",

  "rail.newChat": "新しいチャット",
  "rail.toggle": "履歴の表示切替",
  "history.title": "履歴",
  "history.search": "検索",
  "history.empty": "まだ会話がありません",
  "history.today": "今日",
  "history.earlier": "それ以前",
  "history.delete": "チャットを削除",
  "history.delete.title": "このチャットを削除しますか?",
  "history.delete.desc": "この会話はブラウザから完全に削除されます。",
  "history.delete.confirm": "削除",
  "history.delete.cancel": "キャンセル",

  "message.copy": "コピー",
  "message.regenerate": "再生成",
  "message.good": "良い回答",
  "message.bad": "悪い回答",
  "message.error": "エラー",
  "message.you": "あなた",
  "message.assistant": "Typhoon",
  "message.image": "画像",

  "settings.title": "設定",
  "settings.tab.basic": "基本",
  "settings.tab.advanced": "詳細",
  "settings.cancel": "キャンセル",
  "settings.save": "保存",
  "settings.reset": "デフォルトに戻す",
  "settings.reset.title": "以下の設定がリセットされます:",
  "settings.reset.confirm": "リセット",
  "settings.reset.cancel": "キャンセル",
  "settings.reset.empty": "リセットする項目はありません。すべてデフォルト値です。",

  "settings.basic.name": "表示名",
  "settings.basic.key": "Typhoon API キー",
  "settings.basic.theme": "テーマ",
  "settings.basic.theme.light": "ライト",
  "settings.basic.theme.dark": "ダーク",
  "settings.basic.language": "言語",

  "settings.adv.maxTokens": "最大トークン数",
  "settings.adv.maxTokens.desc":
    "応答の最大長。値が大きいほど長い回答が可能ですが、トークン消費も増えます。",
  "settings.adv.temperature": "Temperature",
  "settings.adv.temperature.desc":
    "ランダム性を制御。高い値 (>1.0) で創造的、低い値 (<0.3) で集中した出力に。",
  "settings.adv.topP": "Top-P",
  "settings.adv.topP.desc":
    "Nucleus sampling — この閾値までの確率を持つトークンに制限します。",
  "settings.adv.freqPenalty": "Frequency Penalty",
  "settings.adv.freqPenalty.desc":
    "同じ語の繰り返しを抑制。値が高いほど繰り返しを減らします。",

  "settings.danger.title": "危険な操作",
  "settings.danger.clear": "全データを削除",
  "settings.danger.confirm": "すべて削除しますか?",
  "settings.danger.confirmYes": "確認",
  "settings.danger.confirmNo": "キャンセル",

  "rail.about": "プロジェクトについて",
  "about.tagline": "オープンソースの Typhoon AI チャットクライアント",
  "about.description":
    "SCB 10X が開発したタイ語特化型 AI「Typhoon」のためのミニマルなチャットクライアント。データはすべてブラウザに保存されます — アカウント不要、サーバー保存なし、トラッキングなし。opentyphoon.ai で取得した API キーを使用します。",
  "about.github": "GitHub でソースコードを見る",
  "about.issues": "問題を報告",
  "about.license": "ライセンス",
  "about.builtWith": "使用技術",
  "about.thanks": "Typhoon をオープンに公開してくれた SCB 10X に感謝します。",
};

const zh: Dict = {
  "onboarding.brand": "Typhoon Chat",
  "onboarding.title": "初始设置",
  "onboarding.subtitle":
    "无需注册。所有数据保存在浏览器中 — 清除缓存即可删除。",
  "onboarding.name.label": "显示名称",
  "onboarding.name.placeholder": "例如：Alex",
  "onboarding.key.label": "Typhoon API 密钥",
  "onboarding.key.placeholder": "sk-...",
  "onboarding.key.link": "前往 opentyphoon.ai 获取密钥",
  "onboarding.cta": "继续",
  "onboarding.cta.validating": "正在验证密钥…",
  "onboarding.security":
    "API 密钥从您的浏览器通过我们的服务器发送到 Typhoon — 服务器不会存储该密钥。",
  "onboarding.error.name": "请输入显示名称",
  "onboarding.error.keyEmpty": "请输入 Typhoon API 密钥",
  "onboarding.error.keyShort": "API 密钥过短 — 请检查",
  "onboarding.error.keyInvalid": "该 API 密钥无效。请验证后重试。",
  "onboarding.error.network": "无法验证密钥 — 请检查网络后重试。",

  "greeting.morning": "早上好,{name}",
  "greeting.afternoon": "下午好,{name}",
  "greeting.evening": "晚上好,{name}",
  "greeting.night": "夜深了,{name}",
  "greeting.subtitle": "今天想聊点什么?",

  "composer.placeholder": "随便问点什么",
  "composer.attach": "上传图片",
  "composer.deepSearch": "Deep Search",
  "composer.reason": "Reason",
  "composer.more": "更多",
  "composer.send": "发送",
  "composer.stop": "停止生成",
  "composer.kbd.send": "发送",
  "composer.kbd.newline": "换行",
  "composer.ocr.reading": "正在识别图片…",
  "composer.ocr.failed": "无法识别图片",

  "footer.disclaimer": "AI 可能出错,请仔细核实。",

  "topbar.settings": "设置",
  "topbar.account": "账户",
  "topbar.theme.light": "切换到浅色主题",
  "topbar.theme.dark": "切换到深色主题",

  "rail.newChat": "新建对话",
  "rail.toggle": "切换历史记录",
  "history.title": "历史记录",
  "history.search": "搜索",
  "history.empty": "暂无对话",
  "history.today": "今天",
  "history.earlier": "更早",
  "history.delete": "删除对话",
  "history.delete.title": "删除此对话?",
  "history.delete.desc": "对话将从浏览器中永久删除。",
  "history.delete.confirm": "删除",
  "history.delete.cancel": "取消",

  "message.copy": "复制",
  "message.regenerate": "重新生成",
  "message.good": "好回答",
  "message.bad": "差回答",
  "message.error": "错误",
  "message.you": "你",
  "message.assistant": "Typhoon",
  "message.image": "图片",

  "settings.title": "设置",
  "settings.tab.basic": "基础",
  "settings.tab.advanced": "高级",
  "settings.cancel": "取消",
  "settings.save": "保存",
  "settings.reset": "恢复默认值",
  "settings.reset.title": "以下设置将被重置:",
  "settings.reset.confirm": "重置",
  "settings.reset.cancel": "取消",
  "settings.reset.empty": "无需重置 — 所有设置均为默认值。",

  "settings.basic.name": "显示名称",
  "settings.basic.key": "Typhoon API 密钥",
  "settings.basic.theme": "主题",
  "settings.basic.theme.light": "浅色",
  "settings.basic.theme.dark": "深色",
  "settings.basic.language": "语言",

  "settings.adv.maxTokens": "最大补全 token 数",
  "settings.adv.maxTokens.desc":
    "模型回复的最大长度。值越大,回答越长,但消耗 token 也更多。",
  "settings.adv.temperature": "Temperature",
  "settings.adv.temperature.desc":
    "控制随机性。高值 (>1.0) 创造性更强,低值 (<0.3) 更专注、更确定。",
  "settings.adv.topP": "Top-P",
  "settings.adv.topP.desc":
    "Nucleus sampling — 仅在概率之和达到此阈值的 token 中采样。",
  "settings.adv.freqPenalty": "Frequency Penalty",
  "settings.adv.freqPenalty.desc": "抑制重复用词。值越高,重复越少。",

  "settings.danger.title": "危险区域",
  "settings.danger.clear": "清除全部数据",
  "settings.danger.confirm": "确定删除全部?",
  "settings.danger.confirmYes": "确认",
  "settings.danger.confirmNo": "取消",

  "rail.about": "关于本项目",
  "about.tagline": "开源 Typhoon AI 聊天客户端",
  "about.description":
    "面向 SCB 10X 开发的泰语优先 AI 模型 Typhoon 的极简聊天客户端。所有数据保存在浏览器中 — 无账户、无服务器、无跟踪。使用您自己在 opentyphoon.ai 获取的 API 密钥。",
  "about.github": "在 GitHub 上查看源代码",
  "about.issues": "报告问题",
  "about.license": "许可证",
  "about.builtWith": "技术栈",
  "about.thanks": "感谢 SCB 10X 让 Typhoon 开源开放。",
};

export const DICTS: Record<Lang, Dict> = { en, th, ja, zh };
