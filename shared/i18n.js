// Mal3ab — Arabic / English strings. Use t('key'); toggle with setLang('en'|'ar').
(function () {
  const STR = {
    ar: {
      app: 'ملعب', tagline: 'العب مع صاحبك أونلاين بكود غرفة أو لينك دعوة',
      haveCode: 'عندك كود؟', enterRoom: 'ادخل الغرفة', codeHint: 'اكتب الكود المكوّن من ٤ حروف',
      creating: 'بعمل الغرفة…', joining: 'بدخل…', sameDevice: 'نفس الجهاز', online: 'أونلاين', play: 'العب',
      history: '📜 سجل المباريات', tryAgain: '🔄 العب تاني', noHistory: 'لسه مفيش مباريات', vs: 'ضد', result: 'النتيجة', date: 'التاريخ', local: 'محلي', home: '← الرئيسية', newGame: 'لعبة جديدة',
      roomCode: 'كود الغرفة', copy: 'نسخ', copied: 'اتنسخ!', inviteLink: 'لينك الدعوة', localPlay: 'لعب على نفس الجهاز',
      draw: '🤝 تعادل!', won: '🏆 {p} كسب!', lost: '😅 {p} كسب', youWon: '🏆 إنت كسبت!',
      waiting: '⏳ مستني اللاعب التاني… ابعتله اللينك أو الكود', yourTurn: '🟢 دورك إنت', theirTurn: '🔴 دور {p}…', turnOf: 'دور {p}',
      player: 'اللاعب {n}', guest: 'ضيف', opponent: 'الخصم',
      login: 'تسجيل الدخول', signup: 'حساب جديد', logout: 'خروج', email: 'الإيميل', password: 'كلمة السر',
      username: 'اسم اللاعب', usernameOrEmail: 'اسم اللاعب أو الإيميل', emailOptional: 'الإيميل (اختياري)', mayor: 'العمدة', orGuest: 'أو العب كضيف', checkEmail: 'اتبعتلك إيميل تأكيد — افتحه وبعدين سجّل دخول',
      wins: 'فوز', losses: 'خسارة', draws: 'تعادل', account: 'حسابي',
      // chess
      white: 'الأبيض', black: 'الأسود', whitePlays: 'الأبيض يلعب', blackPlays: 'الأسود يلعب', check: 'كش!',
      moves: 'الحركات', offerDraw: 'عرض تعادل', drawOffered: 'عرضت تعادل…', acceptDraw: 'قبول التعادل', declineDraw: 'رفض',
      opponentOffersDraw: '{p} بيعرض تعادل', resign: 'استسلام', resigned: 'استسلم', timeout: 'خلص الوقت', premove: 'حركة مسبقة',
      checkmate: 'كش مات', stalemate: 'بات (تعادل)', timeControl: 'الوقت', increment: 'زيادة بعد كل نقلة', sec: 'ث', noClock: 'بدون وقت', min: 'دقايق',
      arrowsHint: 'كليك يمين واسحب لرسم سهم',
      tictactoe: 'إكس أو', tictactoeDesc: 'اللعبة الكلاسيكية. ٣ في صف واحد وتكسب.',
      connect4: 'كونكت ٤', connect4Desc: 'نزّل القرص في عمود، أول واحد يعمل ٤ في صف يكسب.',
      chess: 'شطرنج', chessDesc: 'شطرنج كامل: ساعة، قائمة حركات، تعادل، حركة مسبقة، وأسهم.',
      cityhall: 'City Hall', cityhallDesc: 'إنت العمدة: ابني مدينتك وأدِر الميزانية.',
      voxel: 'Voxel Sandbox', voxelDesc: 'عالم مكعبات ثلاثي الأبعاد: ابني واستكشف والعب مع أصحابك.', voxelstrike: 'Voxel Strike', voxelstrikeDesc: 'معركة مكعبات بالأسلحة: ضد البوتات أو أونلاين مع أصحابك، والقنابل بتفجّر البلوكات.', bricks: 'Brick Builder', bricksDesc: 'امسك قطع الطوب وابني اللي في خيالك: بيوت، عربيات، أي حاجة.',
      turfrush: 'Turf Rush', turfrushDesc: 'سباق سيطرة على الأرض، سريع ومتعدد اللاعبين.',
      pitch: 'Pitch Legends', pitchDesc: 'أركيد كورة بكروت على طريقة UNO — والعب ماتش لايف ضد صاحبك.',
      games: 'الألعاب', vsBot: 'ضد الكمبيوتر', botName: 'الكمبيوتر', easy: 'سهل', medium: 'متوسط', hard: 'صعب', twoPlayers: 'لاعبين على نفس الجهاز', myAccount: '👤 حسابي', admin: '🛡️ لوحة الأدمن', picture: 'صورة الحساب', changePicture: '📷 غيّر الصورة', removePicture: 'شيل الصورة', save: 'حفظ', saved: 'اتحفظ ✓', language: 'اللغة', changePassword: 'تغيير كلمة السر', currentPassword: 'كلمة السر الحالية', newPassword: 'كلمة السر الجديدة', confirmPassword: 'أكّد كلمة السر الجديدة', passwordsDontMatch: 'كلمتين السر مش زي بعض', passwordChanged: 'اتغيرت كلمة السر ✓ (الأجهزة التانية اتعملها خروج)', stats: 'الإحصائيات', loginFirst: 'سجّل دخول الأول', deleteGame: 'احذف من سجلي', confirmDeleteGame: 'تحذف الماتش ده من سجلك؟ (صاحبك هيفضل شايفه)', users: 'المستخدمين', searchUsers: 'دوّر باسم أو إيميل…', ban: '🚫 حظر', unban: 'فك الحظر', makeAdmin: '🛡️ خليه أدمن', removeAdmin: 'شيل الأدمن', deleteUser: '🗑 حذف', banReason: 'سبب الحظر؟ (مثلاً: غش)', confirmDeleteUser: 'تحذف حساب {p} نهائيًا؟ مفيش رجوع.', bannedBadge: 'محظور', adminBadge: 'أدمن', adminsOnly: 'الصفحة دي للأدمن بس', joined: 'اتسجل', lastSeen: 'آخر ظهور', never: '—', you: 'إنت', arabic: 'العربية', english: 'English', pictureHint: 'هتتصغر لوحدها وتتحفظ على حسابك', friends: '👥 الأصحاب', addFriend: 'ضيف صاحب باسمه', send: 'إرسال', requests: 'طلبات صداقة', noFriends: 'لسه مفيش أصحاب — ضيف حد باسمه', isOnline: 'أونلاين', isOffline: 'مش أونلاين', fastConnect: '⚡ العب معاه', invitesYou: 'بيدعوك تلعب', accept: 'قبول', decline: 'رفض', waitingFor: '⏳ مستني {p} يقبل…', declined: '{p} رفض الدعوة', loginForFriends: 'سجّل دخول عشان تضيف أصحاب', remove: 'حذف', sent: 'اتبعت', pickWorld: 'اختار العالم اللي هتلعبوا فيه', voxelFirst: 'افتح Voxel Sandbox الأول واعمل عالم (وإنت مسجّل دخول) وبعدين ادعي صاحبك', remember: 'خليني مسجّل لمدة أسبوع (من غيرها بتخرج بعد ٣ ساعات من غير لعب)',
      
      pin: 'ثبّتها فوق', unpin: 'شيل التثبيت', roomMissing: 'الغرفة مش موجودة', roomFull: 'الغرفة مليانة', codeMissing: 'الكود ده مش موجود', roomFail: 'مقدرتش أعمل غرفة، جرّب تاني',
    },
    en: {
      app: 'Mal3ab', tagline: 'Play with a friend online with a room code or an invite link',
      haveCode: 'Have a code?', enterRoom: 'Join room', codeHint: 'Enter the 4-letter code',
      creating: 'Creating room…', joining: 'Joining…', sameDevice: 'Same device', online: 'Online', play: 'Play',
      history: '📜 Match history', tryAgain: '🔄 Play again', noHistory: 'No matches yet', vs: 'vs', result: 'Result', date: 'Date', local: 'local', home: '← Home', newGame: 'New game',
      roomCode: 'Room code', copy: 'Copy', copied: 'Copied!', inviteLink: 'Invite link', localPlay: 'Same-device play',
      draw: '🤝 Draw!', won: '🏆 {p} wins!', lost: '😅 {p} wins', youWon: '🏆 You win!',
      waiting: '⏳ Waiting for the other player… send them the link or code', yourTurn: '🟢 Your turn', theirTurn: '🔴 {p}\'s turn…', turnOf: '{p}\'s turn',
      player: 'Player {n}', guest: 'Guest', opponent: 'Opponent',
      login: 'Log in', signup: 'Sign up', logout: 'Log out', email: 'Email', password: 'Password',
      username: 'Player name', usernameOrEmail: 'Player name or email', emailOptional: 'Email (optional)', mayor: 'Mayor', orGuest: 'or play as guest', checkEmail: 'Confirmation email sent — open it, then log in',
      wins: 'wins', losses: 'losses', draws: 'draws', account: 'My account',
      white: 'White', black: 'Black', whitePlays: 'White to move', blackPlays: 'Black to move', check: 'Check!',
      moves: 'Moves', offerDraw: 'Offer draw', drawOffered: 'Draw offered…', acceptDraw: 'Accept draw', declineDraw: 'Decline',
      opponentOffersDraw: '{p} offers a draw', resign: 'Resign', resigned: 'resigned', timeout: 'out of time', premove: 'Premove',
      checkmate: 'Checkmate', stalemate: 'Stalemate (draw)', timeControl: 'Clock', increment: 'Increment per move', sec: 's', noClock: 'No clock', min: 'min',
      arrowsHint: 'Right-click and drag to draw an arrow',
      tictactoe: 'Tic-Tac-Toe', tictactoeDesc: 'The classic. Three in a row wins.',
      connect4: 'Connect 4', connect4Desc: 'Drop a disc in a column; first to four in a row wins.',
      chess: 'Chess', chessDesc: 'Full chess: clock, move list, draw offers, premove and arrows.',
      cityhall: 'City Hall', cityhallDesc: 'You are the mayor: build your city and manage the budget.',
      voxel: 'Voxel Sandbox', voxelDesc: '3D block world: build, explore and play with friends.', voxelstrike: 'Voxel Strike', voxelstrikeDesc: 'A blocky shooter: fight bots or friends online, and blow up the blocks with grenades.', bricks: 'Brick Builder', bricksDesc: 'Pick up building bricks and build anything: houses, cars, whatever you imagine.',
      turfrush: 'Turf Rush', turfrushDesc: 'Fast multiplayer territory race.',
      pitch: 'Pitch Legends', pitchDesc: 'Football card arcade, UNO style — play live matches vs friends.',
      games: 'Games', vsBot: 'vs Bot', botName: 'Computer', easy: 'Easy', medium: 'Medium', hard: 'Hard', twoPlayers: 'Two players, one keyboard', myAccount: '👤 My account', admin: '🛡️ Admin panel', picture: 'Profile picture', changePicture: '📷 Change picture', removePicture: 'Remove picture', save: 'Save', saved: 'Saved ✓', language: 'Language', changePassword: 'Change password', currentPassword: 'Current password', newPassword: 'New password', confirmPassword: 'Confirm new password', passwordsDontMatch: 'The new passwords do not match', passwordChanged: 'Password changed ✓ (other devices were signed out)', stats: 'Stats', loginFirst: 'Log in first', deleteGame: 'Delete from my history', confirmDeleteGame: 'Delete this game from your history? (your friend still keeps it)', users: 'Users', searchUsers: 'Search by name or email…', ban: '🚫 Ban', unban: 'Unban', makeAdmin: '🛡️ Make admin', removeAdmin: 'Remove admin', deleteUser: '🗑 Delete', banReason: 'Reason for the ban? (e.g. cheating)', confirmDeleteUser: 'Delete {p}\'s account for good? This cannot be undone.', bannedBadge: 'banned', adminBadge: 'admin', adminsOnly: 'This page is for admins only', joined: 'Joined', lastSeen: 'Last seen', never: '—', you: 'you', arabic: 'العربية', english: 'English', pictureHint: 'It is shrunk automatically and saved on your account', friends: '👥 Friends', addFriend: 'Add a friend by name', send: 'Send', requests: 'Friend requests', noFriends: 'No friends yet — add someone by name', isOnline: 'online', isOffline: 'offline', fastConnect: '⚡ Play together', invitesYou: 'invites you to play', accept: 'Accept', decline: 'Decline', waitingFor: '⏳ Waiting for {p} to accept…', declined: '{p} declined', loginForFriends: 'Log in to add friends', remove: 'Remove', sent: 'Sent', pickWorld: 'Pick the world you will play in', voxelFirst: 'Open Voxel Sandbox first and create a world (while logged in), then invite your friend', remember: 'Keep me signed in for a week (otherwise you are signed out after 3 idle hours)',
      
      pin: 'Pin to the top', unpin: 'Unpin', roomMissing: 'Room not found', roomFull: 'Room is full', codeMissing: 'That code does not exist', roomFail: 'Could not create a room, try again',
    }
  };
  window.MAL3AB_VERSION = '1.0';   // the current release (the latest one is also stored in the database: app_config.release)
  let lang = 'ar';
  try { lang = localStorage.getItem('mal3ab_lang') || (navigator.language.startsWith('ar') ? 'ar' : 'en'); } catch (e) {}
  if (!STR[lang]) lang = 'ar';

  // English labels and buttons in Title Case ("Join Room", "Play Again"); sentences just start with a capital
  const SMALL = new Set(['a', 'an', 'the', 'and', 'or', 'of', 'to', 'in', 'on', 'at', 'for', 'by', 'with', 'vs', 'per', 'from', 'as', 'into', 'than', 'via']);
  const KEEP = new Set(['resigned', 'invitesYou', 'vs', 'sec', 'min', 'vs_left', 'vs_joined', 'vs_leftRoom']);   // pieces glued into the middle of a sentence
  const capWord = (w) => w.replace(/[a-z]/, (c) => c.toUpperCase());
  const capCache = {};
  window.titleCase = (s) => {
    if (typeof s !== 'string' || !/[a-z]/.test(s)) return s;
    if (capCache[s] !== undefined) return capCache[s];
    const body = s.replace(/^[^A-Za-z{]+/, ''), words = s.trim().split(/\s+/);
    let out;
    if (body.startsWith('{') || /[.?;…—]|, |https?:/.test(s.trim().replace(/(…|\.\.\.)$/, '')) || words.length > 5) out = s.replace(/^([^A-Za-z{]*)([a-z])/, (m, a, c) => a + c.toUpperCase());
    else {
      let first = true; const parts = s.split(/(\s+)/), lastIdx = parts.map((w, i) => /\S/.test(w) ? i : -1).reduce((a, b) => Math.max(a, b), -1);
      out = parts.map((w, i) => {
        if (!/[A-Za-z]/.test(w) || /[<>]/.test(w)) return w;
        const bare = w.replace(/[^A-Za-z]/g, '').toLowerCase(), small = (!first && i !== lastIdx && SMALL.has(bare)) || bare === 'vs'; first = false;
        if (small || /[A-Z0-9{@/]/.test(w.replace(/^[^A-Za-z{0-9]+/, '').charAt(0)) || /^[a-z]+\.[a-z]/.test(w)) return w;
        return w.split('-').map(capWord).join('-');
      }).join('').replace(/\b(Log|Sign) in\b/g, '$1 In');
    }
    return (capCache[s] = out);
  };
  window.t = (key, vars) => {
    let s = (STR[lang] && STR[lang][key]) || STR.ar[key] || key;
    if (lang === 'en' && !KEEP.has(key)) s = titleCase(s);
    if (vars) for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
    return s;
  };
  window.addStrings = (ar, en) => { Object.assign(STR.ar, ar || {}); Object.assign(STR.en, en || {}); };   // games add their own words
  window.getLang = () => lang;
  window.setLang = (l) => {
    lang = l;
    try { localStorage.setItem('mal3ab_lang', l); } catch (e) {}
    applyLang();
    document.dispatchEvent(new Event('langchange'));
  };
  window.applyLang = () => {
    document.documentElement.lang = lang;
    document.documentElement.dir = 'ltr';           // layout never flips; only text direction does
    document.body && document.body.classList.toggle('ar', lang === 'ar');
    document.querySelectorAll('[data-i18n]').forEach(el => el.textContent = t(el.dataset.i18n));
    document.querySelectorAll('[data-i18n-ph]').forEach(el => el.placeholder = t(el.dataset.i18nPh));
    document.querySelectorAll('[data-ver]').forEach(el => el.textContent = 'v' + window.MAL3AB_VERSION);
    document.querySelectorAll('.langbtn').forEach(b => b.textContent = lang === 'ar' ? 'English' : 'العربية');
  };
  // round profile picture (or the first letter of the name)
  window.avatarHtml = (p, size) => p && p.avatar
    ? `<img class="avatar" src="${p.avatar}" alt="" style="width:${size}px;height:${size}px">`
    : `<span class="avatar ph" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.5)}px">${((p && p.username) || '?').slice(0, 1).toUpperCase()}</span>`;
  window.langButton = () => `<button class="btn small secondary langbtn" onclick="setLang(getLang()==='ar'?'en':'ar')">${lang === 'ar' ? 'English' : 'العربية'}</button>`;
  document.addEventListener('DOMContentLoaded', applyLang);
})();
