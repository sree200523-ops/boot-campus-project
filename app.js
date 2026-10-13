const state = {
  user: null,
  balance: 248,
  weeklyCoins: 36,
  deposits: 3,
  wasteKg: 4.6,
  cheers: new Set(),
  activities: [
    { title: 'Smart bin #02', detail: 'Plastic · Yesterday, 2:14 PM', coins: 12, color: 'mint-icon', icon: '♲' },
    { title: 'Smart bin #04', detail: 'Mixed recyclables · Yesterday, 9:30 AM', coins: 8, color: 'peach-icon', icon: '♲' },
    { title: 'Weekly streak bonus', detail: 'Three days in a row · Monday', coins: 16, color: 'lilac-icon', icon: '✳' }
  ]
};

const payoutRates = {
  degradable: 12,
  biodegradable: 16,
  'non-degradable': 8
};
const accountStorageKey = 'loop-campus-accounts';

const rewards = [
  { id: 'coffee', name: 'Coffee on us', description: 'A cup from Little Bean Cafe.', cost: 90, tag: 'CAMPUS FAVORITE', art: 'coffee', icon: '☕' },
  { id: 'bookshop', name: 'Bookshop credit', description: 'A little something for your next read.', cost: 180, tag: 'FOR YOUR NEXT CHAPTER', art: 'book', icon: '▤' },
  { id: 'lunch', name: 'Lunch, sorted', description: '$5 to spend at the student cafe.', cost: 260, tag: 'GOOD FOOD ENERGY', art: 'lunch', icon: '✿' },
  { id: 'tree', name: 'Plant a campus tree', description: 'Put down roots right here on campus.', cost: 120, tag: 'GIVE SOMETHING BACK', art: 'market', icon: '♧' },
  { id: 'market', name: 'Farmers market tote', description: 'A reusable carry-all for market days.', cost: 150, tag: 'REUSE, REPEAT', art: 'mug', icon: '▱' },
  { id: 'surprise', name: 'Mystery goodie bag', description: 'A surprise bundle from local makers.', cost: 220, tag: 'A LITTLE MYSTERY', art: 'surprise', icon: '✳' }
];

const campusProfiles = [
  { id: 'amara', handle: 'amaragrows', name: 'Amara Johnson', initials: 'AJ', coins: 186, deposits: 42, diverted: '12.8 kg', bio: 'Plant person, refill enthusiast, usually found near the community garden.', badges: ['♧ Garden regular', '✳ 7-day streak'], recent: [['Glass, smart bin #02', '+18'], ['Weekly streak bonus', '+16']] },
  { id: 'max', handle: 'maxrecycles', name: 'Max Kim', initials: 'MK', coins: 142, deposits: 35, diverted: '9.2 kg', bio: 'Trying to leave every place a little better than I found it.', badges: ['♲ Bin regular', '↗ Early bird'], recent: [['Aluminum, smart bin #01', '+14'], ['Coffee cup, smart bin #04', '+8']] },
  { id: 'priya', handle: 'priyap', name: 'Priya Shah', initials: 'PS', coins: 119, deposits: 28, diverted: '7.4 kg', bio: 'Small habits, big ripple. See you at the refill station.', badges: ['✳ 5-day streak', '♧ Refill friend'], recent: [['Plastic, smart bin #03', '+12'], ['Paper, smart bin #02', '+10']] },
  { id: 'leo', handle: 'leaveswithleo', name: 'Leo Martinez', initials: 'LM', coins: 31, deposits: 11, diverted: '3.1 kg', bio: 'Library regular. Carrying a reusable bottle since orientation.', badges: ['◉ New to the loop', '♲ Bin regular'], recent: [['Mixed recyclables, smart bin #04', '+10'], ['Plastic, smart bin #01', '+8']] },
  { id: 'nina', handle: 'ninamakes', name: 'Nina Brooks', initials: 'NB', coins: 27, deposits: 9, diverted: '2.6 kg', bio: 'Design student collecting good ideas and empty cans.', badges: ['✳ 3-day streak', '♲ Bin regular'], recent: [['Aluminum, smart bin #03', '+14'], ['Paper, smart bin #02', '+8']] }
];

