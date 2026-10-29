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
      voxel: 'Voxel Sandbox', voxelDesc: 'عالم مكعبات ثلاثي الأبعاد: ابني واستكشف والعب مع أصحابك.',
      turfrush: 'Turf Rush', turfrushDesc: 'سباق سيطرة على الأرض، سريع ومتعدد اللاعبين.',
      pitch: 'Pitch Legends', pitchDesc: 'أركيد كورة بكروت على طريقة UNO — والعب ماتش لايف ضد صاحبك.',
      games: 'الألعاب', friends: '👥 الأصحاب', addFriend: 'ضيف صاحب باسمه', send: 'إرسال', requests: 'طلبات صداقة', noFriends: 'لسه مفيش أصحاب — ضيف حد باسمه', online: 'أونلاين', offline: 'مش أونلاين', fastConnect: '⚡ العب معاه', invitesYou: 'بيدعوك تلعب', accept: 'قبول', decline: 'رفض', waitingFor: '⏳ مستني {p} يقبل…', declined: '{p} رفض الدعوة', loginForFriends: 'سجّل دخول عشان تضيف أصحاب', remove: 'حذف', sent: 'اتبعت', pickWorld: 'اختار العالم اللي هتلعبوا فيه', voxelFirst: 'افتح Voxel Sandbox الأول واعمل عالم (وإنت مسجّل دخول) وبعدين ادعي صاحبك', remember: 'خليني مسجّل لمدة أسبوع (من غيرها بتخرج بعد ٣ ساعات من غير لعب)',
      
      roomMissing: 'الغرفة مش موجودة', roomFull: 'الغرفة مليانة', codeMissing: 'الكود ده مش موجود', roomFail: 'مقدرتش أعمل غرفة، جرّب تاني',
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
      voxel: 'Voxel Sandbox', voxelDesc: '3D block world: build, explore and play with friends.',
      turfrush: 'Turf Rush', turfrushDesc: 'Fast multiplayer territory race.',
      pitch: 'Pitch Legends', pitchDesc: 'Football card arcade, UNO style — play live matches vs friends.',
      games: 'Games', friends: '👥 Friends', addFriend: 'Add a friend by name', send: 'Send', requests: 'Friend requests', noFriends: 'No friends yet — add someone by name', online: 'online', offline: 'offline', fastConnect: '⚡ Play together', invitesYou: 'invites you to play', accept: 'Accept', decline: 'Decline', waitingFor: '⏳ Waiting for {p} to accept…', declined: '{p} declined', loginForFriends: 'Log in to add friends', remove: 'Remove', sent: 'Sent', pickWorld: 'Pick the world you will play in', voxelFirst: 'Open Voxel Sandbox first and create a world (while logged in), then invite your friend', remember: 'Keep me signed in for a week (otherwise you are signed out after 3 idle hours)',
      
      roomMissing: 'Room not found', roomFull: 'Room is full', codeMissing: 'That code does not exist', roomFail: 'Could not create a room, try again',
    }
  };
  let lang = 'ar';
  try { lang = localStorage.getItem('mal3ab_lang') || (navigator.language.startsWith('ar') ? 'ar' : 'en'); } catch (e) {}
  if (!STR[lang]) lang = 'ar';

  window.t = (key, vars) => {
    let s = (STR[lang] && STR[lang][key]) || STR.ar[key] || key;
    if (vars) for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
    return s;
  };
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
    document.querySelectorAll('.langbtn').forEach(b => b.textContent = lang === 'ar' ? 'English' : 'العربية');
  };
  window.langButton = () => `<button class="btn small secondary langbtn" onclick="setLang(getLang()==='ar'?'en':'ar')">${lang === 'ar' ? 'English' : 'العربية'}</button>`;
  document.addEventListener('DOMContentLoaded', applyLang);
})();
