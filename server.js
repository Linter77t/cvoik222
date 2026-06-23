const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");
const { Pool } = require("pg");

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = parseInt(process.env.PORT || "3000", 10);
const databaseUrl = process.env.DATABASE_URL;

const accounts = [
  { id: "host", role: "host", name: "Ведущий", password: "11111111" },
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
        title: "Магшот или фото",
        questions: [
          { price: 100, question: "Это девушка преступница или фото?", answer: "Фото" },
          { price: 200, question: "Это девушка преступница или фото?", answer: "Магшот" },
          { price: 300, question: "Это девушка преступница или фото?", answer: "Магшот" },
          { price: 400, question: "Это девушка преступница или фото?", answer: "Магшот" },
          { price: 500, question: "Это девушка преступница или фото?", answer: "Фото" },
        ],
      },
      {
        title: "Убьет или нет",
        questions: [
          { price: 100, question: "Убьет оно человека или нет?", answer: "Ужасный листолаз (Golden Poison Frog) — УБЬЕТ" },
          { price: 200, question: "Убьет оно человека или нет?", answer: "Толстый лори (Slow Loris) — УБЬЕТ" },
          { price: 300, question: "Убьет оно человека или нет?", answer: "Рыба-фугу (Pufferfish) — НЕ УБЬЕТ" },
          { price: 400, question: "Убьет оно человека или нет?", answer: "Улитка-конус (Cone Snail) — УБЬЕТ" },
          { price: 500, question: "Убьет оно человека или нет?", answer: "Бегемот (Hippopotamus) — УБЬЕТ" },
        ],
      },
      {
        title: "Порно",
        questions: [
          { price: 100, question: "Что это за актер?", answer: "Джонни Синс" },
          { price: 200, question: "Что это за актриса?", answer: "Ева элфи" },
          { price: 300, question: "Что это за актриса?", answer: "Свити фокс" },
          { price: 400, question: "Что это за актриса?", answer: "Диана райдер" },
          { price: 500, question: "Что это за актриса?", answer: "Дженни кити" },
        ],
      },
      {
        title: "Продай мне это",
        questions: [
          { price: 100, question: "Продай мне зонтики для туфель", answer: "бля беру" },
          { price: 200, question: "Продай мне трусы для рук", answer: "бля беру" },
          { price: 300, question: "Продай мне штаны-пикник", answer: "бля беру" },
          { price: 400, question: "Продай мне рюкзак для багетта", answer: "бля беру" },
          { price: 500, question: "Продай мне ...", answer: "бля беру" },
        ],
      },
      {
        title: "Играл со шрифтом и проиграл",
        questions: [
          { price: 100, question: "Что здесь напиписькали", answer: "Граппа" },
          { price: 200, question: "Что здесь напиписькали", answer: "Карамель" },
          { price: 300, question: "Что здесь напиписькали", answer: "Бахус" },
          { price: 400, question: "МОДИФИКАТОР!!!", answer: "Плюс на минус. Если у тебя + баллы то они меняюстя на -, и наоборот." },
          { price: 500, question: "Что здесь напиписькали", answer: "Турка" },
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
        title: "Игрушки",
        questions: [
          { price: 200, question: "Это секс-игрушка или нет?", answer: "Нет: Прибор для ресниц" },
          { price: 400, question: "Это секс-игрушка или нет?", answer: "Нет: перкуссионый массажёр" },
          { price: 600, question: "Это секс-игрушка или нет?", answer: "Да" },
          { price: 800, question: "Это секс-игрушка или нет?", answer: "Да" },
          { price: 1000, question: "Это секс-игрушка или нет?", answer: "Нет: Массажёр для тела" },
        ],
      },
      {
        title: "Шедевр или мазня?",
        questions: [
          { price: 200, question: "Это рисовал я или нет?", answer: "Мазня" },
          { price: 400, question: "Это рисовал я или нет?", answer: "Шедевр" },
          { price: 600, question: "Это рисовал я или нет?", answer: "Мазня" },
          { price: 800, question: "Это рисовал я или нет?", answer: "Шедевр" },
          { price: 1000, question: "Это рисовал я или нет?", answer: "Шедевр" },
        ],
      },
      {
        title: "Уральские пельмени",
        questions: [
          { price: 200, question: "Что там написано?", answer: "Мятый" },
          { price: 400, question: "Что там написано?", answer: "Огородие" },
          { price: 600, question: "Что там написано?", answer: "Уши" },
          { price: 800, question: "Что там написано?", answer: "Ульев" },
          { price: 1000, question: "Что там написано?", answer: "Скалки" },
        ],
      },
      {
        title: "ЧБД",
        questions: [
          { price: 200, question: "МОДИФИКАТОР!!!", answer: "Забери 1000 баллов у кого угодно" },
          { price: 400, question: "Будет гол или нет?", answer: "Да, будет" },
          { price: 600, question: "Забьет ли собака в окно?", answer: "Не забила" },
          { price: 800, question: "Кто из них выиграет?", answer: "Левый" },
          { price: 1000, question: "Кто из них выиграет?", answer: "Правая толстуха" },
        ],
      },
      {
        title: "Черный юмор",
        questions: [
          { price: 200, question: "Все помнят, что это такое. Кроме НЕГО.", answer: "Брюс Уиллис" },
          { price: 400, question: "Согласно шутке, на картинке - набор Лего Французcкая ОНА.", answer: "Французская революция" },
          { price: 600, question: "Назовите басню", answer: "Лебедь, рак и щука" },
          { price: 800, question: "Перед вами памятка пиротехников. Название какого металла скрыто?", answer: "Уран" },
          { price: 1000, question: "Какие слова скрыты?", answer: "Соединенные штаты, Соединённое королевство" },
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
        title: "Игрушки",
        questions: [
          { price: 300, question: "Это секс-игрушка или нет?", answer: "Нет: Поворотное кольцо" },
          { price: 600, question: "Это секс-игрушка или нет?", answer: "Нет: Зубная щетка (для детей)" },
          { price: 900, question: "Это секс-игрушка или нет?", answer: "Да" },
          { price: 1200, question: "Это секс-игрушка или нет?", answer: "Да" },
          { price: 1500, question: "Это секс-игрушка или нет?", answer: "Нет: Портативная колонка" },
        ],
      },
      {
        title: "Учим английский",
        questions: [
          { price: 300, question: "Generator, mechanism, engine, drive", answer: "Engine" },
          { price: 600, question: "Killing, punishment, crime, execution", answer: "Execution" },
          { price: 900, question: "Thunderbolt, flash, discharge, lightning", answer: "Lightning" },
          { price: 1200, question: "Waterway, canal, river, flood", answer: "River" },
          { price: 1500, question: "Аппарат для выхода на орбиту с экипажем или грузом.", answer: "Космический корабль" },
        ],
      },
      {
        title: "Рандомные вопросы",
        questions: [
          { price: 300, question: "Сколько персонажей в доте?", answer: "126" },
          { price: 600, question: "Сколько в сумме всего файлов в папке Видео у меня на компутере?", answer: "1144" },
          { price: 900, question: "Сколько лет моему стакану", answer: "Транслитерация" },
          { price: 1200, question: "Лучшая порно актриса за 2025 год", answer: "Maitland Ward" },
          { price: 1500, question: "Смертельная доза кока колы для человека", answer: "23,2 литра" },
        ],
      },
      {
        title: "Самое, Самое",
        questions: [
          { price: 300, question: "Какая самая большая клавиша на стандартной клавиатуре ноутбука?", answer: "Пробел" },
          { price: 600, question: "МОДИФИКАТОР!!!", answer: "Плюс на минус. Если у тебя + баллы то они меняюстя на -, и наоборот." },
          { price: 900, question: "Какая планета Солнечной системы самая крупная?", answer: "Юпитер/Ювентус" },
          { price: 1200, question: "Какой из континентов на Земле самый маленький по площади?", answer: "Австралия" },
          { price: 1500, question: "Самое большое млекопитающее на Земле?", answer: "Синий кит" },
        ],
      },
      {
        title: "Ну дотка",
        questions: [
          { price: 300, question: "Бараки какого типа имеют увеличенную броню и восстановление здоровья?", answer: "Казармы мечников" },
          { price: 600, question: "После какой из смертей WK спадает эффект ультимейта Windranger?", answer: "Будет действовать после всех" },
          { price: 900, question: "Какой тайминг возрождения рошана?", answer: "8-11 минут" },
          { price: 1200, question: "Сколько героев имеют в качестве ультимейта пассивную способность", answer: "9-12" },
          { price: 1500, question: "Награду за обнаруженный вражеский Observer ward получит владелец первого поставленного Senty или Ближайшего?", answer: "Первого" },
        ],
      },
    ],
  },
];