const elements = {
  loginScreen: document.querySelector('#login-screen'),
  app: document.querySelector('#app'),
  loginForm: document.querySelector('#login-form'),
  emailField: document.querySelector('#login-email-field'),
  email: document.querySelector('#email'),
  usernameField: document.querySelector('#login-username-field'),
  username: document.querySelector('#username'),
  verificationField: document.querySelector('#verification-field'),
  verificationCode: document.querySelector('#verification-code'),
  verificationNote: document.querySelector('#verification-note'),
  verificationDemo: document.querySelector('#verification-demo'),
  demoCode: document.querySelector('#demo-code'),
  loginIntro: document.querySelector('#login-intro'),
  loginSubmitLabel: document.querySelector('#login-submit-label'),
  loginFeedback: document.querySelector('#login-feedback'),
  usernameList: document.querySelector('#saved-usernames'),
  volumeSlider: document.querySelector('#volume-slider'),
  volumeValue: document.querySelector('#volume-value'),
  payoutValue: document.querySelector('#payout-value'),
  coinBalance: document.querySelector('#coin-balance'),
  binFill: document.querySelector('#bin-fill'),
  toast: document.querySelector('#toast'),
  rewardGrid: document.querySelector('#reward-grid'),
  leaderboard: document.querySelector('#leaderboard'),
  profileDialog: document.querySelector('#profile-dialog'),
  profileContent: document.querySelector('#profile-content'),
  successDialog: document.querySelector('#success-dialog')
};

function loadSavedAccounts() {
  try {
    const accounts = JSON.parse(localStorage.getItem(accountStorageKey) || '[]');
    return Array.isArray(accounts)
      ? accounts.filter((account) => account && /^[a-zA-Z0-9_]{3,18}$/.test(account.username))
      : [];
  } catch {
    return [];
  }
}

const savedAccounts = loadSavedAccounts();
let loginMode = savedAccounts.length ? 'returning' : 'first';
let pendingRegistration = null;

function renderSavedUsernames() {
  elements.usernameList.replaceChildren();
  savedAccounts.forEach((account) => {
    const option = document.createElement('option');
    option.value = account.username;
    elements.usernameList.append(option);
  });
  document.querySelector('#returning-mode').disabled = savedAccounts.length === 0;
}

function setLoginMode(mode) {
  loginMode = mode;
  pendingRegistration = null;
  const returning = mode === 'returning';
  elements.emailField.hidden = returning;
  elements.usernameField.hidden = false;
  elements.verificationField.hidden = true;
  elements.verificationCode.required = false;
  elements.verificationCode.value = '';
  elements.verificationDemo.hidden = true;
  document.querySelector('.login-mode-switch').hidden = false;
  elements.email.required = !returning;
  elements.username.required = true;
  elements.username.autocomplete = returning ? 'username' : 'nickname';
  elements.username.placeholder = returning ? 'your username' : 'greenthumb';
  document.querySelector('#username-label').textContent = returning ? 'Your username' : 'Pick a public username';
  document.querySelector('#login-intro').textContent = returning
    ? 'Welcome back. Your username is all you need.'
    : 'Set up once with your email. Next time, your username is all you need.';
  document.querySelector('#login-hint').textContent = returning
    ? 'Choose a username saved on this device.'
    : 'This is how your campus community will find you.';
  document.querySelector('#login-submit-label').textContent = returning ? 'Continue with username' : 'Start my loop';
  document.querySelectorAll('[data-login-mode]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.loginMode === mode));
  });
  elements.loginFeedback.hidden = true;
  elements.loginFeedback.textContent = '';
}

function showLoginFeedback(message) {
  elements.loginFeedback.textContent = message;
  elements.loginFeedback.hidden = false;
}

function maskEmail(email) {
  const [name, domain] = email.split('@');
  return `${name.slice(0, 1)}***@${domain}`;
}

function beginEmailVerification(email, username) {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  pendingRegistration = { email, username, code };
  elements.emailField.hidden = true;
  elements.usernameField.hidden = true;
  elements.email.required = false;
  elements.username.required = false;
  elements.verificationField.hidden = false;
  elements.verificationCode.required = true;
  elements.verificationCode.value = '';
  elements.verificationNote.textContent = `For this prototype, enter the demo code shown below for ${maskEmail(email)}.`;
  elements.demoCode.textContent = code;
  elements.verificationDemo.hidden = false;
  elements.loginIntro.textContent = 'One quick check to link your campus email to your username.';
  elements.loginSubmitLabel.textContent = 'Verify email and join';
  document.querySelector('.login-mode-switch').hidden = true;
  elements.loginFeedback.hidden = true;
  elements.verificationCode.focus();
}

