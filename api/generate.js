const fs = require("fs");
const path = require("path");

// Кэш каталога в памяти
let cachedCatalog = null;

// Описания категорий, чтобы нейронка понимала про что каждая
const CATEGORY_HINTS = {
  "Простое и предметы": "предметы быта, вещи в сумке, кармане, на кухне, дома",
  "Еда и напитки": "фрукты, овощи, блюда, напитки, десерты, соусы",
  "Животные": "млекопитающие, птицы, рыбы, насекомые, домашние животные, породы",
  "Игры и развлечения": "видеоигры, настольные игры, карточные игры, игры с мячом",
  "Кино, сериалы, мультфильмы": "фильмы, сериалы, мультфильмы, актёры, режиссёры",
  "Музыка": "песни, певцы, группы, музыкальные жанры, инструменты",
  "Спорт": "виды спорта, спортсмены, клубы, турниры, инвентарь",
  "География": "страны, города, реки, горы, моря, достопримечательности",
  "Люди": "профессии, имена, эмоции, черты характера, хобби",
  "Бренды и техника": "бренды, телефоны, компьютеры, гаджеты, бытовая техника",
  "Интернет, соцсети, мемы": "соцсети, мессенджеры, мемы, блогеры, сайты",
  "Повседневное и праздники": "бытовые дела, праздники, подарки, традиции",
  "Одежда и стиль": "одежда, обувь, головные уборы, аксессуары, украшения",
  "Транспорт": "машины, самолёты, корабли, велосипеды, поезда",
  "Оружие и приключения": "оружие, вещи для похода, инструменты, кемпинг",
  "Растения": "деревья, цветы, ягоды, грибы, комнатные растения, травы",
  "Тело и здоровье": "части тела, органы, болезни, лекарства, врачи, витамины",
  "Космос и Вселенная": "планеты, звёзды, созвездия, космонавты, ракеты, галактики",
  "Аниме": "названия аниме, персонажи, студии, жанры аниме",
  "Книги и сказки": "сказки, книги, писатели, литературные персонажи, жанры",
  "Знаменитости и шоу-бизнес": "актёры, певцы, блогеры, ведущие, комики",
  "Персонажи и вселенные": "супергерои, злодеи, персонажи фильмов, игр и книг, Marvel, DC, Disney",
  "История": "правители, войны, открытия, древние цивилизации, эпохи",
  "Мифология и фэнтези": "мифические существа, боги, артефакты, волшебники, драконы",
  "Школа и учёба": "школьные предметы, канцелярия, экзамены, школьные локации",
  "Математика, фигуры и измерения": "геометрические фигуры, единицы измерения, математические термины",
  "Физика и открытия": "физические явления, изобретения, учёные, виды энергии",
  "Биология и химия": "химические элементы, газы, витамины, микроорганизмы, лабораторная посуда",
  "Для Марии Уваровой": "Genshin Impact (персонажи, регионы Мондштадт/Ли Юэ/Инадзума/Сумеру/Фонтейн/Натлан, стихии Анемо/Гео/Электро/Дендро/Пиро/Крио/Гидро, оружие, артефакты, боссы), K-pop (BTS, Blackpink, Twice, Stray Kids, NewJeans, Aespa), Roblox игры, Brawl Stars бойцы, Minecraft мобы, тренды TikTok, молодёжный сленг",
  "Для Екатерины": "декоративная косметика (косметика для глаз, губ, лица), уход за кожей (увлажнение, очищение, SPF, патчи, пилинги, маски), парфюмерия (бренды, ноты ароматов — цветочные, древесные, цитрусовые, восточные, форматы), бренды одежды (масс-маркет, премиум, российские), виды маникюра (с рисунком, стразами, сезонный), магазин Золотое Яблоко, кисти для макияжа, средства для волос и тела",
  "Для Дарьи Гаценко": "Phasmophobia (призраки: Дух/Призрак/Фантом/Полтергейст/Банши/Джинн/Маре/Ревенант/Тень/Демон/Юрэй/Они, оборудование: EMF-ридер/видеокамера/фонарь/термометр/диктофон/распятие, доказательства, локации: Tanglewood/Ridgeview/Edgefield/Bleasdale/Grafton), osu! (круг, слайдер, спиннер, стрим, джамп, комбо, режимы), китайский язык (бытовые слова, цифры, блюда), психология (фобии, эмоции, типы личности, психологи, психотерапия)"
};

function loadCatalog() {
  if (cachedCatalog) return cachedCatalog;
  
  try {
    const filePath = path.join(process.cwd(), "app", "categories", "categories.json");
    cachedCatalog = JSON.parse(fs.readFileSync(filePath, "utf8"));
    return cachedCatalog;
  } catch (e) {
    console.warn("categories.json not found, falling back to empty catalog");
    cachedCatalog = {};
    return cachedCatalog;
  }
}

function expandCatalog(catalog) {
  return catalog;
}