const defaultFinalRound = {
  categories: [
    "Лудка",
    "Лудка",
    "Лудка",
    "Лудка",
    "Лудка",
    "Лудка",
    "Лудка",
    "Лудка",
    "Лудка",
    "Лудка",
  ],
  question: "Красное, Черное или Зеро",
  answer: "Зеро",
};

function cloneFinalRound(finalRound) {
  return JSON.parse(JSON.stringify(finalRound));
}

function createInitialFinalState() {
  return {
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
  };
}

function getRemainingFinalCategories(finalRound, finalState) {
  return finalRound.categories.filter((category) => !finalState.removedCategories.includes(category));
}

function getNextFinalChooserIndex(currentIndex) {
  const order = createInitialFinalState().chooserOrder;
  return (currentIndex + 1) % order.length;
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

function resetRoundState() {
  gameState.selectedQuestion = null;
  gameState.buzzState = createDefaultBuzzState();
  gameState.answerVisible = false;
}

function resetFinalState() {
  gameState.finalState = createInitialFinalState();
}

function startFinalRound() {
  resetRoundState();
  gameState.finalState = createInitialFinalState();
  gameState.finalState.active = true;
  gameState.finalState.phase = "categories";
}

function isFinalRoundActive() {
  return Boolean(gameState.finalState?.active);
}

function allFinalWagersSubmitted() {
  return Object.values(gameState.finalState?.wagers || {}).every((value) => typeof value === "number");
}

function maybeStartFinalAfterLastRound() {
  const isLastRound = gameState.currentRound === gameState.rounds.length - 1;
  if (!isLastRound || isFinalRoundActive()) return;

  const round = gameState.rounds[gameState.currentRound];
  const allOpened = round.categories.every((category) =>
    category.questions.every((item) => gameState.openedQuestions?.[`${round.id}-${category.title}-${item.price}`]),
  );

  if (allOpened) {
    startFinalRound();
  }
}

const STORAGE_ROW_ID = "main";

function cloneRounds(rounds) {
  return JSON.parse(JSON.stringify(rounds));
}

function createPlayersMap() {
  return {
    player1: { connected: false, nickname: "Игрок 1", socketId: null },
    player2: { connected: false, nickname: "Игрок 2", socketId: null },
    player3: { connected: false, nickname: "Игрок 3", socketId: null },
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

function createInitialGameState() {
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
    finalState: createInitialFinalState(),
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

const pool = databaseUrl
  ? new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("render.com") ? { rejectUnauthorized: false } : false,
    })
  : null;

let gameState = createInitialGameState();
let socketRoles = new Map();
let saveTimer = null;

function getPersistedState() {
  const players = Object.fromEntries(
    Object.entries(gameState.players).map(([playerId, player]) => [
      playerId,
      {
        connected: false,
        nickname: player.nickname,
        socketId: null,
      },
    ]),
  );

  return {
    ...gameState,
    players,
  };
}

async function ensureStorageTable() {
  if (!pool) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS game_state (
      id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function loadStateFromDatabase() {
  if (!pool) return;

  await ensureStorageTable();
  const result = await pool.query("SELECT payload FROM game_state WHERE id = $1", [STORAGE_ROW_ID]);

  if (result.rows.length === 0) {
    await pool.query(
      "INSERT INTO game_state (id, payload, updated_at) VALUES ($1, $2::jsonb, NOW()) ON CONFLICT (id) DO NOTHING",
      [STORAGE_ROW_ID, JSON.stringify(getPersistedState())],
    );
    return;
  }

  const payload = result.rows[0].payload;
  const base = createInitialGameState();
  const rounds = Array.isArray(payload?.rounds) && payload.rounds.length > 0 ? payload.rounds : base.rounds;
  const finalRound = payload?.finalRound ? { ...base.finalRound, ...payload.finalRound } : base.finalRound;

  gameState = {
    ...base,
    ...payload,
    rounds,
    finalRound,
    openedQuestions: payload?.openedQuestions || createInitialOpenedState(rounds),
    scores: { ...base.scores, ...(payload?.scores || {}) },
    players: {
      ...base.players,
      ...(payload?.players || {}),
    },
    buzzState: { ...createDefaultBuzzState(), ...(payload?.buzzState || {}) },
    finalState: {
      ...base.finalState,
      ...(payload?.finalState || {}),
      wagers: { ...base.finalState.wagers, ...(payload?.finalState?.wagers || {}) },
      removedCategories: Array.isArray(payload?.finalState?.removedCategories) ? payload.finalState.removedCategories : [],
      chooserOrder: Array.isArray(payload?.finalState?.chooserOrder)
        ? payload.finalState.chooserOrder
        : base.finalState.chooserOrder,
    },
    messages: {
      ...base.messages,
      ...(payload?.messages || {}),
      personal: {
        ...base.messages.personal,
        ...(payload?.messages?.personal || {}),
      },
    },
  };

  Object.keys(gameState.players).forEach((playerId) => {
    gameState.players[playerId].connected = false;
    gameState.players[playerId].socketId = null;
  });
}

async function saveStateToDatabase() {
  if (!pool) return;

  await pool.query(
    "INSERT INTO game_state (id, payload, updated_at) VALUES ($1, $2::jsonb, NOW()) ON CONFLICT (id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()",
    [STORAGE_ROW_ID, JSON.stringify(getPersistedState())],
  );
}

function scheduleStateSave() {
  if (!pool) return;

  if (saveTimer) {
    clearTimeout(saveTimer);
  }

  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveStateToDatabase().catch((error) => {
      console.error("Failed to save game state", error);
    });
  }, 150);
}

function emitState(io) {
  io.emit("game:state", gameState);
  scheduleStateSave();
}

function getPlayerList() {
  return Object.entries(gameState.players).map(([id, data]) => ({ id, ...data }));
}

function allPlayersConnected() {
  return getPlayerList().every((player) => player.connected);
}

function setRoundIndex(index) {
  gameState.currentRound = index;
  resetRoundState();
  resetFinalState();
}

function hostOnly(socket, callback) {
  const role = socketRoles.get(socket.id);
  if (role !== "host") return;
  callback();
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

loadStateFromDatabase()
  .catch((error) => {
    console.error("Failed to load persisted game state", error);
  })
  .finally(() => {
    app.prepare().then(() => {
      const httpServer = createServer((req, res) => {
        handle(req, res);
      });

      const io = new Server(httpServer, {
        cors: {
          origin: "*",
        },
      });

      io.on("connection", (socket) => {
        socket.emit("game:state", gameState);

        socket.on("auth:login", (payload, callback = () => {}) => {
          const account = accounts.find((item) => item.id === payload?.accountId);

          if (!account) {
            callback({ ok: false, error: "Аккаунт не найден" });
            return;
          }

          if (account.role === "host") {
            if (payload?.password !== account.password) {
              callback({ ok: false, error: "Неверный пароль ведущего" });
              return;
            }
            socketRoles.set(socket.id, "host");
            callback({ ok: true, session: { id: account.id, role: account.role, name: gameState.hostNickname } });
            emitState(io);
            return;
          }

          gameState.players[account.id] = {
            ...gameState.players[account.id],
            connected: true,
            socketId: socket.id,
          };
          socketRoles.set(socket.id, account.id);
          callback({ ok: true, session: { id: account.id, role: account.role, name: gameState.players[account.id].nickname } });
          emitState(io);
        });

        socket.on("auth:logout", () => {
          const role = socketRoles.get(socket.id);
          if (role && role !== "host" && gameState.players[role]) {
            gameState.players[role] = {
              ...gameState.players[role],
              connected: false,
              socketId: null,
            };
          }
          socketRoles.delete(socket.id);
          emitState(io);
        });

        socket.on("game:start", () => {
          hostOnly(socket, () => {
            if (!allPlayersConnected()) return;
            gameState.gameStarted = true;
            gameState.paused = false;
            gameState.openedQuestions = createInitialOpenedState(gameState.rounds);
            resetRoundState();
            resetFinalState();
            gameState.scores = { player1: 0, player2: 0, player3: 0 };
            emitState(io);
          });
        });

        socket.on("game:pauseToggle", () => {
          hostOnly(socket, () => {
            gameState.paused = !gameState.paused;
            if (gameState.selectedQuestion) {
              gameState.buzzState.active = !gameState.paused;
            }
            emitState(io);
          });
        });

        socket.on("game:reset", () => {
          hostOnly(socket, () => {
            const players = gameState.players;
            gameState = createInitialGameState();
            Object.keys(players).forEach((playerId) => {
              gameState.players[playerId].connected = players[playerId].connected;
              gameState.players[playerId].socketId = players[playerId].socketId;
              gameState.players[playerId].nickname = players[playerId].nickname;
            });
            emitState(io);
          });
        });

        socket.on("round:set", (roundIndex) => {
          hostOnly(socket, () => {
            if (roundIndex < 0 || roundIndex >= gameState.rounds.length) return;
            setRoundIndex(roundIndex);
            emitState(io);
          });
        });

        socket.on("round:next", () => {
          hostOnly(socket, () => {
            if (isFinalRoundActive()) return;
            if (gameState.currentRound >= gameState.rounds.length - 1) {
              startFinalRound();
              emitState(io);
              return;
            }
            setRoundIndex(gameState.currentRound + 1);
            emitState(io);
          });
        });

        socket.on("round:prev", () => {
          hostOnly(socket, () => {
            if (gameState.currentRound <= 0) return;
            setRoundIndex(gameState.currentRound - 1);
            emitState(io);
          });
        });

        socket.on("question:open", ({ categoryTitle, price }) => {
          hostOnly(socket, () => {
            if (!gameState.gameStarted || gameState.paused || isFinalRoundActive()) return;
            const round = gameState.rounds[gameState.currentRound];
            const category = round.categories.find((item) => item.title === categoryTitle);
            const question = category?.questions.find((item) => item.price === price);
            if (!question) return;

            gameState.selectedQuestion = {
              categoryTitle,
              roundId: round.id,
              price: question.price,
              question: question.question,
              answer: question.answer,
              imageUrl: question.imageUrl || "",
            };
            gameState.buzzState = {
              ...createDefaultBuzzState(),
              active: false,
              availableAt: Date.now() + 3000,
              disabledPlayers: Object.entries(gameState.players)
                .filter(([, player]) => player.buzzDisabled)
                .map(([playerId]) => playerId),
            };
            gameState.answerVisible = false;
            emitState(io);
          });
        });

        socket.on("question:close", () => {
          hostOnly(socket, () => {
            if (!gameState.selectedQuestion) return;
            const key = `${gameState.selectedQuestion.roundId}-${gameState.selectedQuestion.categoryTitle}-${gameState.selectedQuestion.price}`;
            gameState.openedQuestions[key] = true;
            resetRoundState();
            maybeStartFinalAfterLastRound();
            emitState(io);
          });
        });

        socket.on("question:toggleAnswer", () => {
          hostOnly(socket, () => {
            if (!gameState.selectedQuestion) return;
            gameState.answerVisible = !gameState.answerVisible;
            emitState(io);
          });
        });

        socket.on("question:resetBuzz", () => {
          hostOnly(socket, () => {
            if (!gameState.selectedQuestion || gameState.paused) return;
            gameState.buzzState = {
              ...createDefaultBuzzState(),
              active: true,
              availableAt: Date.now(),
              disabledPlayers: gameState.buzzState.disabledPlayers || [],
              blockedPlayers: gameState.buzzState.blockedPlayers || [],
              forcedPlayerId: gameState.buzzState.forcedPlayerId || null,
            };
            emitState(io);
          });
        });

        socket.on("question:updateField", ({ field, value }) => {
          hostOnly(socket, () => {
            if (!gameState.selectedQuestion) return;
            const { roundId, categoryTitle, price } = gameState.selectedQuestion;
            gameState.selectedQuestion[field] = value;
            gameState.rounds = gameState.rounds.map((round) => {
              if (round.id !== roundId) return round;
              return {
                ...round,
                categories: round.categories.map((category) => {
                  if (category.title !== categoryTitle) return category;
                  return {
                    ...category,
                    questions: category.questions.map((question) =>
                      question.price === price ? { ...question, [field]: value } : question,
                    ),
                  };
                }),
              };
            });
            emitState(io);
          });
        });

        socket.on("score:update", ({ playerId, delta }) => {
          hostOnly(socket, () => {
            if (!(playerId in gameState.scores)) return;
            gameState.scores[playerId] += delta;
            emitState(io);
          });
        });

        socket.on("host:playerControl", ({ playerId, action, value }) => {
          hostOnly(socket, () => {
            if (!gameState.players[playerId]) return;

            if (action === "setDisabled") {
              gameState.players[playerId].buzzDisabled = Boolean(value);
              const disabledPlayers = new Set(gameState.buzzState.disabledPlayers || []);
              if (Boolean(value)) {
                disabledPlayers.add(playerId);
              } else {
                disabledPlayers.delete(playerId);
              }
              gameState.buzzState.disabledPlayers = Array.from(disabledPlayers);
            }

            if (action === "forceAnswer") {
              gameState.buzzState.forcedPlayerId = value ? playerId : null;
              if (value) {
                gameState.buzzState = {
                  ...gameState.buzzState,
                  lockedBy: playerId,
                  active: false,
                  availableAt: Date.now(),
                };
              } else if (gameState.buzzState.lockedBy === playerId) {
                gameState.buzzState.lockedBy = null;
                gameState.buzzState.active = true;
                gameState.buzzState.availableAt = Date.now();
              }
            }

            emitState(io);
          });
        });

        socket.on("host:message", ({ target, playerId, value }) => {
          hostOnly(socket, () => {
            const text = typeof value === "string" ? value : "";
            if (target === "global") {
              gameState.messages.global = text;
              emitState(io);
              return;
            }
            if (target === "personal" && playerId && gameState.messages.personal[playerId] !== undefined) {
              gameState.messages.personal[playerId] = text;
              emitState(io);
            }
          });
        });

        socket.on("question:judgeAnswer", ({ playerId, result }) => {
          hostOnly(socket, () => {
            if (!gameState.selectedQuestion) return;
            if (!(playerId in gameState.scores)) return;
            if (result !== "correct" && result !== "wrong") return;
            if (gameState.buzzState.lockedBy !== playerId) return;

            if (result === "correct") {
              gameState.scores[playerId] += gameState.selectedQuestion.price;
              const key = `${gameState.selectedQuestion.roundId}-${gameState.selectedQuestion.categoryTitle}-${gameState.selectedQuestion.price}`;
              gameState.openedQuestions[key] = true;
              resetRoundState();
              maybeStartFinalAfterLastRound();
              emitState(io);
              return;
            }

            gameState.scores[playerId] -= gameState.selectedQuestion.price;
            gameState.buzzState = {
              ...createDefaultBuzzState(),
              active: true,
              availableAt: Date.now(),
              disabledPlayers: gameState.buzzState.disabledPlayers || [],
              forcedPlayerId: gameState.buzzState.forcedPlayerId || null,
              blockedPlayers: Array.from(new Set([...(gameState.buzzState.blockedPlayers || []), playerId])),
            };
            emitState(io);
          });
        });

        socket.on("buzz:lock", ({ playerId }) => {
          const role = socketRoles.get(socket.id);
          if (!gameState.selectedQuestion || gameState.paused) return;
          if (role !== playerId) return;
          if (gameState.buzzState.lockedBy) return;
          if (gameState.buzzState.availableAt && Date.now() < gameState.buzzState.availableAt) return;
          if ((gameState.buzzState.disabledPlayers || []).includes(playerId)) return;
          if ((gameState.buzzState.blockedPlayers || []).includes(playerId)) return;
          if (gameState.buzzState.forcedPlayerId && gameState.buzzState.forcedPlayerId !== playerId) return;
          if (!gameState.buzzState.active && !(gameState.buzzState.availableAt && Date.now() >= gameState.buzzState.availableAt)) return;
          gameState.buzzState = {
            ...gameState.buzzState,
            lockedBy: playerId,
            active: false,
          };
          emitState(io);
        });

        socket.on("nickname:update", ({ accountId, value }) => {
          const role = socketRoles.get(socket.id);
          const nickname = value?.trim();
          if (!nickname) return;

          if (accountId === "host") {
            if (role !== "host") return;
            gameState.hostNickname = nickname;
            emitState(io);
            return;
          }

          if (role !== "host" && role !== accountId) return;
          if (!gameState.players[accountId]) return;

          gameState.players[accountId].nickname = nickname;
          emitState(io);
        });

        socket.on("question:syncBuzzWindow", () => {
          if (!gameState.selectedQuestion || gameState.paused) return;
          if (gameState.buzzState.availableAt && Date.now() >= gameState.buzzState.availableAt && !gameState.buzzState.lockedBy) {
            gameState.buzzState.active = true;
            emitState(io);
          }
        });

        socket.on("editor:updateRoundName", ({ roundIndex, value }) => {
          hostOnly(socket, () => {
            if (gameState.gameStarted || !gameState.rounds[roundIndex]) return;
            gameState.rounds[roundIndex].name = value;
            emitState(io);
          });
        });

        socket.on("editor:updateCategoryTitle", ({ roundIndex, categoryIndex, value }) => {
          hostOnly(socket, () => {
            if (gameState.gameStarted || !gameState.rounds[roundIndex]?.categories[categoryIndex]) return;
            gameState.rounds[roundIndex].categories[categoryIndex].title = value;
            gameState.openedQuestions = createInitialOpenedState(gameState.rounds);
            emitState(io);
          });
        });

        socket.on("editor:updateQuestionField", ({ roundIndex, categoryIndex, questionIndex, field, value }) => {
          hostOnly(socket, () => {
            if (gameState.gameStarted) return;
            const question = gameState.rounds[roundIndex]?.categories[categoryIndex]?.questions[questionIndex];
            if (!question) return;
            question[field] = field === "price" ? Number(value) : value;
            emitState(io);
          });
        });

        socket.on("editor:addCategory", ({ roundIndex }) => {
          hostOnly(socket, () => {
            if (gameState.gameStarted || !gameState.rounds[roundIndex]) return;
            const round = gameState.rounds[roundIndex];
            const prices = round.values.length ? round.values : [100, 200, 300, 400, 500];
            round.categories.push({
              title: `Новая категория ${round.categories.length + 1}`,
              questions: prices.map((price) => ({ price, question: "Новый вопрос", answer: "Новый ответ", imageUrl: "" })),
            });
            gameState.openedQuestions = createInitialOpenedState(gameState.rounds);
            emitState(io);
          });
        });

        socket.on("editor:removeCategory", ({ roundIndex, categoryIndex }) => {
          hostOnly(socket, () => {
            if (gameState.gameStarted || !gameState.rounds[roundIndex]) return;
            gameState.rounds[roundIndex].categories = gameState.rounds[roundIndex].categories.filter((_, index) => index !== categoryIndex);
            gameState.openedQuestions = createInitialOpenedState(gameState.rounds);
            emitState(io);
          });
        });

        socket.on("editor:updateFinalCategory", ({ categoryIndex, value }) => {
          hostOnly(socket, () => {
            if (gameState.gameStarted || !gameState.finalRound.categories[categoryIndex]) return;
            const trimmed = value?.trim();
            if (!trimmed) return;
            gameState.finalRound.categories[categoryIndex] = trimmed;
            emitState(io);
          });
        });

        socket.on("editor:updateFinalField", ({ field, value }) => {
          hostOnly(socket, () => {
            if (gameState.gameStarted) return;
            if (!["question", "answer"].includes(field)) return;
            gameState.finalRound[field] = value;
            emitState(io);
          });
        });

        socket.on("final:removeCategory", ({ categoryTitle }) => {
          hostOnly(socket, () => {
            if (!isFinalRoundActive() || gameState.finalState.phase !== "categories") return;
            const remainingCategories = getRemainingFinalCategories(gameState.finalRound, gameState.finalState);
            if (!remainingCategories.includes(categoryTitle)) return;

            gameState.finalState.removedCategories.push(categoryTitle);
            const updatedRemaining = getRemainingFinalCategories(gameState.finalRound, gameState.finalState);

            if (updatedRemaining.length <= 1) {
              gameState.finalState.selectedCategory = updatedRemaining[0] || null;
              gameState.finalState.phase = "wager";
            } else {
              gameState.finalState.currentChooserIndex = getNextFinalChooserIndex(gameState.finalState.currentChooserIndex);
            }

            emitState(io);
          });
        });

        socket.on("final:setWager", ({ playerId, value }) => {
          const role = socketRoles.get(socket.id);
          if (!isFinalRoundActive() || gameState.finalState.phase !== "wager") return;
          if (role !== playerId) return;
          if (!(playerId in gameState.scores)) return;

          const numericValue = Number(value);
          const maxWager = Math.max(1, Number(gameState.scores[playerId] || 0));
          if (!Number.isInteger(numericValue) || numericValue < 1 || numericValue > maxWager) return;

          gameState.finalState.wagers[playerId] = numericValue;
          emitState(io);
        });

        socket.on("final:revealQuestion", () => {
          hostOnly(socket, () => {
            if (!isFinalRoundActive() || gameState.finalState.phase !== "wager") return;
            if (!allFinalWagersSubmitted()) return;
            gameState.finalState.phase = "question";
            emitState(io);
          });
        });

        socket.on("final:toggleAnswer", () => {
          hostOnly(socket, () => {
            if (!isFinalRoundActive() || gameState.finalState.phase !== "question") return;
            gameState.finalState.answerVisible = !gameState.finalState.answerVisible;
            emitState(io);
          });
        });

        socket.on("final:applyWager", ({ playerId, result }) => {
          hostOnly(socket, () => {
            if (!isFinalRoundActive() || gameState.finalState.phase !== "question") return;
            if (!(playerId in gameState.scores)) return;
            const wager = gameState.finalState.wagers[playerId];
            if (typeof wager !== "number") return;
            if (result !== "correct" && result !== "wrong") return;
            if (gameState.finalState.wagerResults[playerId]) return;

            gameState.finalState.wagerResults[playerId] = result;
            gameState.scores[playerId] += result === "correct" ? wager : -wager;
            emitState(io);
          });
        });

        socket.on("disconnect", () => {
          const role = socketRoles.get(socket.id);
          if (role && role !== "host" && gameState.players[role]) {
            gameState.players[role] = {
              ...gameState.players[role],
              connected: false,
              socketId: null,
            };
          }
          socketRoles.delete(socket.id);
          emitState(io);
        });
      });

      httpServer
        .once("error", (err) => {
          console.error(err);
          process.exit(1);
        })
        .listen(port, hostname, () => {
          console.log(`> Ready on http://${hostname}:${port}`);
          if (!pool) {
            console.log("> DATABASE_URL is not set. Game settings will reset after server restart.");
          }
        });
    });
  });