function persistAccount(account) {
  const existingIndex = savedAccounts.findIndex((saved) => saved.username.toLowerCase() === account.username.toLowerCase());
  if (existingIndex === -1) savedAccounts.push(account);
  else savedAccounts[existingIndex] = account;
  try {
    localStorage.setItem(accountStorageKey, JSON.stringify(savedAccounts));
    renderSavedUsernames();
    return true;
  } catch {
    return false;
  }
}

function saveCurrentAccount() {
  if (!state.user) return;
  persistAccount({
    username: state.user.handle,
    email: state.user.email,
    balance: state.balance,
    weeklyCoins: state.weeklyCoins,
    weeklyDeposits: state.deposits,
    totalDeposits: state.user.deposits,
    wasteKg: state.wasteKg,
    activities: state.activities
  });
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('visible');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => elements.toast.classList.remove('visible'), 2600);
}

function updateBalance() {
  elements.coinBalance.textContent = state.balance;
  document.querySelector('#rewards-balance').textContent = state.balance;
  document.querySelector('#balance-gain').textContent = `+${state.weeklyCoins} this week`;
  renderRewards();
  renderLeaderboard();
}

function openApp(account) {
  const username = account.username;
  state.balance = Number.isFinite(account.balance) ? account.balance : 248;
  state.weeklyCoins = Number.isFinite(account.weeklyCoins) ? account.weeklyCoins : 36;
  state.deposits = Number.isFinite(account.weeklyDeposits) ? account.weeklyDeposits : 3;
  state.wasteKg = Number.isFinite(account.wasteKg) ? account.wasteKg : 4.6;
  state.activities = Array.isArray(account.activities) ? account.activities : state.activities;
  state.cheers = new Set();
  state.user = {
    id: 'you',
    handle: username,
    name: username,
    email: account.email || '',
    initials: username.slice(0, 1).toUpperCase(),
    coins: state.weeklyCoins,
    deposits: Number.isFinite(account.totalDeposits) ? account.totalDeposits : 14,
    diverted: `${state.wasteKg.toFixed(1)} kg`,
    bio: 'Making small moves for a greener campus. See you at the smart bins.',
    badges: ['✳ 3-day streak', '♲ Bin regular'],
    recent: state.activities.slice(0, 2).map((activity) => [activity.title, `+${activity.coins}`])
  };

  elements.loginScreen.hidden = true;
  elements.app.hidden = false;
  document.querySelector('#greeting-name').textContent = username;
  document.querySelector('#sidebar-username').textContent = `@${username}`;
  document.querySelector('#sidebar-avatar').textContent = state.user.initials;
  document.querySelector('#topbar-profile').textContent = state.user.initials;
  document.querySelector('#streak-count').textContent = '3';
  document.querySelector('#waste-total').textContent = `${state.wasteKg.toFixed(1)} kg`;
  document.querySelector('.impact-caption').textContent = `${Math.min(state.deposits, 5)} of 5 deposits this week`;
  document.querySelector('.meter-fill').style.width = `${Math.min(state.deposits / 5, 1) * 100}%`;
  document.querySelector('.meter-track').style.left = `${Math.min(state.deposits / 5, 1) * 100}%`;
  updateBalance();
  renderActivities();
}