function getTopic(category) {
  const catalog = expandCatalog(loadCatalog());
  const keys = Object.keys(catalog);
  if (keys.length === 0) {
    return { category: null, topic: null, source: "offline-empty" };
  }
  const categories = category && catalog[category] ? [category] : keys;
  const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
  const topics = catalog[selectedCategory];
  return {
    category: selectedCategory,
    topic: topics[Math.floor(Math.random() * topics.length)],
    source: "offline"
  };
}

function promptFor(category, mode, round) {
  const allCategoryNames = Object.keys(CATEGORY_HINTS);
  let selected;

  if (category && category !== "Все" && CATEGORY_HINTS[category]) {
    const hint = CATEGORY_HINTS[category];
    selected = `Категория СТРОГО: "${category}". Описание категории: ${hint}. Сгенерируй тему ТОЛЬКО в рамках этой категории, не выходи за её пределы. В поле category ответа ОБЯЗАТЕЛЬНО напиши "${category}".`;
  } else if (category && category !== "Все") {
    // Категория выбрана, но нет в словаре — просто жёстко фиксируем
    selected = `Категория СТРОГО: "${category}". В поле category ответа ОБЯЗАТЕЛЬНО напиши "${category}".`;
  } else {
    selected = `Выбери одну категорию из этого списка: ${allCategoryNames.join(", ")}. Сгенерируй тему в выбранной категории и укажи её название в поле category.`;
  }

  return `Ты ведущий настольной игры "Кто назовёт больше". Игрок должен за 30 секунд назвать много ответов вслух. Сгенерируй одну короткую тему на русском языке.

${selected}

Верни ТОЛЬКО JSON без Markdown и без пояснений в формате: {"category":"...","topic":"Назови ..."}

ПРАВИЛА:
1. Тема должна быть понятна обычному человеку без специальных знаний.
2. В теме должно быть 15-40 очевидных ответов, которые можно вспомнить за 30 секунд.
3. ЗАПРЕЩЕНЫ формулировки: "которые знают почти все", "легко вспомнить", "которые есть у каждого", "популярные".
4. ЗАПРЕЩЕНЫ узкие темы: "участники BTS" (их всего 7), "изотопы водорода", "регионы Мондштадта" (это один регион).
5. Используй конкретные формулировки: "Назови фрукты", "Назови зимние виды спорта", "Назови блюда из картошки", "Назови персонажей с элементом Пиро", "Назови призраков в Phasmophobia".`;
}

function batchPrompt(category, mode, rounds) {
  const allCategoryNames = Object.keys(CATEGORY_HINTS);
  let selected;

  if (category && category !== "Все" && CATEGORY_HINTS[category]) {
    const hint = CATEGORY_HINTS[category];
    selected = `Категория СТРОГО: "${category}". Описание: ${hint}. Все ${rounds} тем должны быть ТОЛЬКО в этой категории. В поле category каждой темы ОБЯЗАТЕЛЬНО пиши "${category}".`;
  } else if (category && category !== "Все") {
    selected = `Используй только категорию "${category}". В поле category каждой темы пиши "${category}".`;
  } else {
    selected = `Выбирай темы из списка: ${allCategoryNames.join(", ")}.`;
  }

  return `Ты ведущий настольной игры "Кто назовёт больше". ${selected} Сгенерируй ${rounds} РАЗНЫХ коротких тем на русском языке.

Верни ТОЛЬКО JSON без Markdown и без пояснений в формате: {"topics":[{"category":"...","topic":"Назови ..."}]}. В массиве должно быть ровно ${rounds} объектов.

ПРАВИЛА:
1. Каждая тема понятна обычному человеку без специальных знаний.
2. В каждой теме 15-40 очевидных ответов.
3. Все темы разные, без повторов.
4. ЗАПРЕЩЕНЫ формулировки: "которые знают почти все", "легко вспомнить", "популярные".
5. ЗАПРЕЩЕНЫ узкие темы типа "участники BTS", "изотопы водорода".`;
}

async function requestJson(url, apiKey, body, headers = {}, isBatch = false) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), isBatch ? 20000 : 10000);
  
  try {
    const result = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...headers
      },
      body: JSON.stringify(body)
    });
    
    if (!result.ok) {
      const text = await result.text().catch(() => "");
      console.error(`Provider HTTP ${result.status}: ${text}`);
      throw new Error(`Provider HTTP ${result.status}`);
    }
    
    return await result.json();
  } finally {
    clearTimeout(timeout);
  }
}

function cleanJsonResponse(content) {
  if (!content) return null;
  // Убираем markdown-обёртки и лишние пробелы
  let clean = content
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();
  
  // Иногда нейронка добавляет пояснения перед JSON — пробуем найти JSON
  const jsonMatch = clean.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    clean = jsonMatch[0];
  }
  
  try {
    return JSON.parse(clean);
  } catch (e) {
    console.error("JSON parse error:", e.message, "Content:", clean.slice(0, 200));
    return null;
  }
}

