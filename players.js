// サカつく2026 SP選手スカウト 提供割合一覧（ゲーム内スクリーンショットから完全転記）
// ★3: 5.000% (各0.138%) / ★2: 10.000% (各0.208%) / ★1: 85.000% (各1.517%)

const COUNTRY_FLAGS = {
  "ポルトガル": "\u{1F1F5}\u{1F1F9}", "韓国": "\u{1F1F0}\u{1F1F7}", "イングランド": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}",
  "アルゼンチン": "\u{1F1E6}\u{1F1F7}", "日本": "\u{1F1EF}\u{1F1F5}", "スペイン": "\u{1F1EA}\u{1F1F8}",
  "フランス": "\u{1F1EB}\u{1F1F7}", "コロンビア": "\u{1F1E8}\u{1F1F4}", "マリ": "\u{1F1F2}\u{1F1F1}",
  "モロッコ": "\u{1F1F2}\u{1F1E6}", "イタリア": "\u{1F1EE}\u{1F1F9}", "ウルグアイ": "\u{1F1FA}\u{1F1FE}",
  "クロアチア": "\u{1F1ED}\u{1F1F7}", "ベルギー": "\u{1F1E7}\u{1F1EA}", "オランダ": "\u{1F1F3}\u{1F1F1}",
  "スイス": "\u{1F1E8}\u{1F1ED}", "ブラジル": "\u{1F1E7}\u{1F1F7}", "ジャマイカ": "\u{1F1EF}\u{1F1F2}",
  "ウェールズ": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0077}\u{E006C}\u{E0073}\u{E007F}",
  "アメリカ": "\u{1F1FA}\u{1F1F8}", "アイルランド": "\u{1F1EE}\u{1F1EA}",
  "デンマーク": "\u{1F1E9}\u{1F1F0}", "トルコ": "\u{1F1F9}\u{1F1F7}",
  "ドイツ": "\u{1F1E9}\u{1F1EA}", "ノルウェー": "\u{1F1F3}\u{1F1F4}",
  "エクアドル": "\u{1F1EA}\u{1F1E8}", "ポーランド": "\u{1F1F5}\u{1F1F1}",
  "セネガル": "\u{1F1F8}\u{1F1F3}", "ギニア": "\u{1F1EC}\u{1F1F3}",
  "コスタリカ": "\u{1F1E8}\u{1F1F7}", "オーストラリア": "\u{1F1E6}\u{1F1FA}",
  "ガーナ": "\u{1F1EC}\u{1F1ED}", "南アフリカ": "\u{1F1FF}\u{1F1E6}",
  "チリ": "\u{1F1E8}\u{1F1F1}", "セルビア": "\u{1F1F7}\u{1F1F8}",
  "パラグアイ": "\u{1F1F5}\u{1F1FE}", "コンゴ民主共和国": "\u{1F1E8}\u{1F1E9}",
  "サウジアラビア": "\u{1F1F8}\u{1F1E6}", "カメルーン": "\u{1F1E8}\u{1F1F2}",
  "ベナン": "\u{1F1E7}\u{1F1EF}", "スコットランド": "\u{1F3F4}\u{E0067}\u{E0062}\u{E0073}\u{E0063}\u{E0074}\u{E007F}",
  "オーストリア": "\u{1F1E6}\u{1F1F9}", "スウェーデン": "\u{1F1F8}\u{1F1EA}",
  "メキシコ": "\u{1F1F2}\u{1F1FD}", "チュニジア": "\u{1F1F9}\u{1F1F3}",
  "カナダ": "\u{1F1E8}\u{1F1E6}", "ナイジェリア": "\u{1F1F3}\u{1F1EC}",
};

function getFlag(country) {
  return COUNTRY_FLAGS[country] || "\u{1F3F3}\u{FE0F}";
}

function getPosGroup(pos) {
  if (["CF", "LW", "RW"].includes(pos)) return "FW";
  if (["AM", "LM", "RM", "DM"].includes(pos)) return "MF";
  if (["CB", "LB", "RB"].includes(pos)) return "DF";
  return "GK";
}