function showView(viewName) {
  document.querySelectorAll('.view-panel').forEach((panel) => {
    const active = panel.id === `${viewName}-view`;
    panel.hidden = !active;
    panel.classList.toggle('active', active);
  });
  document.querySelectorAll('[data-view]').forEach((button) => {
    button.classList.toggle('active', button.dataset.view === viewName);
  });
  if (viewName === 'rewards') renderRewards();
  if (viewName === 'community') renderLeaderboard();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updatePayout() {
  const volume = Number(elements.volumeSlider.value);
  const category = document.querySelector('input[name="trash-category"]:checked');
  const payout = Math.round(volume * payoutRates[category.value]);
  const progress = ((volume - Number(elements.volumeSlider.min)) / (Number(elements.volumeSlider.max) - Number(elements.volumeSlider.min))) * 100;
  elements.volumeValue.textContent = volume.toFixed(2).replace(/0$/, '').replace(/\.0$/, '');
  elements.payoutValue.textContent = payout;
  elements.binFill.style.width = `${Math.max(12, progress)}%`;
  elements.volumeSlider.style.setProperty('--range-progress', `${progress}%`);
}

function renderActivities() {
  const list = document.querySelector('#activity-list');
  list.replaceChildren();
  state.activities.slice(0, 4).forEach((activity) => {
    const article = document.createElement('article');
    article.className = 'activity-item';
    const mark = document.createElement('span');
    mark.className = `activity-mark ${activity.color}`;
    mark.setAttribute('aria-hidden', 'true');
    mark.textContent = activity.icon;
    const detail = document.createElement('span');
    detail.className = 'activity-detail';
    const title = document.createElement('strong');
    title.textContent = activity.title;
    const description = document.createElement('small');
    description.textContent = activity.detail;
    detail.append(title, description);
    const coins = document.createElement('span');
    coins.className = 'activity-coins';
    coins.append(document.createTextNode(`+${activity.coins} `));
    const coin = document.createElement('i');
    coin.textContent = '●';
    coins.append(coin);
    article.append(mark, detail, coins);
    list.append(article);
  });
}

function renderRewards() {
  if (!elements.rewardGrid || !state.user) return;
  elements.rewardGrid.replaceChildren();
  rewards.forEach((reward) => {
    const card = document.createElement('article');
    card.className = 'reward-card';
    const art = document.createElement('div');
    art.className = `reward-art ${reward.art}`;
    art.setAttribute('aria-hidden', 'true');
    const artIcon = document.createElement('span');
    artIcon.textContent = reward.icon;
    art.append(artIcon);
    const meta = document.createElement('div');
    meta.className = 'reward-meta';
    const tag = document.createElement('span');
    tag.className = 'reward-tag';
    tag.textContent = reward.tag;
    meta.append(tag);
    const heading = document.createElement('h2');
    heading.textContent = reward.name;
    const description = document.createElement('p');
    description.textContent = reward.description;
    const bottom = document.createElement('div');
    bottom.className = 'reward-card-bottom';
    const cost = document.createElement('span');
    cost.className = 'reward-cost';
    cost.append(document.createTextNode(`${reward.cost} `));
    const costCoin = document.createElement('span');
    costCoin.textContent = '●';
    cost.append(costCoin);
    const claim = document.createElement('button');
    claim.className = 'button button-dark claim-button';
    claim.type = 'button';
    claim.dataset.reward = reward.id;
    claim.disabled = state.balance < reward.cost;
    claim.textContent = claim.disabled ? 'Not enough coins' : 'Claim reward ↗';
    bottom.append(cost, claim);
    card.append(art, meta, heading, description, bottom);
    elements.rewardGrid.append(card);
  });
}

function renderLeaderboard() {
  if (!elements.leaderboard || !state.user) return;
  elements.leaderboard.replaceChildren();
  const ownProfile = { ...state.user, coins: state.weeklyCoins };
  const profiles = [...campusProfiles, ownProfile].sort((first, second) => second.coins - first.coins);
  profiles.forEach((profile, index) => {
    const row = document.createElement('article');
    row.className = 'leader-row';
    const rank = document.createElement('span');
    rank.className = `leader-rank${index < 3 ? ' top-rank' : ''}`;
    rank.textContent = String(index + 1).padStart(2, '0');
    const avatar = document.createElement('span');
    avatar.className = `leader-avatar avatar-${index % 5}`;
    avatar.textContent = profile.initials;
    const identity = document.createElement('span');
    identity.className = 'leader-name';
    const name = document.createElement('strong');
    name.textContent = profile.id === 'you' ? `@${profile.handle} (you)` : profile.name;
    const handle = document.createElement('small');
    handle.textContent = `@${profile.handle} · ${profile.deposits} deposits`;
    identity.append(name, handle);
    const score = document.createElement('span');
    score.className = 'leader-score';
    score.append(document.createTextNode(`${profile.coins} `));
    const coin = document.createElement('span');
    coin.textContent = '●';
    score.append(coin);
    const viewButton = document.createElement('button');
    viewButton.className = 'profile-view-button';
    viewButton.type = 'button';
    viewButton.dataset.profile = profile.id;
    viewButton.textContent = 'View profile ↗';
    row.append(rank, avatar, identity, score, viewButton);
    elements.leaderboard.append(row);
  });
}

function openProfile(profileId) {
  const profile = profileId === 'you' ? { ...state.user, coins: state.weeklyCoins, diverted: `${state.wasteKg.toFixed(1)} kg` } : campusProfiles.find((person) => person.id === profileId);
  if (!profile) return;
  const isOwn = profile.id === 'you';
  const wasCheered = state.cheers.has(profile.id);
  elements.profileContent.replaceChildren();

  const cover = document.createElement('div');
  cover.className = 'profile-cover';
  const body = document.createElement('div');
  body.className = 'profile-body';
  const avatar = document.createElement('div');
  avatar.className = 'profile-avatar-large';
  avatar.textContent = profile.initials;
  const heading = document.createElement('h2');
  heading.id = 'profile-title';
  heading.textContent = profile.name;
  const handle = document.createElement('p');
  handle.className = 'profile-handle';
  handle.textContent = `@${profile.handle} · TKEC Campus`;
  const bio = document.createElement('p');
  bio.className = 'profile-bio';
  bio.textContent = profile.bio;
  const stats = document.createElement('div');
  stats.className = 'profile-stats';
  [
    [String(profile.coins), 'WEEKLY COINS'],
    [String(profile.deposits), 'DEPOSITS'],
    [profile.diverted, 'DIVERTED']
  ].forEach(([value, label]) => {
    const item = document.createElement('div');
    item.className = 'profile-stat';
    const strong = document.createElement('strong');
    strong.textContent = value;
    const caption = document.createElement('span');
    caption.textContent = label;
    item.append(strong, caption);
    stats.append(item);
  });
  const badges = document.createElement('div');
  badges.className = 'profile-badges';
  profile.badges.forEach((badge) => {
    const item = document.createElement('span');
    item.className = 'profile-badge';
    item.textContent = badge;
    badges.append(item);
  });
  const activityHeading = document.createElement('h3');
  activityHeading.className = 'profile-activity-title';
  activityHeading.textContent = 'Recently in the loop';
  body.append(avatar, heading, handle, bio, stats, badges, activityHeading);
  profile.recent.forEach(([title, coins]) => {
    const item = document.createElement('div');
    item.className = 'profile-recent';
    const activity = document.createElement('span');
    activity.textContent = title;
    const earned = document.createElement('span');
    earned.textContent = coins;
    item.append(activity, earned);
    body.append(item);
  });
  if (!isOwn) {
    const cheer = document.createElement('button');
    cheer.type = 'button';
    cheer.className = 'button button-dark cheer-button';
    cheer.dataset.cheer = profile.id;
    cheer.textContent = wasCheered ? 'Cheered ✓' : 'Send a little cheer ✳';
    body.append(cheer);
  }
  elements.profileContent.append(cover, body);
  elements.profileDialog.showModal();
}

function playConfetti() {
  const container = document.querySelector('.success-confetti');
  container.replaceChildren();
  const colors = ['#c6f36b', '#f1a38b', '#83b4a0', '#efce69', '#b5a7e4'];
  for (let index = 0; index < 24; index += 1) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.style.backgroundColor = colors[index % colors.length];
    piece.style.setProperty('--dx', `${Math.round(Math.cos(index * 0.9) * (60 + (index % 4) * 14))}px`);
    piece.style.setProperty('--dy', `${Math.round(Math.sin(index * 0.9) * (55 + (index % 5) * 12))}px`);
    piece.style.setProperty('--spin', `${index * 73}deg`);
    piece.style.animationDelay = `${(index % 6) * 22}ms`;
    document.querySelector('.success-confetti').append(piece);
  }
}