async function getOnlineTopic(payload) {
  const prompt = promptFor(payload.category, payload.mode, payload.round);
  // Категория которую выбрал пользователь — она и должна вернуться в ответе
  const userCategory = payload.category && payload.category !== "Все" ? payload.category : null;
  
  // Groq
  if (process.env.GROQ_API_KEY) {
    try {
      console.log("Trying Groq llama-3.3-70b-versatile...");
      const body = await requestJson(
        "https://api.groq.com/openai/v1/chat/completions",
        process.env.GROQ_API_KEY,
        {
          model: "llama-3.3-70b-versatile",
          temperature: 0.8,
          max_tokens: 150,
          messages: [{ role: "user", content: prompt }]
        }
      );
      
      const content = body.choices?.[0]?.message?.content;
      const parsed = cleanJsonResponse(content);
      if (parsed?.topic) {
        console.log("✓ Groq success, topic:", parsed.topic);
        return {
          category: userCategory || parsed.category || "Разное",
          topic: parsed.topic,
          source: "groq"
        };
      }
    } catch (error) {
      console.error("Groq failed:", error.message);
    }
  }
  
  // OpenRouter
  if (process.env.OPENROUTER_API_KEY) {
    try {
      console.log("Trying OpenRouter free...");
      const body = await requestJson(
        "https://openrouter.ai/api/v1/chat/completions",
        process.env.OPENROUTER_API_KEY,
        {
          model: "openrouter/free",
          temperature: 0.8,
          max_tokens: 150,
          messages: [{ role: "user", content: prompt }]
        },
        {
          "HTTP-Referer": "https://vercel.com",
          "X-Title": "Who Names More"
        }
      );
      
      const content = body.choices?.[0]?.message?.content;
      const parsed = cleanJsonResponse(content);
      if (parsed?.topic) {
        console.log("✓ OpenRouter success, topic:", parsed.topic);
        return {
          category: userCategory || parsed.category || "Разное",
          topic: parsed.topic,
          source: "openrouter"
        };
      }
    } catch (error) {
      console.error("OpenRouter failed:", error.message);
    }
  }
  
  console.log("All providers failed, returning null");
  return null;
}

async function getOnlineTopics(payload) {
  const prompt = batchPrompt(payload.category, payload.mode, payload.rounds);
  const userCategory = payload.category && payload.category !== "Все" ? payload.category : null;
  
  const providers = [
    [process.env.GROQ_API_KEY, "https://api.groq.com/openai/v1/chat/completions", "llama-3.3-70b-versatile", {}],
    [process.env.OPENROUTER_API_KEY, "https://openrouter.ai/api/v1/chat/completions", "openrouter/free", {
      "HTTP-Referer": "https://vercel.com",
      "X-Title": "Who Names More"
    }]
  ];
  
  for (const [key, url, model, headers] of providers) {
    if (!key) continue;
    try {
      console.log(`Trying batch on ${model}...`);
      const body = await requestJson(
        url, key,
        {
          model,
          temperature: 0.8,
          max_tokens: Math.max(400, payload.rounds * 100),
          messages: [{ role: "user", content: prompt }]
        },
        headers,
        true
      );
      
      const content = body.choices?.[0]?.message?.content;
      const parsed = cleanJsonResponse(content);
      
      if (Array.isArray(parsed?.topics) && parsed.topics.length >= payload.rounds) {
        console.log(`✓ Batch success on ${model}`);
        // Принудительно подставляем категорию пользователя, если он её выбрал
        const topics = parsed.topics.slice(0, payload.rounds).map(t => ({
          category: userCategory || t.category || "Разное",
          topic: t.topic
        }));
        return { topics, source: model };
      }
    } catch (error) {
      console.error(`Batch ${model} failed:`, error.message);
    }
  }
  
  return null;
}

module.exports = async (request, response) => {
  if (request.method === "GET") {
    return response.status(200).json({
      ok: true,
      provider: "offline",
      groq: !!process.env.GROQ_API_KEY,
      openrouter: !!process.env.OPENROUTER_API_KEY,
      categories: Object.keys(CATEGORY_HINTS).length
    });
  }

  if (request.method !== "POST") {
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = request.body || {};
    
    if (payload.source === "online") {
      if (payload.batch && Number(payload.rounds) > 0) {
        const onlineTopics = await getOnlineTopics({ ...payload, rounds: Number(payload.rounds) });
        if (onlineTopics) {
          return response.status(200).json(onlineTopics);
        }
        return response.status(200).json({
          topics: Array.from({ length: Number(payload.rounds) }, () => getTopic(payload.category)),
          source: "offline"
        });
      }
      
      const online = await getOnlineTopic(payload);
      if (online?.topic) {
        return response.status(200).json(online);
      }
    }
    
    const offline = getTopic(payload.category);
    return response.status(200).json(offline);
    
  } catch (error) {
    console.error("Handler error:", error);
    return response.status(500).json({ error: "Unable to generate topic" });
  }
};