/* eslint-disable prefer-destructuring, no-nested-ternary, jsx-a11y/label-has-associated-control, react/no-array-index-key */
import Head from "next/head";
import { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

const accounts = [
  { id: "host", role: "host", name: "Ведущий" },
  { id: "player1", role: "player", name: "Игрок 1" },
  { id: "player2", role: "player", name: "Игрок 2" },
  { id: "player3", role: "player", name: "Игрок 3" },
];

const defaultRounds = [
  {
    id: 1,
    name: "Раунд 1",
    values: [100, 200, 300, 400, 500],
    categories: [
      {
        title: "Машины",
        questions: [
          { price: 100, question: "Самая известная немецкая марка с логотипом из четырёх колец.", answer: "Audi" },
          { price: 200, question: "Тип кузова автомобиля с отдельным багажником.", answer: "Седан" },
          { price: 300, question: "Как называется прибор, показывающий скорость автомобиля?", answer: "Спидометр" },
          { price: 400, question: "Страна происхождения марки Toyota.", answer: "Япония" },
          { price: 500, question: "Как называется гонка на длинную дистанцию на выносливость, часто связанная с Ле-Маном?", answer: "Эндюранс" },
        ],
      },
      {
        title: "Кино",
        questions: [
          { price: 100, question: "Как называется место, где показывают фильмы?", answer: "Кинотеатр" },
          { price: 200, question: "Кто снимает фильм и руководит процессом?", answer: "Режиссёр" },
          { price: 300, question: "Фильм о мальчике-волшебнике по книгам Роулинг.", answer: "Гарри Поттер" },
          { price: 400, question: "Как называется продолжение фильма?", answer: "Сиквел" },
          { price: 500, question: "Высшая кинопремия США в виде золотой статуэтки.", answer: "Оскар" },
        ],
      },
      {
        title: "Спорт",
        questions: [
          { price: 100, question: "Сколько игроков в футбольной команде на поле?", answer: "11" },
          { price: 200, question: "Спортивный снаряд, который бросают в баскетбольное кольцо.", answer: "Мяч" },
          { price: 300, question: "Как называется начало партии в шахматах?", answer: "Дебют" },
          { price: 400, question: "В каком виде спорта используется ракетка и волан?", answer: "Бадминтон" },
          { price: 500, question: "Главный международный турнир сборных по футболу, проходящий раз в 4 года.", answer: "Чемпионат мира" },
        ],
      },
      {
        title: "Наука",
        questions: [
          { price: 100, question: "Планета, на которой мы живём.", answer: "Земля" },
          { price: 200, question: "Как называется вода в твёрдом состоянии?", answer: "Лёд" },
          { price: 300, question: "Прибор для наблюдения за звёздами.", answer: "Телескоп" },
          { price: 400, question: "Самая маленькая частица химического элемента.", answer: "Атом" },
          { price: 500, question: "Процесс, при котором растения получают энергию от света.", answer: "Фотосинтез" },
        ],
      },
      {
        title: "Музыка",
        questions: [
          { price: 100, question: "Сколько нот в классической гамме?", answer: "7" },
          { price: 200, question: "Инструмент с чёрными и белыми клавишами.", answer: "Пианино" },
          { price: 300, question: "Человек, который пишет музыку.", answer: "Композитор" },
          { price: 400, question: "Как называется большая группа музыкантов, играющих вместе?", answer: "Оркестр" },
          { price: 500, question: "Музыкальный стиль, родившийся в Новом Орлеане.", answer: "Джаз" },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Раунд 2",
    values: [200, 400, 600, 800, 1000],
    categories: [
      {
        title: "История",
        questions: [
          { price: 200, question: "Как назывался правитель Древнего Египта?", answer: "Фараон" },
          { price: 400, question: "Город, в котором находился Колизей.", answer: "Рим" },
          { price: 600, question: "Как назывался путь, связывавший Восток и Запад для торговли?", answer: "Шёлковый путь" },
          { price: 800, question: "Первый человек в космосе.", answer: "Юрий Гагарин" },
          { price: 1000, question: "Год начала Второй мировой войны.", answer: "1939" },
        ],
      },
      {
        title: "Технологии",
        questions: [
          { price: 200, question: "Устройство для ввода текста в компьютер.", answer: "Клавиатура" },
          { price: 400, question: "Как называется всемирная сеть?", answer: "Интернет" },
          { price: 600, question: "Программа для просмотра сайтов.", answer: "Браузер" },
          { price: 800, question: "Как называется память, которая очищается при выключении компьютера?", answer: "Оперативная память" },
          { price: 1000, question: "Система управления версиями, популярная у разработчиков.", answer: "Git" },
        ],
      },
      {
        title: "География",
        questions: [
          { price: 200, question: "Самый большой океан на Земле.", answer: "Тихий океан" },
          { price: 400, question: "Столица Франции.", answer: "Париж" },
          { price: 600, question: "Самая длинная река в мире по школьной версии.", answer: "Нил" },
          { price: 800, question: "Горы, разделяющие Европу и Азию в России.", answer: "Урал" },
          { price: 1000, question: "Материк, на котором находится Сахара.", answer: "Африка" },
        ],
      },
      {
        title: "Игры",
        questions: [
          { price: 200, question: "Сколько клеток на шахматной доске?", answer: "64" },
          { price: 400, question: "Консоль компании Sony.", answer: "PlayStation" },
          { price: 600, question: "Игра, где строят мир из блоков.", answer: "Minecraft" },
          { price: 800, question: "Жанр игр Dota 2 и League of Legends.", answer: "MOBA" },
          { price: 1000, question: "Как называется главный персонаж игры, управляемый пользователем?", answer: "Персонаж" },
        ],
      },
      {
        title: "Еда",
        questions: [
          { price: 200, question: "Итальянское блюдо из теста, соуса и сыра.", answer: "Пицца" },
          { price: 400, question: "Какой продукт пчёлы делают из нектара?", answer: "Мёд" },
          { price: 600, question: "Японское блюдо из риса и рыбы.", answer: "Суши" },
          { price: 800, question: "Французская выпечка в форме полумесяца.", answer: "Круассан" },
          { price: 1000, question: "Основной ингредиент гуакамоле.", answer: "Авокадо" },
        ],
      },
    ],
  },
  {
    id: 3,
    name: "Раунд 3",
    values: [300, 600, 900, 1200, 1500],
    categories: [
      {
        title: "Литература",
        questions: [
          { price: 300, question: "Кто написал 'Евгения Онегина'?", answer: "Пушкин" },
          { price: 600, question: "Автор романа '1984'.", answer: "Джордж Оруэлл" },
          { price: 900, question: "Как называется список произведений книги?", answer: "Оглавление" },
          { price: 1200, question: "Литературный жанр произведения с рифмой и ритмом.", answer: "Стихотворение" },
          { price: 1500, question: "Автор 'Войны и мира'.", answer: "Лев Толстой" },
        ],
      },
      {
        title: "Космос",
        questions: [
          { price: 300, question: "Естественный спутник Земли.", answer: "Луна" },
          { price: 600, question: "Звезда в центре Солнечной системы.", answer: "Солнце" },
          { price: 900, question: "Как называется камень, упавший из космоса на Землю?", answer: "Метеорит" },
          { price: 1200, question: "Планета с самыми известными кольцами.", answer: "Сатурн" },
          { price: 1500, question: "Аппарат для выхода на орбиту с экипажем или грузом.", answer: "Космический корабль" },
        ],
      },
      {
        title: "Языки",
        questions: [
          { price: 300, question: "На каком языке говорят в Бразилии?", answer: "Португальский" },
          { price: 600, question: "Сколько букв в русском алфавите?", answer: "33" },
          { price: 900, question: "Как называется перевод слова без изменения написания, например computer -> компьютер?", answer: "Транслитерация" },
          { price: 1200, question: "Язык, который часто используют для веб-страниц вместе с HTML и CSS.", answer: "JavaScript" },
          { price: 1500, question: "Что изучает лингвистика?", answer: "Язык" },
        ],
      },
      {
        title: "Природа",
        questions: [
          { price: 300, question: "Как называется дерево с белым стволом?", answer: "Берёза" },
          { price: 600, question: "Самое быстрое наземное животное.", answer: "Гепард" },
          { price: 900, question: "Как называется смена воды на небе и обратно в природе?", answer: "Круговорот воды" },
          { price: 1200, question: "Животное, которое спит всю зиму в спячке и любит мёд в сказках.", answer: "Медведь" },
          { price: 1500, question: "Наука о взаимодействии живых организмов и среды.", answer: "Экология" },
        ],
      },
      {
        title: "Разное",
        questions: [
          { price: 300, question: "Сколько дней в високосном году?", answer: "366" },
          { price: 600, question: "Как называется фигура с тремя сторонами?", answer: "Треугольник" },
          { price: 900, question: "Предмет, по которому определяют время на руке.", answer: "Часы" },
          { price: 1200, question: "Что тяжелее: килограмм железа или килограмм ваты?", answer: "Одинаково" },
          { price: 1500, question: "Как называется короткий сигнал перед началом ответа в игре на скорость?", answer: "Сигнал" },
        ],
      },
    ],
  },
];

const defaultFinalRound = {
  categories: [
    "История",
    "Кино",
    "Музыка",
    "Спорт",
    "Наука",
    "География",
    "Литература",
    "Технологии",
    "Природа",
    "Искусство",
  ],
  question: "Назовите самый большой океан на Земле.",
  answer: "Тихий океан",
};

function cloneRounds(rounds) {
  return JSON.parse(JSON.stringify(rounds));
}

function cloneFinalRound(finalRound) {
  return JSON.parse(JSON.stringify(finalRound));
}

function createDefaultBuzzState() {
  return {
    lockedBy: null,
    active: false,
    availableAt: null,
    blockedPlayers: [],
    disabledPlayers: [],
    forcedPlayerId: null,
  };
}

function createPlayersMap() {
  return {
    player1: { connected: false, nickname: "Игрок 1" },
    player2: { connected: false, nickname: "Игрок 2" },
    player3: { connected: false, nickname: "Игрок 3" },
  };
}

function createInitialOpenedState(rounds) {
  return rounds.reduce((acc, round) => {
    round.categories.forEach((category) => {
      category.questions.forEach((item) => {
        acc[`${round.id}-${category.title}-${item.price}`] = false;
      });
    });
    return acc;
  }, {});
}

function createEmptyState() {
  const rounds = cloneRounds(defaultRounds);

  return {
    rounds,
    finalRound: cloneFinalRound(defaultFinalRound),
    scores: {
      player1: 0,
      player2: 0,
      player3: 0,
    },
    currentRound: 0,
    openedQuestions: createInitialOpenedState(rounds),
    selectedQuestion: null,
    buzzState: createDefaultBuzzState(),
    answerVisible: false,
    gameStarted: false,
    paused: false,
    finalState: {
      active: false,
      phase: "idle",
      chooserOrder: ["player1", "player2", "player3"],
      currentChooserIndex: 0,
      removedCategories: [],
      selectedCategory: null,
      wagers: {
        player1: null,
        player2: null,
        player3: null,
      },
      wagerResults: {
        player1: null,
        player2: null,
        player3: null,
      },
      answerVisible: false,
    },
    players: createPlayersMap(),
    messages: {
      global: "",
      personal: {
        player1: "",
        player2: "",
        player3: "",
      },
    },
    hostNickname: "Ведущий",
  };
}

function getQuestionKey(roundId, categoryTitle, price) {
  return `${roundId}-${categoryTitle}-${price}`;
}

function getPlayersList(playersMap) {
  return Object.entries(playersMap || createPlayersMap()).map(([id, value]) => ({
    id,
    name: value.nickname,
    connected: value.connected,
  }));
}

function getFinalRemainingCategories(finalRound, finalState) {
  return (finalRound?.categories || []).filter((category) => !finalState?.removedCategories?.includes(category));
}

function allFinalWagersSubmitted(finalState) {
  return Object.values(finalState?.wagers || {}).every((value) => typeof value === "number");
}

export default function IndexPage() {
  const socketRef = useRef(null);
  const [session, setSession] = useState(null);
  const [loginForm, setLoginForm] = useState({ accountId: "host", password: "" });
  const [loginError, setLoginError] = useState("");
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState(createEmptyState);
  const [scoreAdjustments, setScoreAdjustments] = useState({ player1: "", player2: "", player3: "" });
  const [globalMessageDraft, setGlobalMessageDraft] = useState("");
  const [personalMessageDrafts, setPersonalMessageDrafts] = useState({ player1: "", player2: "", player3: "" });

  useEffect(() => {
    const socket = io({ transports: ["websocket", "polling"] });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("game:state", (state) => {
      setGameState((prev) => ({
        ...prev,
        ...state,
        players: state.players || prev.players,
        rounds: state.rounds || prev.rounds,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const socket = socketRef.current;
  const account = session ? accounts.find((item) => item.id === session.id) : null;
  const isHost = account?.role === "host";
  const safeRounds = Array.isArray(gameState?.rounds) && gameState.rounds.length > 0 ? gameState.rounds : cloneRounds(defaultRounds);
  const safeCurrentRoundIndex =
    typeof gameState?.currentRound === "number" && gameState.currentRound >= 0 && gameState.currentRound < safeRounds.length
      ? gameState.currentRound
      : 0;
  const currentRound = safeRounds[safeCurrentRoundIndex];
  const selectedQuestion = gameState.selectedQuestion;
  const playersList = getPlayersList(gameState.players);
  const finalRound = gameState.finalRound || cloneFinalRound(defaultFinalRound);
  const finalState = gameState.finalState || createEmptyState().finalState;
  const finalRemainingCategories = getFinalRemainingCategories(finalRound, finalState);
  const isFinalActive = Boolean(finalState.active);
  const currentFinalChooserId = finalState.chooserOrder?.[finalState.currentChooserIndex] || null;
  const currentFinalChooser = playersList.find((player) => player.id === currentFinalChooserId);
  const currentPlayerScore = session?.id ? gameState.scores?.[session.id] || 0 : 0;
  const buzzAvailableAt = gameState.buzzState?.availableAt || null;
  const buzzCountdownMs = buzzAvailableAt ? Math.max(0, buzzAvailableAt - Date.now()) : 0;
  const buzzCountdownSeconds = Math.ceil(buzzCountdownMs / 1000);
  const currentPersonalMessage = session?.id ? gameState.messages?.personal?.[session.id] || "" : "";
  const isCurrentPlayerBlocked = Boolean(session?.id && gameState.buzzState?.blockedPlayers?.includes(session.id));
  const isCurrentPlayerDisabled = Boolean(session?.id && gameState.buzzState?.disabledPlayers?.includes(session.id));
  const isForcedToAnotherPlayer = Boolean(
    session?.id && gameState.buzzState?.forcedPlayerId && gameState.buzzState.forcedPlayerId !== session.id,
  );

  const allPlayersConnected = useMemo(() => playersList.every((player) => player.connected), [playersList]);
  const remainingInRound = useMemo(
    () =>
      currentRound.categories.reduce(
        (total, category) =>
          total +
          category.questions.filter(
            (item) => !gameState.openedQuestions?.[getQuestionKey(currentRound.id, category.title, item.price)],
          ).length,
        0,
      ),
    [currentRound, gameState.openedQuestions],
  );
  const totalScores = useMemo(
    () => playersList.map((player) => ({ ...player, score: gameState.scores?.[player.id] || 0 })),
    [playersList, gameState.scores],
  );

  useEffect(() => {
    setGlobalMessageDraft(gameState.messages?.global || "");
    setPersonalMessageDrafts({
      player1: gameState.messages?.personal?.player1 || "",
      player2: gameState.messages?.personal?.player2 || "",
      player3: gameState.messages?.personal?.player3 || "",
    });
  }, [gameState.messages]);

  useEffect(() => {
    if (!selectedQuestion || !buzzAvailableAt || Date.now() >= buzzAvailableAt) return undefined;
    const timer = setTimeout(() => emit("question:syncBuzzWindow"), buzzAvailableAt - Date.now() + 20);
    return () => clearTimeout(timer);
  }, [selectedQuestion, buzzAvailableAt]);

  function emit(event, payload, callback) {
    if (!socket) return;
    socket.emit(event, payload, callback);
  }

  function handleLogin(event) {
    event.preventDefault();
    emit("auth:login", loginForm, (result) => {
      if (!result?.ok) {
        setLoginError(result?.error || "Ошибка входа");
        return;
      }
      setLoginError("");
      setSession(result.session);
    });
  }

  function handleLogout() {
    emit("auth:logout");
    setSession(null);
    setLoginForm((prev) => ({ ...prev, password: "" }));
  }

  function updateNickname(accountId, value) {
    emit("nickname:update", { accountId, value });
    if (session?.id === accountId || accountId === "host") {
      setSession((prev) => (prev ? { ...prev, name: value.trim() || prev.name } : prev));
    }
  }

  if (!connected) {
    return (
      <div id="page_wrapper" className="dark theme-slate min-h-screen bg-[#05010a] text-white">
        <main className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-fuchsia-500 border-t-transparent" />
            <p className="mt-4 text-sm text-fuchsia-200/80">Подключение к серверу игры...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Свояк — онлайн игра</title>
        <meta name="description" content="Онлайн игра в стиле Свояк с ведущим и тремя игроками в реальном времени." />
      </Head>

      <div id="page_wrapper" className="dark theme-slate min-h-screen bg-[#05010a] text-white">
        <main className="min-h-screen bg-[#05010a] text-white">
          {!session ? (
            <div className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-8 lg:px-8">
              <section className="w-full rounded-3xl border border-fuchsia-500/25 bg-[#0f0618] p-8 shadow-[0_0_40px_rgba(168,85,247,0.14)]">
                <p className="text-sm uppercase tracking-[0.35em] text-fuchsia-300/80">Онлайн вход</p>
                <h1 className="mt-3 text-4xl font-black text-white">Свояк</h1>
                <p className="mt-4 text-sm text-fuchsia-100/80">
                  Все участники подключаются к одной общей игре. Ведущий входит по паролю, игроки — без пароля.
                </p>

                <form className="mt-8 space-y-4" onSubmit={handleLogin}>
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-fuchsia-100">Аккаунт</span>
                    <select
                      value={loginForm.accountId}
                      onChange={(event) =>
                        setLoginForm((prev) => ({
                          ...prev,
                          accountId: event.target.value,
                          password: event.target.value === "host" ? prev.password : "",
                        }))
                      }
                      className="w-full rounded-2xl border border-fuchsia-500/20 bg-[#150a21] px-4 py-3 text-white outline-none focus:border-fuchsia-400"
                    >
                      <option value="host">host</option>
                      <option value="player1">player1</option>
                      <option value="player2">player2</option>
                      <option value="player3">player3</option>
                    </select>
                  </label>

                  {loginForm.accountId === "host" ? (
                    <label className="block">
                      <span className="mb-2 block text-sm font-medium text-fuchsia-100">Пароль ведущего</span>
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                        className="w-full rounded-2xl border border-fuchsia-500/20 bg-[#150a21] px-4 py-3 text-white outline-none placeholder:text-fuchsia-200/30 focus:border-fuchsia-400"
                        placeholder="Введите пароль ведущего"
                      />
                    </label>
                  ) : (
                      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-700/10 px-4 py-3 text-sm text-emerald-100">
                        Для игроков пароль не нужен. Просто выбери аккаунт и нажми &quot;Войти&quot;.
                      </div>

                  )}

                  {loginError && <div className="rounded-2xl bg-rose-900/30 px-4 py-3 text-sm text-rose-200">{loginError}</div>}

                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-fuchsia-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-fuchsia-500"
                  >
                    Войти
                  </button>
                </form>
              </section>
            </div>
          ) : isHost ? (
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
              <header className="rounded-3xl border border-fuchsia-500/30 bg-[#12061d] p-6 shadow-[0_0_40px_rgba(168,85,247,0.18)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-fuchsia-300/80">Панель ведущего</p>
                    <h1 className="mt-2 text-4xl font-extrabold text-white">Свояк — {gameState.hostNickname}</h1>
                    <p className="mt-3 max-w-3xl text-sm text-fuchsia-100/80">
                      Эта версия работает в реальном времени: все действия ведущего и игроков синхронизируются между устройствами.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => emit("round:prev")}
                      className="rounded-xl border border-fuchsia-400/40 bg-black/30 px-4 py-2 text-sm font-semibold text-fuchsia-100 transition hover:border-fuchsia-300 hover:bg-fuchsia-950/40 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={safeCurrentRoundIndex === 0}
                    >
                      Назад
                    </button>
                    <button
                      type="button"
                      onClick={() => emit("round:next")}
                      className="rounded-xl border border-fuchsia-400/40 bg-black/30 px-4 py-2 text-sm font-semibold text-fuchsia-100 transition hover:border-fuchsia-300 hover:bg-fuchsia-950/40 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={isFinalActive}
                    >
                      {safeCurrentRoundIndex === safeRounds.length - 1 ? "Перейти к финалу" : "Следующий раунд"}
                    </button>
                    <button
                      type="button"
                      onClick={() => emit("game:pauseToggle")}
                      className="rounded-xl border border-amber-400/35 bg-amber-600/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-600/20"
                    >
                      {gameState.paused ? "Снять с паузы" : "Пауза"}
                    </button>
                    <button
                      type="button"
                      onClick={() => emit("game:reset")}
                      className="rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-fuchsia-500"
                    >
                      Сбросить игру
                    </button>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="rounded-xl border border-fuchsia-400/35 bg-black/20 px-4 py-2 text-sm font-semibold text-fuchsia-100 transition hover:border-fuchsia-300"
                    >
                      Выйти
                    </button>
                  </div>
                </div>
              </header>

              <section className="grid gap-6 xl:grid-cols-[0.9fr_1.45fr_0.95fr]">
                <aside className="space-y-6">
                  <div className="rounded-3xl border border-fuchsia-500/20 bg-[#0f0618] p-5">
                    <h2 className="text-xl font-bold">Никнеймы</h2>
                    <div className="mt-4 space-y-3">
                      <label className="block">
                        <span className="mb-2 block text-sm text-fuchsia-100/80">Ведущий</span>
                        <input
                          value={gameState.hostNickname}
                          onChange={(event) => updateNickname("host", event.target.value)}
                          className="w-full rounded-2xl border border-fuchsia-500/20 bg-[#150a21] px-4 py-3 text-white outline-none focus:border-fuchsia-400"
                        />
                      </label>
                      {Object.entries(gameState.players || {}).map(([playerId, player]) => (
                        <label key={playerId} className="block">
                          <span className="mb-2 block text-sm text-fuchsia-100/80">{playerId}</span>
                          <input
                            value={player.nickname}
                            onChange={(event) => updateNickname(playerId, event.target.value)}
                            className="w-full rounded-2xl border border-fuchsia-500/20 bg-[#150a21] px-4 py-3 text-white outline-none focus:border-fuchsia-400"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-fuchsia-500/20 bg-[#0f0618] p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-300/70">Статус матча</p>
                        <h2 className="mt-2 text-2xl font-bold">{isFinalActive ? "Финал" : currentRound.name}</h2>
                      </div>
                      <div className="rounded-2xl bg-fuchsia-500/10 px-4 py-3 text-right">
                        <div className="text-xs text-fuchsia-200/70">{isFinalActive ? "Этап финала" : "Осталось вопросов"}</div>
                        <div className="text-2xl font-black text-fuchsia-300">
                          {isFinalActive
                            ? finalState.phase === "categories"
                              ? `${finalRemainingCategories.length} катег.`
                              : finalState.phase === "wager"
                                ? "Ставки"
                                : "Вопрос"
                            : remainingInRound}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-fuchsia-500/15 bg-black/20 p-4">
                        <div className="text-sm font-semibold text-white">Подключение игроков</div>
                        <div className="mt-3 space-y-2">
                          {playersList.map((player) => (
                            <div key={player.id} className="flex items-center justify-between text-sm">
                              <span>{player.name}</span>
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                                  player.connected ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-200"
                                }`}
                              >
                                {player.connected ? "В сети" : "Не вошёл"}
                              </span>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => emit("game:start")}
                          disabled={!allPlayersConnected || gameState.gameStarted}
                          className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {gameState.gameStarted ? "Игра уже началась" : "Начать игру"}
                        </button>
                      </div>

                      <div className="grid gap-3">
                        {safeRounds.map((item, index) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => emit("round:set", index)}
                            className={`rounded-2xl border px-4 py-3 text-left transition ${
                              !isFinalActive && safeCurrentRoundIndex === index
                                ? "border-fuchsia-400 bg-fuchsia-700/20 text-white"
                                : "border-fuchsia-500/20 bg-black/20 text-fuchsia-100/80 hover:border-fuchsia-400/50"
                            }`}
                          >
                            <div className="text-sm font-bold">{item.name}</div>
                            <div className="mt-1 text-xs text-fuchsia-200/60">Категорий: {item.categories.length}</div>
                          </button>
                        ))}
                        <div
                          className={`rounded-2xl border px-4 py-3 text-left ${
                            isFinalActive ? "border-amber-400/60 bg-amber-500/10 text-white" : "border-fuchsia-500/20 bg-black/20 text-fuchsia-100/60"
                          }`}
                        >
                          <div className="text-sm font-bold">Финал</div>
                          <div className="mt-1 text-xs text-fuchsia-200/60">10 категорий, ставки и один вопрос</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-fuchsia-500/20 bg-[#0f0618] p-5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Счёт игроков</h2>
                      <span className="rounded-full bg-fuchsia-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-fuchsia-300">
                        Контроль очков
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {totalScores.map((player) => (
                        <div key={player.id} className="rounded-2xl border border-fuchsia-500/15 bg-black/20 p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold">{player.name}</span>
                            <span className="text-2xl font-black text-fuchsia-300">{player.score}</span>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => emit("score:update", { playerId: player.id, delta: 100 })}
                              className="flex-1 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-600"
                            >
                              +100
                            </button>
                            <button
                              type="button"
                              onClick={() => emit("score:update", { playerId: player.id, delta: -100 })}
                              className="flex-1 rounded-xl bg-rose-800 px-3 py-2 text-sm font-bold text-white transition hover:bg-rose-700"
                            >
                              -100
                            </button>
                          </div>
                        {selectedQuestion && (
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => emit("score:update", { playerId: player.id, delta: selectedQuestion.price })}
                              className="flex-1 rounded-xl border border-emerald-400/25 bg-emerald-600/20 px-3 py-2 text-sm font-bold text-emerald-100 transition hover:bg-emerald-600/30"
                            >
                              +{selectedQuestion.price}
                            </button>
                            <button
                              type="button"
                              onClick={() => emit("score:update", { playerId: player.id, delta: -selectedQuestion.price })}
                              className="flex-1 rounded-xl border border-rose-400/25 bg-rose-700/20 px-3 py-2 text-sm font-bold text-rose-100 transition hover:bg-rose-700/30"
                            >
                              -{selectedQuestion.price}
                            </button>
                          </div>
                        )}
                        <div className="mt-3 flex gap-2">
                          <input
                            type="number"
                            value={scoreAdjustments[player.id] || ""}
                            onChange={(event) =>
                              setScoreAdjustments((prev) => ({
                                ...prev,
                                [player.id]: event.target.value,
                              }))
                            }
                            className="flex-1 rounded-xl border border-fuchsia-500/20 bg-[#150a21] px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-400"
                            placeholder="Напр. 2500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const delta = Number(scoreAdjustments[player.id]);
                              if (!delta) return;
                              emit("score:update", { playerId: player.id, delta });
                              setScoreAdjustments((prev) => ({ ...prev, [player.id]: "" }));
                            }}
                            className="rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-fuchsia-500"
                          >
                            Добавить
                          </button>
                        </div>

                        </div>
                      ))}
                    </div>
                  </div>
                </aside>

                <section className="rounded-3xl border border-fuchsia-500/20 bg-[#0f0618] p-4 sm:p-6">
                  {!gameState.gameStarted ? (
                    <div className="space-y-6">
                      <div className="rounded-[28px] border border-fuchsia-500/20 bg-[#14081f] p-6">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-300/70">Настройка до старта</p>
                            <h2 className="mt-2 text-3xl font-black text-white">Редактор игры</h2>
                          </div>
                          <button
                            type="button"
                            onClick={() => emit("editor:addCategory", { roundIndex: safeCurrentRoundIndex })}
                            className="rounded-xl bg-fuchsia-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-fuchsia-500"
                          >
                            Добавить категорию
                          </button>
                        </div>
                        <p className="mt-3 text-sm text-fuchsia-100/70">
                          Все изменения здесь мгновенно видны у всех подключённых участников.
                        </p>
                      </div>

                      <div className="rounded-3xl border border-amber-400/20 bg-amber-500/5 p-5">
                        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Настройка финала</p>
                        <h3 className="mt-2 text-2xl font-bold text-white">Категории и финальный вопрос</h3>
                        <div className="mt-5 grid gap-3 md:grid-cols-2">
                          {finalRound.categories.map((category, categoryIndex) => (
                            <input
                              key={`${category}-${categoryIndex}`}
                              value={category}
                              onChange={(event) => emit("editor:updateFinalCategory", { categoryIndex, value: event.target.value })}
                              className="w-full rounded-2xl border border-amber-400/20 bg-[#150a21] px-4 py-3 text-white outline-none focus:border-amber-300"
                              placeholder={`Категория ${categoryIndex + 1}`}
                            />
                          ))}
                        </div>
                        <div className="mt-4 grid gap-4 lg:grid-cols-2">
                          <label className="block">
                            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-amber-200/70">Финальный вопрос</span>
                            <textarea
                              value={finalRound.question}
                              onChange={(event) => emit("editor:updateFinalField", { field: "question", value: event.target.value })}
                              className="h-32 w-full rounded-2xl border border-amber-400/20 bg-[#150a21] px-4 py-3 text-white outline-none focus:border-amber-300"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-amber-200/70">Ответ на финал</span>
                            <textarea
                              value={finalRound.answer}
                              onChange={(event) => emit("editor:updateFinalField", { field: "answer", value: event.target.value })}
                              className="h-32 w-full rounded-2xl border border-amber-400/20 bg-[#150a21] px-4 py-3 text-white outline-none focus:border-amber-300"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="space-y-5">
                        <div className="rounded-3xl border border-fuchsia-500/20 bg-black/20 p-5">
                          <label className="block">
                            <span className="mb-2 block text-sm text-fuchsia-100/80">Название текущего раунда</span>
                            <input
                              value={currentRound.name}
                              onChange={(event) => emit("editor:updateRoundName", { roundIndex: safeCurrentRoundIndex, value: event.target.value })}
                              className="w-full rounded-2xl border border-fuchsia-500/20 bg-[#150a21] px-4 py-3 text-white outline-none focus:border-fuchsia-400"
                            />
                          </label>
                        </div>

                        {currentRound.categories.map((category, categoryIndex) => (
                          <div key={`${category.title}-${categoryIndex}`} className="rounded-3xl border border-fuchsia-500/20 bg-black/20 p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <input
                                value={category.title}
                                onChange={(event) =>
                                  emit("editor:updateCategoryTitle", {
                                    roundIndex: safeCurrentRoundIndex,
                                    categoryIndex,
                                    value: event.target.value,
                                  })
                                }
                                className="w-full rounded-2xl border border-fuchsia-500/20 bg-[#150a21] px-4 py-3 text-lg font-bold text-white outline-none focus:border-fuchsia-400"
                              />
                              <button
                                type="button"
                                onClick={() => emit("editor:removeCategory", { roundIndex: safeCurrentRoundIndex, categoryIndex })}
                                className="rounded-xl border border-rose-400/35 bg-rose-700/10 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-700/20"
                              >
                                Удалить категорию
                              </button>
                            </div>

                            <div className="mt-5 space-y-4">
                              {category.questions.map((question, questionIndex) => (
                                <div key={`${question.price}-${questionIndex}`} className="rounded-2xl border border-fuchsia-500/15 bg-[#12061d] p-4">
                                  <div className="grid gap-3 lg:grid-cols-[140px_1fr_1fr]">
                                    <label className="block">
                                      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-fuchsia-300/70">Баллы</span>
                                      <input
                                        type="number"
                                        value={question.price}
                                        onChange={(event) =>
                                          emit("editor:updateQuestionField", {
                                            roundIndex: safeCurrentRoundIndex,
                                            categoryIndex,
                                            questionIndex,
                                            field: "price",
                                            value: event.target.value,
                                          })
                                        }
                                        className="w-full rounded-2xl border border-fuchsia-500/20 bg-[#150a21] px-4 py-3 text-white outline-none focus:border-fuchsia-400"
                                      />
                                    </label>
                                    <label className="block">
                                      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-fuchsia-300/70">Вопрос</span>
                                      <textarea
                                        value={question.question}
                                        onChange={(event) =>
                                          emit("editor:updateQuestionField", {
                                            roundIndex: safeCurrentRoundIndex,
                                            categoryIndex,
                                            questionIndex,
                                            field: "question",
                                            value: event.target.value,
                                          })
                                        }
                                        className="h-28 w-full rounded-2xl border border-fuchsia-500/20 bg-[#150a21] px-4 py-3 text-white outline-none focus:border-fuchsia-400"
                                      />
                                    </label>
                                    <label className="block">
                                      <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-fuchsia-300/70">Ответ</span>
                                      <textarea
                                        value={question.answer}
                                        onChange={(event) =>
                                          emit("editor:updateQuestionField", {
                                            roundIndex: safeCurrentRoundIndex,
                                            categoryIndex,
                                            questionIndex,
                                            field: "answer",
                                            value: event.target.value,
                                          })
                                        }
                                        className="h-28 w-full rounded-2xl border border-fuchsia-500/20 bg-[#150a21] px-4 py-3 text-white outline-none focus:border-fuchsia-400"
                                      />
                                      <span className="mb-2 mt-3 block text-xs uppercase tracking-[0.2em] text-fuchsia-300/70">Ссылка на картинку</span>
                                      <input
                                        value={question.imageUrl || ""}
                                        onChange={(event) =>
                                          emit("editor:updateQuestionField", {
                                            roundIndex: safeCurrentRoundIndex,
                                            categoryIndex,
                                            questionIndex,
                                            field: "imageUrl",
                                            value: event.target.value,
                                          })
                                        }
                                        className="w-full rounded-2xl border border-fuchsia-500/20 bg-[#150a21] px-4 py-3 text-white outline-none focus:border-fuchsia-400"
                                        placeholder="https://... или /images/question.jpg"
                                      />
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : isFinalActive ? (
                    <div className="space-y-6">
                      <div className="rounded-[28px] border border-amber-400/25 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.12),_rgba(0,0,0,0)_35%),linear-gradient(180deg,_rgba(26,12,40,1)_0%,_rgba(9,4,15,1)_100%)] p-6 sm:p-8">
                        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/80">Финал</p>
                        <h2 className="mt-2 text-3xl font-black text-white">Осталась последняя тема и один вопрос</h2>
                        <p className="mt-3 max-w-3xl text-sm text-fuchsia-100/75">
                          Игроки по очереди называют по одной категории, ведущий убирает их, пока не останется одна. Затем игроки ставят свои баллы, и только после этого открывается финальный вопрос.
                        </p>
                      </div>

                      {finalState.phase === "categories" ? (
                        <div className="space-y-5">
                          <div className="rounded-3xl border border-amber-400/20 bg-black/20 p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className="text-xs uppercase tracking-[0.25em] text-amber-300/70">Сейчас выбирает</div>
                                <div className="mt-2 text-2xl font-bold text-white">{currentFinalChooser?.name || "Игрок"}</div>
                              </div>
                              <div className="rounded-2xl bg-amber-500/10 px-4 py-3 text-right">
                                <div className="text-xs text-amber-200/70">Осталось категорий</div>
                                <div className="text-3xl font-black text-amber-300">{finalRemainingCategories.length}</div>
                              </div>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {finalRound.categories.map((category) => {
                              const removed = finalState.removedCategories.includes(category);
                              return (
                                <button
                                  key={category}
                                  type="button"
                                  onClick={() => emit("final:removeCategory", { categoryTitle: category })}
                                  disabled={removed}
                                  className={`rounded-3xl border px-5 py-6 text-left transition ${
                                    removed
                                      ? "cursor-not-allowed border-fuchsia-500/10 bg-[#241230] text-fuchsia-100/25"
                                      : "border-amber-400/30 bg-amber-500/10 text-white hover:border-amber-300 hover:bg-amber-500/15"
                                  }`}
                                >
                                  <div className="text-xl font-bold">{category}</div>
                                  <div className="mt-2 text-sm text-fuchsia-100/70">
                                    {removed ? "Категория уже убрана" : "Нажмите, когда игрок назвал эту категорию"}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : finalState.phase === "wager" ? (
                        <div className="space-y-5">
                          <div className="rounded-3xl border border-amber-400/20 bg-black/20 p-5">
                            <div className="text-xs uppercase tracking-[0.25em] text-amber-300/70">Тема финала</div>
                            <div className="mt-2 text-3xl font-black text-white">{finalState.selectedCategory}</div>
                            <p className="mt-3 text-sm text-fuchsia-100/75">
                              Игроки сейчас отправляют ставку от 1 до своего текущего счёта и пока не видят сам вопрос.
                            </p>
                          </div>

                          <div className="grid gap-4 lg:grid-cols-3">
                            {totalScores.map((player) => {
                              const wager = finalState.wagers?.[player.id];
                              return (
                                <div key={player.id} className="rounded-3xl border border-amber-400/20 bg-black/20 p-5">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-lg font-semibold text-white">{player.name}</span>
                                    <span className="text-2xl font-black text-fuchsia-300">{player.score}</span>
                                  </div>
                                  <div className="mt-4 rounded-2xl bg-[#150a21] px-4 py-3 text-sm text-fuchsia-100/80">
                                    {typeof wager === "number" ? `Ставка отправлена: ${wager}` : "Ставка ещё не отправлена"}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            onClick={() => emit("final:revealQuestion")}
                            disabled={!allFinalWagersSubmitted(finalState)}
                            className="rounded-2xl bg-amber-500 px-5 py-3 text-sm font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Показать финальный вопрос
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div className="rounded-3xl border border-amber-400/20 bg-black/20 p-6">
                            <div className="text-xs uppercase tracking-[0.25em] text-amber-300/70">Тема финала</div>
                            <div className="mt-2 text-3xl font-black text-white">{finalState.selectedCategory}</div>
                            <div className="mt-6 rounded-3xl border border-fuchsia-500/20 bg-[#150a21] p-6">
                              <div className="text-center text-2xl font-bold leading-relaxed text-white">{finalRound.question}</div>
                            </div>
                            {finalState.answerVisible && (
                              <div className="mt-5 rounded-3xl border border-emerald-400/20 bg-emerald-900/15 p-5">
                                <div className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">Ответ</div>
                                <div className="mt-2 text-2xl font-bold text-white">{finalRound.answer}</div>
                              </div>
                            )}
                          </div>

                          <div className="grid gap-4 lg:grid-cols-3">
                            {totalScores.map((player) => {
                              const wager = finalState.wagers?.[player.id];
                              const result = finalState.wagerResults?.[player.id];
                              return (
                                <div key={player.id} className="rounded-3xl border border-amber-400/20 bg-black/20 p-5">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-lg font-semibold text-white">{player.name}</span>
                                    <span className="text-2xl font-black text-fuchsia-300">{player.score}</span>
                                  </div>
                                  <div className="mt-3 text-sm text-fuchsia-100/75">Ставка: {typeof wager === "number" ? wager : "—"}</div>
                                  <div className="mt-4 flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => emit("final:applyWager", { playerId: player.id, result: "correct" })}
                                      disabled={Boolean(result) || typeof wager !== "number"}
                                      className="flex-1 rounded-xl bg-emerald-700 px-3 py-2 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-40"
                                    >
                                      Верно
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => emit("final:applyWager", { playerId: player.id, result: "wrong" })}
                                      disabled={Boolean(result) || typeof wager !== "number"}
                                      className="flex-1 rounded-xl bg-rose-800 px-3 py-2 text-sm font-bold text-white transition hover:bg-rose-700 disabled:opacity-40"
                                    >
                                      Неверно
                                    </button>
                                  </div>
                                  {result && (
                                    <div className="mt-3 text-xs uppercase tracking-[0.25em] text-amber-200/70">
                                      {result === "correct" ? "Ставка засчитана как верная" : "Ставка засчитана как неверная"}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <button
                            type="button"
                            onClick={() => emit("final:toggleAnswer")}
                            className="rounded-2xl border border-emerald-400/35 bg-emerald-700/20 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300"
                          >
                            {finalState.answerVisible ? "Скрыть правильный ответ" : "Открыть правильный ответ"}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : !selectedQuestion ? (
                    <div>
                      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-300/70">Игровое поле</p>
                          <h2 className="mt-2 text-3xl font-black">{currentRound.name}</h2>
                        </div>
                        <div className="text-sm text-fuchsia-100/70">
                          {gameState.paused ? "Игра на паузе" : "Выберите категорию и стоимость вопроса"}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                        {currentRound.categories.map((category) => (
                          <div key={category.title} className="overflow-hidden rounded-3xl border border-fuchsia-500/20 bg-[#14081f]">
                            <div className="flex min-h-[96px] items-center justify-center border-b border-fuchsia-500/20 px-3 py-4 text-center text-lg font-bold text-fuchsia-100">
                              {category.title}
                            </div>

                            <div className="grid gap-px bg-fuchsia-500/10">
                              {category.questions.map((item) => {
                                const opened = gameState.openedQuestions?.[getQuestionKey(currentRound.id, category.title, item.price)];
                                return (
                                  <button
                                    key={`${category.title}-${item.price}`}
                                    type="button"
                                    onClick={() => emit("question:open", { categoryTitle: category.title, price: item.price })}
                                    disabled={opened || gameState.paused}
                                    className={`min-h-[88px] px-3 py-4 text-center text-3xl font-black transition ${
                                      opened
                                        ? "cursor-not-allowed bg-[#241230] text-fuchsia-100/25"
                                        : "bg-[#1a0c28] text-fuchsia-300 hover:bg-fuchsia-900/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                                    }`}
                                  >
                                    {opened ? "—" : item.price}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-[760px] flex-col justify-between rounded-[28px] border border-fuchsia-500/20 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_rgba(0,0,0,0)_35%),linear-gradient(180deg,_rgba(26,12,40,1)_0%,_rgba(9,4,15,1)_100%)] p-6 sm:p-8">
                      <div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-300/70">{currentRound.name}</p>
                            <h2 className="mt-2 text-2xl font-extrabold text-white">{selectedQuestion.categoryTitle}</h2>
                          </div>
                          <div className="rounded-2xl bg-fuchsia-500/10 px-5 py-3 text-center">
                            <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/60">Стоимость</div>
                            <div className="text-4xl font-black text-fuchsia-300">{selectedQuestion.price}</div>
                          </div>
                        </div>

                        <div className="mt-6 grid gap-4 lg:grid-cols-2">
                          <label className="block rounded-3xl border border-fuchsia-500/20 bg-black/20 p-5">
                            <span className="text-xs uppercase tracking-[0.25em] text-fuchsia-300/70">Текст вопроса</span>
                            <textarea
                              value={selectedQuestion.question}
                              onChange={(event) => emit("question:updateField", { field: "question", value: event.target.value })}
                              className="mt-3 h-40 w-full rounded-2xl border border-fuchsia-500/20 bg-[#150a21] px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
                            />
                          </label>

                          <label className="block rounded-3xl border border-fuchsia-500/20 bg-black/20 p-5">
                            <span className="text-xs uppercase tracking-[0.25em] text-fuchsia-300/70">Правильный ответ</span>
                            <textarea
                              value={selectedQuestion.answer}
                              onChange={(event) => emit("question:updateField", { field: "answer", value: event.target.value })}
                              className="mt-3 h-40 w-full rounded-2xl border border-fuchsia-500/20 bg-[#150a21] px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
                            />
                          </label>
                        </div>

                        <label className="mt-4 block rounded-3xl border border-fuchsia-500/20 bg-black/20 p-5">
                          <span className="text-xs uppercase tracking-[0.25em] text-fuchsia-300/70">Ссылка на картинку</span>
                          <input
                            value={selectedQuestion.imageUrl || ""}
                            onChange={(event) => emit("question:updateField", { field: "imageUrl", value: event.target.value })}
                            className="mt-3 w-full rounded-2xl border border-fuchsia-500/20 bg-[#150a21] px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
                            placeholder="https://... или /images/question.jpg"
                          />
                        </label>

                        {selectedQuestion.imageUrl && (
                          <div className="mt-4 rounded-3xl border border-fuchsia-500/20 bg-black/20 p-5">
                            <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-300/70">Предпросмотр картинки</div>
                            <img
                              src={selectedQuestion.imageUrl}
                              alt="Иллюстрация вопроса"
                              className="mt-4 max-h-[360px] w-full rounded-2xl object-contain"
                            />
                          </div>
                        )}

                        <div className="mt-6 grid gap-4">
                          <div className="rounded-3xl border border-fuchsia-500/20 bg-black/20 p-5">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-300/70">Право ответа</div>
                                <div className="mt-2 text-2xl font-bold text-white">
                                  {gameState.buzzState?.lockedBy
                                    ? playersList.find((player) => player.id === gameState.buzzState.lockedBy)?.name
                                    : "Пока никто не нажал"}
                                </div>
                              </div>
                              <div
                                className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] ${
                                  gameState.buzzState?.lockedBy
                                    ? "bg-emerald-500/20 text-emerald-300"
                                    : gameState.buzzState?.availableAt && buzzCountdownMs > 0
                                      ? "bg-amber-500/20 text-amber-200"
                                      : gameState.buzzState?.active
                                        ? "bg-fuchsia-500/20 text-fuchsia-200"
                                        : "bg-white/10 text-white/70"
                                }`}
                              >
                                {gameState.buzzState?.lockedBy
                                  ? "Кнопка зафиксирована"
                                  : gameState.buzzState?.availableAt && buzzCountdownMs > 0
                                    ? `Блок ${buzzCountdownSeconds}с`
                                    : gameState.buzzState?.active
                                      ? "Ожидание нажатия"
                                      : "Пауза"}
                              </div>
                            </div>

                            {gameState.buzzState?.blockedPlayers?.length > 0 && (
                              <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-900/10 p-4 text-sm text-rose-100">
                                Уже ошиблись и больше не могут отвечать:
                                <span className="ml-2 font-semibold">
                                  {gameState.buzzState.blockedPlayers
                                    .map((playerId) => playersList.find((player) => player.id === playerId)?.name || playerId)
                                    .join(", ")}
                                </span>
                              </div>
                            )}

                            {gameState.answerVisible && (
                              <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-900/15 p-4">
                                <div className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">Ответ</div>
                                <div className="mt-2 text-xl font-bold text-white">{selectedQuestion.answer}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-8 flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => emit("question:close")}
                          className="rounded-xl bg-fuchsia-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-fuchsia-500"
                        >
                          Закрыть вопрос
                        </button>
                        <button
                          type="button"
                          onClick={() => emit("question:resetBuzz")}
                          disabled={gameState.paused}
                          className="rounded-xl border border-fuchsia-400/35 bg-black/20 px-5 py-3 text-sm font-semibold text-fuchsia-100 transition hover:border-fuchsia-300 disabled:opacity-40"
                        >
                          Разрешить нажать снова
                        </button>
                        <button
                          type="button"
                          onClick={() => emit("question:toggleAnswer")}
                          className="rounded-xl border border-emerald-400/35 bg-emerald-700/20 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300"
                        >
                          {gameState.answerVisible ? "Скрыть правильный ответ" : "Открыть правильный ответ"}
                        </button>
                      </div>

                      {gameState.buzzState?.lockedBy && (
                        <div className="mt-4 rounded-3xl border border-amber-400/25 bg-amber-500/10 p-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <div className="text-xs uppercase tracking-[0.25em] text-amber-300/70">Проверка ответа</div>
                              <div className="mt-2 text-xl font-bold text-white">
                                Отвечает {playersList.find((player) => player.id === gameState.buzzState.lockedBy)?.name}
                              </div>
                              <div className="mt-1 text-sm text-fuchsia-100/70">
                                Верный ответ сразу закроет вопрос и добавит {selectedQuestion.price} баллов. Неверный — вычтет баллы и даст другим нажать.
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-3">
                              <button
                                type="button"
                                onClick={() => emit("question:judgeAnswer", { playerId: gameState.buzzState.lockedBy, result: "correct" })}
                                className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
                              >
                                Верно: закрыть и +{selectedQuestion.price}
                              </button>
                              <button
                                type="button"
                                onClick={() => emit("question:judgeAnswer", { playerId: gameState.buzzState.lockedBy, result: "wrong" })}
                                className="rounded-xl bg-rose-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-rose-700"
                              >
                                Неверно: -{selectedQuestion.price} и открыть другим
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                <aside className="space-y-6 rounded-3xl border border-fuchsia-500/20 bg-[#0f0618] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-300/70">Управление</p>
                      <h2 className="mt-2 text-2xl font-bold text-white">Меню ведущего</h2>
                    </div>
                    <span className="rounded-full bg-fuchsia-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-fuchsia-300">
                      Справа
                    </span>
                  </div>

                  <div className="rounded-3xl border border-fuchsia-500/15 bg-black/20 p-4">
                    <div className="text-sm font-semibold text-white">Сообщение для всех</div>
                    <textarea
                      value={globalMessageDraft}
                      onChange={(event) => setGlobalMessageDraft(event.target.value)}
                      className="mt-3 h-28 w-full rounded-2xl border border-fuchsia-500/20 bg-[#150a21] px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
                      placeholder="Текст для всех игроков"
                    />
                    <button
                      type="button"
                      onClick={() => emit("host:message", { target: "global", value: globalMessageDraft })}
                      className="mt-3 w-full rounded-xl bg-fuchsia-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-fuchsia-500"
                    >
                      Отправить глобально
                    </button>
                  </div>

                  <div className="space-y-4">
                    {totalScores.map((player) => {
                      const isForced = gameState.buzzState?.forcedPlayerId === player.id;
                      const isDisabled = Boolean(gameState.players?.[player.id]?.buzzDisabled);
                      return (
                        <div key={`host-control-${player.id}`} className="rounded-3xl border border-fuchsia-500/15 bg-black/20 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <div className="text-lg font-bold text-white">{player.name}</div>
                              <div className="mt-1 text-xs text-fuchsia-100/60">{player.id}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-black text-fuchsia-300">{player.score}</div>
                              <div className="mt-1 text-xs text-fuchsia-100/60">
                                {isDisabled ? "Ответ запрещён" : isForced ? "Отвечает только он" : "Обычный режим"}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => emit("host:playerControl", { playerId: player.id, action: "setDisabled", value: !isDisabled })}
                              className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                                isDisabled
                                  ? "bg-emerald-700 text-white hover:bg-emerald-600"
                                  : "bg-rose-800 text-white hover:bg-rose-700"
                              }`}
                            >
                              {isDisabled ? "Разрешить ответ" : "Запретить ответ"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                emit("host:playerControl", {
                                  playerId: player.id,
                                  action: "forceAnswer",
                                  value: !isForced,
                                })
                              }
                              className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                                isForced
                                  ? "bg-amber-500 text-black hover:bg-amber-400"
                                  : "bg-sky-700 text-white hover:bg-sky-600"
                              }`}
                            >
                              {isForced ? "Снять принуждение" : "Заставить отвечать"}
                            </button>
                          </div>

                          <textarea
                            value={personalMessageDrafts[player.id] || ""}
                            onChange={(event) =>
                              setPersonalMessageDrafts((prev) => ({
                                ...prev,
                                [player.id]: event.target.value,
                              }))
                            }
                            className="mt-3 h-24 w-full rounded-2xl border border-fuchsia-500/20 bg-[#150a21] px-4 py-3 text-sm text-white outline-none focus:border-fuchsia-400"
                            placeholder={`Личное сообщение для ${player.name}`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              emit("host:message", {
                                target: "personal",
                                playerId: player.id,
                                value: personalMessageDrafts[player.id] || "",
                              })
                            }
                            className="mt-3 w-full rounded-xl border border-fuchsia-400/35 bg-black/20 px-4 py-3 text-sm font-semibold text-fuchsia-100 transition hover:border-fuchsia-300"
                          >
                            Отправить лично
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </aside>
              </section>
            </div>
          ) : (
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-6 px-4 py-6 lg:px-8">
              <header className="rounded-3xl border border-fuchsia-500/30 bg-[#12061d] p-6 shadow-[0_0_40px_rgba(168,85,247,0.18)]">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.35em] text-fuchsia-300/80">Аккаунт игрока</p>
                    <h1 className="mt-2 text-4xl font-black text-white">{session.name}</h1>
                  <p className="mt-3 text-sm text-fuchsia-100/75">
                    Игрок подключён к общей игре, видит поле, счёт и текущий вопрос в реальном времени. Изменения ведущего
                    теперь сохраняются после перезапуска сервера, если подключена база данных.
                  </p>

                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl border border-fuchsia-400/35 bg-black/20 px-4 py-3 text-sm font-semibold text-fuchsia-100 transition hover:border-fuchsia-300"
                  >
                    Выйти
                  </button>
                </div>
              </header>

              <section className="grid gap-6 xl:grid-cols-[1fr_1.8fr]">
                <aside className="space-y-6">
                  <div className="rounded-3xl border border-fuchsia-500/20 bg-[#12061d] p-6">
                    <label className="block">
                      <span className="mb-2 block text-sm text-fuchsia-100/80">Ваш никнейм</span>
                      <input
                        value={gameState.players?.[session.id]?.nickname || session.name}
                        onChange={(event) => updateNickname(session.id, event.target.value)}
                        className="w-full rounded-2xl border border-fuchsia-500/20 bg-[#150a21] px-4 py-3 text-white outline-none focus:border-fuchsia-400"
                      />
                    </label>
                  </div>

                  <div className="rounded-3xl border border-fuchsia-500/20 bg-[#12061d] p-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white">Счёт игроков</h2>
                      <span className="rounded-full bg-fuchsia-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-fuchsia-300">
                        Онлайн
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {totalScores.map((player) => (
                        <div key={player.id} className="rounded-2xl border border-fuchsia-500/15 bg-black/20 p-4">
                          <div className="flex items-center justify-between">
                            <span className="text-lg font-semibold">{player.name}</span>
                            <span className="text-2xl font-black text-fuchsia-300">{player.score}</span>
                          </div>
                          <div className="mt-2 text-xs uppercase tracking-[0.25em] text-fuchsia-200/60">
                            {player.connected ? "В сети" : "Не в сети"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-fuchsia-500/20 bg-[#12061d] p-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white">Сообщения</h2>
                      <span className="rounded-full bg-fuchsia-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-fuchsia-300">
                        Inbox
                      </span>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-fuchsia-500/15 bg-black/20 p-4">
                        <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/60">Глобальное</div>
                        <div className="mt-2 text-sm text-white">{gameState.messages?.global || "Нет сообщения"}</div>
                      </div>
                      <div className="rounded-2xl border border-fuchsia-500/15 bg-black/20 p-4">
                        <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/60">Личное</div>
                        <div className="mt-2 text-sm text-white">{currentPersonalMessage || "Нет личного сообщения"}</div>
                      </div>
                    </div>
                  </div>
                </aside>

                <section className="rounded-3xl border border-fuchsia-500/25 bg-[#0f0618] p-8">
                  {!gameState.gameStarted ? (
                    <div className="space-y-6">
                      <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                        <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-300/70">Ожидание ведущего</p>
                        <h2 className="mt-4 text-3xl font-black text-white">Игра ещё не началась</h2>
                        <p className="mt-4 max-w-lg text-sm text-fuchsia-100/70">
                          Когда все игроки войдут, ведущий сможет запустить общую онлайн-игру.
                        </p>
                      </div>

                      <div>
                        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-300/70">Игровое поле</p>
                            <h2 className="mt-2 text-3xl font-black">{currentRound.name}</h2>
                          </div>
                          <div className="text-sm text-fuchsia-100/70">Игроки уже видят категории и стоимость вопросов</div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                          {currentRound.categories.map((category) => (
                            <div key={category.title} className="overflow-hidden rounded-3xl border border-fuchsia-500/20 bg-[#14081f]">
                              <div className="flex min-h-[96px] items-center justify-center border-b border-fuchsia-500/20 px-3 py-4 text-center text-lg font-bold text-fuchsia-100">
                                {category.title}
                              </div>

                              <div className="grid gap-px bg-fuchsia-500/10">
                                {category.questions.map((item) => {
                                  const opened = gameState.openedQuestions?.[getQuestionKey(currentRound.id, category.title, item.price)];
                                  return (
                                    <div
                                      key={`${category.title}-${item.price}`}
                                      className={`flex min-h-[88px] items-center justify-center px-3 py-4 text-center text-3xl font-black ${
                                        opened ? "bg-[#241230] text-fuchsia-100/25" : "bg-[#1a0c28] text-fuchsia-300"
                                      }`}
                                    >
                                      {opened ? "—" : item.price}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : isFinalActive ? (
                    <div className="space-y-6">
                      <div className="rounded-3xl border border-amber-400/20 bg-amber-500/5 p-6">
                        <p className="text-xs uppercase tracking-[0.3em] text-amber-300/70">Финал</p>
                        <h2 className="mt-3 text-3xl font-black text-white">Финальный этап начался</h2>
                        <p className="mt-3 text-sm text-fuchsia-100/75">
                          Сначала ведущий убирает категории по одной, потом вы отправляете скрытую ставку, и только после этого увидите вопрос.
                        </p>
                      </div>

                      {finalState.phase === "categories" ? (
                        <div className="space-y-5">
                          <div className="rounded-3xl border border-amber-400/20 bg-black/20 p-5 text-center">
                            <div className="text-xs uppercase tracking-[0.25em] text-amber-300/70">Сейчас выбирает категорию для удаления</div>
                            <div className="mt-2 text-3xl font-black text-white">{currentFinalChooser?.name || "Игрок"}</div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            {finalRound.categories.map((category) => {
                              const removed = finalState.removedCategories.includes(category);
                              const selected = finalState.selectedCategory === category;
                              return (
                                <div
                                  key={category}
                                  className={`rounded-3xl border px-5 py-6 ${
                                    removed
                                      ? "border-fuchsia-500/10 bg-[#241230] text-fuchsia-100/25"
                                      : selected
                                        ? "border-amber-300 bg-amber-500/15 text-white"
                                        : "border-amber-400/20 bg-black/20 text-white"
                                  }`}
                                >
                                  <div className="text-xl font-bold">{category}</div>
                                  <div className="mt-2 text-sm text-fuchsia-100/70">
                                    {removed ? "Категория убрана" : selected ? "Эта категория осталась на финал" : "Категория ещё участвует"}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : finalState.phase === "wager" ? (
                        <div className="space-y-5">
                          <div className="rounded-3xl border border-amber-400/20 bg-black/20 p-5">
                            <div className="text-xs uppercase tracking-[0.25em] text-amber-300/70">Оставшаяся категория</div>
                            <div className="mt-2 text-3xl font-black text-white">{finalState.selectedCategory}</div>
                            <p className="mt-3 text-sm text-fuchsia-100/75">Введите ставку от 1 до вашего текущего счёта. Вопрос пока скрыт.</p>
                          </div>

                          <form
                            className="rounded-3xl border border-amber-400/20 bg-black/20 p-6"
                            onSubmit={(event) => {
                              event.preventDefault();
                              const formData = new FormData(event.currentTarget);
                              emit("final:setWager", { playerId: account.id, value: formData.get("wager") });
                            }}
                          >
                            <label className="block">
                              <span className="mb-2 block text-sm text-fuchsia-100/80">Ваша ставка</span>
                              <input
                                name="wager"
                                type="number"
                                min="1"
                                max={Math.max(1, currentPlayerScore)}
                                defaultValue={typeof finalState.wagers?.[account.id] === "number" ? finalState.wagers[account.id] : ""}
                                className="w-full rounded-2xl border border-amber-400/20 bg-[#150a21] px-4 py-3 text-white outline-none focus:border-amber-300"
                                placeholder={`От 1 до ${Math.max(1, currentPlayerScore)}`}
                              />
                            </label>
                            <button
                              type="submit"
                              className="mt-4 w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-amber-400"
                            >
                              {typeof finalState.wagers?.[account.id] === "number" ? "Обновить ставку" : "Отправить ставку"}
                            </button>
                          </form>
                        </div>
                      ) : (
                        <div className="space-y-5">
                          <div className="rounded-3xl border border-amber-400/20 bg-black/20 p-5">
                            <div className="text-xs uppercase tracking-[0.25em] text-amber-300/70">Тема финала</div>
                            <div className="mt-2 text-3xl font-black text-white">{finalState.selectedCategory}</div>
                          </div>

                          <div className="rounded-3xl border border-fuchsia-500/20 bg-black/20 p-6">
                            <p className="text-center text-2xl font-bold leading-relaxed text-white">{finalRound.question}</p>
                          </div>

                          {finalState.answerVisible && (
                            <div className="rounded-3xl border border-emerald-400/20 bg-emerald-900/15 p-6">
                              <div className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">Правильный ответ</div>
                              <div className="mt-3 text-2xl font-bold text-white">{finalRound.answer}</div>
                            </div>
                          )}

                          <div className="rounded-3xl border border-amber-400/20 bg-black/20 p-5 text-center text-sm text-fuchsia-100/70">
                            Ведущий проверяет ответы и сам засчитывает ставки.
                          </div>
                        </div>
                      )}
                    </div>
                  ) : !selectedQuestion ? (
                    <div>
                      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-300/70">Игровое поле</p>
                          <h2 className="mt-2 text-3xl font-black">{currentRound.name}</h2>
                        </div>
                        <div className="text-sm text-fuchsia-100/70">Ждите, пока ведущий откроет вопрос</div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                        {currentRound.categories.map((category) => (
                          <div key={category.title} className="overflow-hidden rounded-3xl border border-fuchsia-500/20 bg-[#14081f]">
                            <div className="flex min-h-[96px] items-center justify-center border-b border-fuchsia-500/20 px-3 py-4 text-center text-lg font-bold text-fuchsia-100">
                              {category.title}
                            </div>

                            <div className="grid gap-px bg-fuchsia-500/10">
                              {category.questions.map((item) => {
                                const opened = gameState.openedQuestions?.[getQuestionKey(currentRound.id, category.title, item.price)];
                                return (
                                  <div
                                    key={`${category.title}-${item.price}`}
                                    className={`flex min-h-[88px] items-center justify-center px-3 py-4 text-center text-3xl font-black ${
                                      opened ? "bg-[#241230] text-fuchsia-100/25" : "bg-[#1a0c28] text-fuchsia-300"
                                    }`}
                                  >
                                    {opened ? "—" : item.price}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex min-h-[620px] flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.3em] text-fuchsia-300/70">{currentRound.name}</p>
                            <h2 className="mt-2 text-2xl font-extrabold text-white">{selectedQuestion.categoryTitle}</h2>
                          </div>
                          <div className="rounded-2xl bg-fuchsia-500/10 px-4 py-3 text-center">
                            <div className="text-xs uppercase tracking-[0.25em] text-fuchsia-200/60">Стоимость</div>
                            <div className="text-3xl font-black text-fuchsia-300">{selectedQuestion.price}</div>
                          </div>
                        </div>

                        <div className="mt-6 rounded-3xl border border-fuchsia-500/20 bg-black/20 p-6">
                          <p className="text-center text-2xl font-bold leading-relaxed text-white">{selectedQuestion.question}</p>
                        </div>

                        {selectedQuestion.imageUrl && (
                          <div className="mt-6 rounded-3xl border border-fuchsia-500/20 bg-black/20 p-6">
                            <img
                              src={selectedQuestion.imageUrl}
                              alt="Иллюстрация вопроса"
                              className="max-h-[420px] w-full rounded-2xl object-contain"
                            />
                          </div>
                        )}

                        {gameState.answerVisible && (
                          <div className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-900/15 p-6">
                            <div className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">Правильный ответ</div>
                            <div className="mt-3 text-2xl font-bold text-white">{selectedQuestion.answer}</div>
                          </div>
                        )}
                      </div>

                      <div className="mt-8">
                        <button
                          type="button"
                          onClick={() => emit("buzz:lock", { playerId: account.id })}
                          disabled={
                            !selectedQuestion ||
                            Boolean(gameState.buzzState?.lockedBy) ||
                            gameState.paused ||
                            isCurrentPlayerBlocked ||
                            isCurrentPlayerDisabled ||
                            isForcedToAnotherPlayer ||
                            (gameState.buzzState?.availableAt && buzzCountdownMs > 0) ||
                            (!gameState.buzzState?.active && !(gameState.buzzState?.availableAt && buzzCountdownMs <= 0))
                          }
                          className={`w-full rounded-3xl px-6 py-8 text-2xl font-black transition ${
                            gameState.buzzState?.lockedBy === account.id
                              ? "border border-emerald-400 bg-emerald-600/20 text-white"
                              : "border border-fuchsia-400/35 bg-fuchsia-600 text-white hover:bg-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-40"
                          }`}
                        >
                          {gameState.buzzState?.lockedBy === account.id ? "Вы отвечаете" : "Нажать кнопку ответа"}
                        </button>

                        <div className="mt-4 text-center text-sm text-fuchsia-100/70">
                          {gameState.paused
                            ? "Игра на паузе"
                            : isCurrentPlayerDisabled
                              ? "Ведущий запретил вам отвечать"
                              : isCurrentPlayerBlocked
                                ? "Вы уже ответили неверно и больше не можете отвечать на этот вопрос"
                                : isForcedToAnotherPlayer
                                  ? `Сейчас ведущий заставил отвечать ${playersList.find((player) => player.id === gameState.buzzState?.forcedPlayerId)?.name}`
                                  : gameState.buzzState?.availableAt && buzzCountdownMs > 0
                                    ? `Кнопка станет доступна через ${buzzCountdownSeconds} сек.`
                                    : gameState.buzzState?.lockedBy
                                      ? gameState.buzzState.lockedBy === account.id
                                        ? "Ведущий передал право ответа вам"
                                        : `Сейчас отвечает ${playersList.find((player) => player.id === gameState.buzzState.lockedBy)?.name}`
                                      : "Жми как можно быстрее, когда вопрос открыт"}
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </section>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