document.querySelectorAll('[data-login-mode]').forEach((button) => {
  button.addEventListener('click', () => setLoginMode(button.dataset.loginMode));
});

elements.loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!elements.loginForm.reportValidity()) return;
  const username = elements.username.value.trim().replace(/^@/, '');
  if (loginMode === 'returning') {
    const account = savedAccounts.find((saved) => saved.username.toLowerCase() === username.toLowerCase());
    if (!account) {
      showLoginFeedback('That username is not registered on this device. Check it or choose First visit to register.');
      return;
    }
    openApp(account);
    return;
  }

  if (pendingRegistration) {
    if (elements.verificationCode.value.trim() !== pendingRegistration.code) {
      showLoginFeedback('That code does not match. Check the prototype code and try again.');
      return;
    }
    const account = {
      username: pendingRegistration.username,
      email: pendingRegistration.email,
      balance: 248,
      weeklyCoins: 36,
      weeklyDeposits: 3,
      totalDeposits: 14,
      wasteKg: 4.6,
      activities: state.activities.map((activity) => ({ ...activity }))
    };
    pendingRegistration = null;
    if (!persistAccount(account)) showToast('Browser storage is unavailable; this demo account may not persist.');
    openApp(account);
    return;
  }

  const email = elements.email.value.trim().toLowerCase();
  const existingAccount = savedAccounts.find((saved) => saved.username.toLowerCase() === username.toLowerCase());
  if (existingAccount) {
    showLoginFeedback('That username is already in use on this device. Choose Returning to sign in.');
    return;
  }
  const existingEmail = savedAccounts.find((saved) => saved.email && saved.email.toLowerCase() === email);
  if (existingEmail) {
    showLoginFeedback('That email is already registered. Choose Returning and enter its username.');
    return;
  }
  beginEmailVerification(email, username);
});

