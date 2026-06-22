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

function cloneRounds(rounds) {
  return JSON.parse(JSON.stringify(rounds));
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
    scores: {
      player1: 0,
      player2: 0,
      player3: 0,
    },
    currentRound: 0,
    openedQuestions: createInitialOpenedState(rounds),
    selectedQuestion: null,
    buzzState: { lockedBy: null, active: false },
    answerVisible: false,
    hostNotes: "",
    gameStarted: false,
    paused: false,
    players: createPlayersMap(),
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

export default function IndexPage() {
  const socketRef = useRef(null);
  const [session, setSession] = useState(null);
  const [loginForm, setLoginForm] = useState({ accountId: "host", password: "" });
  const [loginError, setLoginError] = useState("");
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState(createEmptyState);

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
                      disabled={safeCurrentRoundIndex === safeRounds.length - 1}
                    >
                      Следующий раунд
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

              <section className="grid gap-6 xl:grid-cols-[1.05fr_1.95fr]">
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
                        <h2 className="mt-2 text-2xl font-bold">{currentRound.name}</h2>
                      </div>
                      <div className="rounded-2xl bg-fuchsia-500/10 px-4 py-3 text-right">
                        <div className="text-xs text-fuchsia-200/70">Осталось вопросов</div>
                        <div className="text-2xl font-black text-fuchsia-300">{remainingInRound}</div>
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
                              safeCurrentRoundIndex === index
                                ? "border-fuchsia-400 bg-fuchsia-700/20 text-white"
                                : "border-fuchsia-500/20 bg-black/20 text-fuchsia-100/80 hover:border-fuchsia-400/50"
                            }`}
                          >
                            <div className="text-sm font-bold">{item.name}</div>
                            <div className="mt-1 text-xs text-fuchsia-200/60">Категорий: {item.categories.length}</div>
                          </button>
                        ))}
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

                        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
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
                                    : gameState.buzzState?.active
                                      ? "bg-fuchsia-500/20 text-fuchsia-200"
                                      : "bg-white/10 text-white/70"
                                }`}
                              >
                                {gameState.buzzState?.lockedBy
                                  ? "Кнопка зафиксирована"
                                  : gameState.buzzState?.active
                                    ? "Ожидание нажатия"
                                    : "Пауза"}
                              </div>
                            </div>

                            {gameState.answerVisible && (
                              <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-900/15 p-4">
                                <div className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">Ответ</div>
                                <div className="mt-2 text-xl font-bold text-white">{selectedQuestion.answer}</div>
                              </div>
                            )}
                          </div>

                          <div className="rounded-3xl border border-fuchsia-500/20 bg-black/20 p-5">
                            <label className="block text-xs uppercase tracking-[0.25em] text-fuchsia-300/70" htmlFor="host-notes">
                              Заметки ведущего
                            </label>
                            <textarea
                              id="host-notes"
                              value={gameState.hostNotes}
                              onChange={(event) => emit("game:updateHostNotes", event.target.value)}
                              placeholder="Записи ведущего"
                              className="mt-3 h-40 w-full rounded-2xl border border-fuchsia-500/20 bg-[#150a21] px-4 py-3 text-sm text-white outline-none transition placeholder:text-fuchsia-200/30 focus:border-fuchsia-400"
                            />
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
                    </div>
                  )}
                </section>
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
                          disabled={!selectedQuestion || !gameState.buzzState?.active || Boolean(gameState.buzzState?.lockedBy) || gameState.paused}
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