// =============================================
// ゲーム内「提供割合 一覧」から完全転記
// ★3: 5.000% → 36名 × 0.138% ≒ 4.968%
// ★2: 10.000% → 48名 × 0.208% ≒ 9.984%
// ★1: 85.000% → 56名 × 1.517% ≒ 84.952%
// =============================================

const PLAYERS = {
  star3: [
    // --- CF ---
    { name: "クリスティアーノ・ロナウド", position: "CF", rate: 0.138, country: "ポルトガル" },
    { name: "ソン・フンミン", position: "CF", rate: 0.138, country: "韓国" },
    { name: "カラム・ウィルソン", position: "CF", rate: 0.138, country: "イングランド" },
    { name: "ラウタロ・マルティネス", position: "CF", rate: 0.138, country: "アルゼンチン" },
    // --- LW ---
    { name: "三笘薫", position: "LW", rate: 0.138, country: "日本" },
    { name: "ファン・ヒチャン", position: "LW", rate: 0.138, country: "韓国" },
    // --- RW ---
    { name: "ペドロ", position: "RW", rate: 0.138, country: "スペイン" },
    { name: "ブラヒム・ディアス", position: "RW", rate: 0.138, country: "モロッコ" },
    { name: "ブカヨ・サカ", position: "RW", rate: 0.138, country: "イングランド" },
    // --- AM ---
    { name: "南野拓実", position: "AM", rate: 0.138, country: "日本" },
    { name: "ジョアン・ペドロ", position: "AM", rate: 0.138, country: "ブラジル" },
    { name: "イスコ", position: "AM", rate: 0.138, country: "スペイン" },
    // --- LM ---
    { name: "フィル・フォーデン", position: "LM", rate: 0.138, country: "イングランド" },
    { name: "アシュリー・ヤング", position: "LM", rate: 0.138, country: "イングランド" },
    { name: "ステファン・エル・シャーラウィ", position: "LM", rate: 0.138, country: "イタリア" },
    // --- RM ---
    { name: "フアン・クアドラード", position: "RM", rate: 0.138, country: "コロンビア" },
    { name: "アマド・ディアロ", position: "RM", rate: 0.138, country: "コートジボワール" },
    { name: "ペドロ・ポロ", position: "RM", rate: 0.138, country: "スペイン" },
    // --- DM ---
    { name: "フェデリコ・バルベルデ", position: "DM", rate: 0.138, country: "ウルグアイ" },
    { name: "ショーン・ロングスタッフ", position: "DM", rate: 0.138, country: "イングランド" },
    { name: "ファン・インボム", position: "DM", rate: 0.138, country: "韓国" },
    { name: "ファビアン・ルイス", position: "DM", rate: 0.138, country: "スペイン" },
    { name: "ルカ・モドリッチ", position: "DM", rate: 0.138, country: "クロアチア" },
    { name: "ケヴィン・デ・ブライネ", position: "DM", rate: 0.138, country: "ベルギー" },
    // --- LB ---
    { name: "ルーク・ショー", position: "LB", rate: 0.138, country: "イングランド" },
    { name: "ユリエン・ティンバー", position: "LB", rate: 0.138, country: "オランダ" },
    { name: "ジョアン・カンセロ", position: "LB", rate: 0.138, country: "ポルトガル" },
    { name: "レオナルド・スピナッツォーラ", position: "LB", rate: 0.138, country: "イタリア" },
    // --- RB ---
    { name: "ナウエル・モリーナ", position: "RB", rate: 0.138, country: "アルゼンチン" },
    { name: "リース・ジェイムズ", position: "RB", rate: 0.138, country: "イングランド" },
    // --- CB ---
    { name: "アレクサンドロ・リベイロ", position: "CB", rate: 0.138, country: "ブラジル" },
    { name: "フェデリコ・ガッティ", position: "CB", rate: 0.138, country: "イタリア" },
    { name: "フィルジル・ファン・ダイク", position: "CB", rate: 0.138, country: "オランダ" },
    // --- GK ---
    { name: "ヤン・ゾマー", position: "GK", rate: 0.138, country: "スイス" },
    { name: "ニック・ポープ", position: "GK", rate: 0.138, country: "イングランド" },
    { name: "マイク・メニャン", position: "GK", rate: 0.138, country: "フランス" },
  ],

  star2: [
    // --- CF ---
    { name: "ジェイミー・ヴァーディ", position: "CF", rate: 0.208, country: "イングランド" },
    { name: "ジョシュア・ザークツィー", position: "CF", rate: 0.208, country: "オランダ" },
    { name: "ルーク・デ・ヨング", position: "CF", rate: 0.208, country: "オランダ" },
    { name: "リシャルリソン", position: "CF", rate: 0.208, country: "ブラジル" },
    { name: "ヨアン・ウィサ", position: "CF", rate: 0.208, country: "フランス" },
    // --- LW ---
    { name: "ニコロ・ザニオーロ", position: "LW", rate: 0.208, country: "イタリア" },
    { name: "イゴール・パイシャオン", position: "LW", rate: 0.208, country: "ブラジル" },
    { name: "ブレナン・ジョンソン", position: "LW", rate: 0.208, country: "ウェールズ" },
    { name: "アレハンドロ・ガルナチョ", position: "LW", rate: 0.208, country: "アルゼンチン" },
    // --- RW ---
    { name: "ティモシー・ウェア", position: "RW", rate: 0.208, country: "アメリカ" },
    { name: "ステフェン・ベルハイス", position: "RW", rate: 0.208, country: "オランダ" },
    { name: "フランシスコ・トリンコン", position: "RW", rate: 0.208, country: "ポルトガル" },
    { name: "レオン・ベイリー", position: "RW", rate: 0.208, country: "ジャマイカ" },
    // --- AM ---
    { name: "ブライス・メンデス", position: "AM", rate: 0.208, country: "フランス" },
    { name: "フロリアン・トヴァン", position: "AM", rate: 0.208, country: "フランス" },
    { name: "トルガン・アザール", position: "AM", rate: 0.208, country: "ベルギー" },
    { name: "トゥーン・コープマイネルス", position: "AM", rate: 0.208, country: "オランダ" },
    { name: "トマ・レマル", position: "AM", rate: 0.208, country: "フランス" },
    // --- LM ---
    { name: "ドワイト・マクニール", position: "LM", rate: 0.208, country: "イングランド" },
    { name: "カラム・ハドソン=オドイ", position: "LM", rate: 0.208, country: "イングランド" },
    { name: "佐野航大", position: "LM", rate: 0.208, country: "日本" },
    // --- RM ---
    { name: "アレクシス・サーレマーケルス", position: "RM", rate: 0.208, country: "ベルギー" },
    { name: "マッテオ・ポリターノ", position: "RM", rate: 0.208, country: "イタリア" },
    { name: "ジョアン・マリオ", position: "RM", rate: 0.208, country: "ポルトガル" },
    { name: "アダマ・トラオレ", position: "RM", rate: 0.208, country: "スペイン" },
    // --- DM ---
    { name: "コナー・ギャラガー", position: "DM", rate: 0.208, country: "イングランド" },
    { name: "デイヴィ・クラーセン", position: "DM", rate: 0.208, country: "オランダ" },
    { name: "デニス・ザカリア", position: "DM", rate: 0.208, country: "スイス" },
    { name: "マルテン・デ・ローン", position: "DM", rate: 0.208, country: "オランダ" },
    { name: "ドウグラス・ルイス", position: "DM", rate: 0.208, country: "ブラジル" },
    { name: "アクセル・ヴィツェル", position: "DM", rate: 0.208, country: "ベルギー" },
    // --- LB ---
    { name: "ニコラス・タグリアフィコ", position: "LB", rate: 0.208, country: "アルゼンチン" },
    { name: "アントニー・ロビンソン", position: "LB", rate: 0.208, country: "アメリカ" },
    { name: "ジュゼッペ・ペッツェッラ", position: "LB", rate: 0.208, country: "イタリア" },
    { name: "ペルビス・エストゥピニャン", position: "LB", rate: 0.208, country: "エクアドル" },
    // --- RB ---
    { name: "ジョバンニ・ディ・ロレンツォ", position: "RB", rate: 0.208, country: "イタリア" },
    { name: "セルジーノ・デスト", position: "RB", rate: 0.208, country: "アメリカ" },
    { name: "ケニー・テテ", position: "RB", rate: 0.208, country: "オランダ" },
    { name: "アーロン・ワン=ビサカ", position: "RB", rate: 0.208, country: "イングランド" },
    { name: "ヴァンデルソン", position: "RB", rate: 0.208, country: "ブラジル" },
    // --- CB ---
    { name: "谷口彰悟", position: "CB", rate: 0.208, country: "日本" },
    { name: "ヤクブ・キヴィオル", position: "CB", rate: 0.208, country: "ポーランド" },
    { name: "ダン・バーン", position: "CB", rate: 0.208, country: "イングランド" },
    { name: "ゼノ・デバスト", position: "CB", rate: 0.208, country: "ベルギー" },
    { name: "イゴール・スベルディア", position: "CB", rate: 0.208, country: "スペイン" },
    // --- GK ---
    { name: "クィービーン・ケレハー", position: "GK", rate: 0.208, country: "アイルランド" },
    { name: "マッティア・ペリン", position: "GK", rate: 0.208, country: "イタリア" },
    { name: "マシュー・ライアン", position: "GK", rate: 0.208, country: "オーストラリア" },
  ],

  star1: [
    // --- CF ---
    { name: "デイビット・ミン", position: "CF", rate: 1.517, country: "韓国" },
    { name: "ブライアン・リンセン", position: "CF", rate: 1.517, country: "オランダ" },
    { name: "マックス・ディーン", position: "CF", rate: 1.517, country: "イングランド" },
    { name: "ジェフ・エクトール", position: "CF", rate: 1.517, country: "フランス" },
    { name: "ロメオ・フェルマント", position: "CF", rate: 1.517, country: "オランダ" },
    // --- LW ---
    { name: "ウイリアム・ゴメス", position: "LW", rate: 1.517, country: "スウェーデン" },
    { name: "アフォンソ・モレイラ", position: "LW", rate: 1.517, country: "ポルトガル" },
    { name: "マルワン・アル=サハフィ", position: "LW", rate: 1.517, country: "サウジアラビア" },
    { name: "モモドゥ・ソンコ", position: "LW", rate: 1.517, country: "ガーナ" },
    { name: "アブドゥラエ・トラオレ", position: "LW", rate: 1.517, country: "マリ" },
    // --- RW ---
    { name: "アリマミー・ゴリー", position: "RW", rate: 1.517, country: "ギニア" },
    { name: "イラ・ソル", position: "RW", rate: 1.517, country: "ノルウェー" },
    { name: "ヴァンド・フェリックス", position: "RW", rate: 1.517, country: "ブラジル" },
    { name: "ミゲル・ロドリゲス", position: "RW", rate: 1.517, country: "コロンビア" },
    { name: "ルイ・メンデス", position: "RW", rate: 1.517, country: "ポルトガル" },
    // --- AM ---
    { name: "マチュー・マルテンス", position: "AM", rate: 1.517, country: "ベルギー" },
    { name: "ティカ・デ・ヨング", position: "AM", rate: 1.517, country: "オランダ" },
    { name: "伊藤涼太郎", position: "AM", rate: 1.517, country: "日本" },
    { name: "トリスタン・ドグレフ", position: "AM", rate: 1.517, country: "オランダ" },
    { name: "リチャード・ファン・デル・フェンネ", position: "AM", rate: 1.517, country: "オランダ" },
    { name: "レビ・スマンス", position: "AM", rate: 1.517, country: "ベルギー" },
    // --- LM ---
    { name: "ヨルフ・スフレーダース", position: "LM", rate: 1.517, country: "オランダ" },
    { name: "ウセイヌ・ニアン", position: "LM", rate: 1.517, country: "セネガル" },
    { name: "シディキ・シェリフ", position: "LM", rate: 1.517, country: "ギニア" },
    { name: "ディエゴ・モレイラ", position: "LM", rate: 1.517, country: "ポルトガル" },
    { name: "マクサンス・リベラ", position: "LM", rate: 1.517, country: "フランス" },
    // --- RM ---
    { name: "サミ・ウィッサ", position: "RM", rate: 1.517, country: "フランス" },
    { name: "ジャン・ロゲリ", position: "RM", rate: 1.517, country: "フランス" },
    { name: "マティス・サモワーズ", position: "RM", rate: 1.517, country: "フランス" },
    { name: "オーガスティーン・ボアキエ", position: "RM", rate: 1.517, country: "ガーナ" },
    { name: "アナン・カライリ", position: "RM", rate: 1.517, country: "トルコ" },
    // --- DM ---
    { name: "ジダン・イクバル", position: "DM", rate: 1.517, country: "イングランド" },
    { name: "トム・ファン・デ・ローイ", position: "DM", rate: 1.517, country: "オランダ" },
    { name: "ニコラス・サットルベルガー", position: "DM", rate: 1.517, country: "オーストリア" },
    { name: "ジャン・バプティスト・ゴビー", position: "DM", rate: 1.517, country: "フランス" },
    { name: "ケヴィン・ダノワ", position: "DM", rate: 1.517, country: "フランス" },
    // --- LB ---
    { name: "カッソム・ワダラ", position: "LB", rate: 1.517, country: "フランス" },
    { name: "フレデリク・オッペゴール", position: "LB", rate: 1.517, country: "ノルウェー" },
    { name: "明本考浩", position: "LB", rate: 1.517, country: "日本" },
    { name: "ホアキン・セイス", position: "LB", rate: 1.517, country: "スペイン" },
    { name: "イェフ・ハルデフェルト", position: "LB", rate: 1.517, country: "ベルギー" },
    // --- RB ---
    { name: "コブ・コルバニ", position: "RB", rate: 1.517, country: "オランダ" },
    { name: "サイード・バカリ", position: "RB", rate: 1.517, country: "フランス" },
    { name: "ティアゴ・エスガイオ", position: "RB", rate: 1.517, country: "ポルトガル" },
    { name: "ルイ・モデスト", position: "RB", rate: 1.517, country: "ポルトガル" },
    { name: "アントワーヌ・メンディ", position: "RB", rate: 1.517, country: "フランス" },
    // --- CB ---
    { name: "アントン・ダング", position: "CB", rate: 1.517, country: "スウェーデン" },
    { name: "ジャンカルロ・シミッチ", position: "CB", rate: 1.517, country: "クロアチア" },
    { name: "テオ・キンテロ", position: "CB", rate: 1.517, country: "コロンビア" },
    { name: "ママドゥ・サール", position: "CB", rate: 1.517, country: "セネガル" },
    { name: "ニコライ・ホップランド", position: "CB", rate: 1.517, country: "ノルウェー" },
    // --- GK ---
    { name: "エティエンヌ・ファーセン", position: "GK", rate: 1.517, country: "オランダ" },
    { name: "アンドレ・ゴメス", position: "GK", rate: 1.517, country: "ポルトガル" },
    { name: "ロナルド・クーマン Jr.", position: "GK", rate: 1.517, country: "オランダ" },
    { name: "レミ・マシューズ", position: "GK", rate: 1.517, country: "イングランド" },
    { name: "パトリック・セケイラ", position: "GK", rate: 1.517, country: "コスタリカ" },
  ]
};