document.querySelector('#back-to-registration').addEventListener('click', () => setLoginMode('first'));
elements.volumeSlider.addEventListener('input', updatePayout);
document.querySelectorAll('input[name="trash-category"]').forEach((input) => {
  input.addEventListener('change', updatePayout);
});

document.querySelector('#deposit-button').addEventListener('click', () => {
  const volume = Number(elements.volumeSlider.value);
  const category = document.querySelector('input[name="trash-category"]:checked');
  const categoryLabel = category.dataset.label;
  const payout = Math.round(volume * payoutRates[category.value]);
  state.balance += payout;
  state.weeklyCoins += payout;
  state.deposits += 1;
  state.wasteKg += volume * 0.18;
  state.user.deposits += 1;
  state.user.coins = state.weeklyCoins;
  state.user.diverted = `${state.wasteKg.toFixed(1)} kg`;
  state.activities.unshift({
    title: `${categoryLabel} · smart bin #04`,
    detail: `${volume.toFixed(2).replace(/0$/, '').replace(/\.0$/, '')} L · Just now`,
    coins: payout,
    color: 'mint-icon',
    icon: '♲'
  });
  state.user.recent = state.activities.slice(0, 2).map((activity) => [activity.title, `+${activity.coins}`]);
  document.querySelector('#waste-total').textContent = `${state.wasteKg.toFixed(1)} kg`;
  document.querySelector('.impact-caption').textContent = `${Math.min(state.deposits, 5)} of 5 deposits this week`;
  document.querySelector('.meter-fill').style.width = `${Math.min(state.deposits / 5, 1) * 100}%`;
  const meterMark = document.querySelector('.meter-track');
  meterMark.style.left = `${Math.min(state.deposits / 5, 1) * 100}%`;
  saveCurrentAccount();
  renderActivities();
  updateBalance();
  showToast(`${categoryLabel} deposit logged. +${payout} loop coins added!`);
});

document.querySelectorAll('[data-view]').forEach((button) => {
  button.addEventListener('click', () => showView(button.dataset.view));
});

document.querySelector('#profile-menu').addEventListener('click', () => openProfile('you'));
document.querySelector('#topbar-profile').addEventListener('click', () => openProfile('you'));
document.querySelector('#public-profile-shortcut').addEventListener('click', () => openProfile('you'));

elements.rewardGrid.addEventListener('click', (event) => {
  const button = event.target.closest('[data-reward]');
  if (!button || button.disabled) return;
  const reward = rewards.find((item) => item.id === button.dataset.reward);
  if (!reward || state.balance < reward.cost) return;
  state.balance -= reward.cost;
  state.user.coins = state.weeklyCoins;
  saveCurrentAccount();
  updateBalance();
  document.querySelector('#success-title').innerHTML = 'That\'s a<br><span>good choice.</span>';
  document.querySelector('#success-copy').textContent = `${reward.name} is yours. Your ${reward.cost} loop coins are headed to a good place.`;
  playConfetti();
  elements.successDialog.showModal();
});

elements.leaderboard.addEventListener('click', (event) => {
  const button = event.target.closest('[data-profile]');
  if (button) openProfile(button.dataset.profile);
});

elements.profileContent.addEventListener('click', (event) => {
  const button = event.target.closest('[data-cheer]');
  if (!button) return;
  const profileId = button.dataset.cheer;
  if (state.cheers.has(profileId)) {
    state.cheers.delete(profileId);
    button.textContent = 'Send a little cheer ✳';
    showToast('Cheer taken back. You can send it again anytime.');
  } else {
    state.cheers.add(profileId);
    button.textContent = 'Cheered ✓';
    showToast('A little campus cheer sent their way!');
  }
});

document.querySelectorAll('[data-close-dialog]').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog').close());
});

document.querySelectorAll('dialog').forEach((dialog) => {
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
});

renderSavedUsernames();
setLoginMode(loginMode);
updatePayout();