// ピックアップガチャ専用★3選手（通常プールには含まれない）
const PICKUP_STAR3 = [
  { name: "アレクサンダー・セルロート", position: "CF", rate: 1.000, country: "ノルウェー" },
  { name: "ニコロー・バレッラ", position: "DM", rate: 1.000, country: "イタリア" },
  { name: "ベン・ホワイト", position: "RB", rate: 1.000, country: "イングランド" },
  { name: "ティボ・クルトワ", position: "GK", rate: 1.000, country: "ベルギー" },
];

// ピックアップガチャの★3通常枠（既存★3を排出率0.027%で）
const PICKUP_STAR3_NORMAL = PLAYERS.star3.map(p => ({ ...p, rate: 0.027 }));

function getAllPlayers() {
  const all = [];
  // ピックアップ★3を先頭に
  if (typeof PICKUP_STAR3 !== "undefined") {
    PICKUP_STAR3.forEach(p => all.push({ ...p, rarity: 3, isPickup: true }));
  }
  PLAYERS.star3.forEach(p => all.push({ ...p, rarity: 3 }));
  PLAYERS.star2.forEach(p => all.push({ ...p, rarity: 2 }));
  PLAYERS.star1.forEach(p => all.push({ ...p, rarity: 1 }));
  return all;
}
