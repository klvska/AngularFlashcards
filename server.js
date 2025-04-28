const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = "sekretny_klucz"; // Zmień na bezpieczny klucz w środowisku produkcyjnym

app.use(cors());
app.use(express.json());

// Funkcja do aktualizacji statystyk użytkownika
async function updateUserStats(userId) {
  try {
    // Pobierz wszystkie próby quizów użytkownika
    const attempts = await prisma.quizAttempt.findMany({
      where: { userId },
    });

    // Oblicz średni wynik
    const averageScore =
      attempts.length > 0
        ? attempts.reduce((sum, attempt) => sum + attempt.score, 0) /
          attempts.length
        : 0;

    // Pobierz zestawy użytkownika
    const userSets = await prisma.set.findMany({
      where: { userId },
      include: { flashcards: true },
    });

    // Oblicz całkowitą liczbę fiszek
    const totalFlashcards = userSets.reduce(
      (sum, set) => sum + set.flashcards.length,
      0
    );

    // Aktualizuj lub utwórz statystyki użytkownika
    await prisma.userStats.upsert({
      where: { userId },
      update: {
        totalQuizzes: attempts.length,
        averageScore,
        totalFlashcards,
      },
      create: {
        userId,
        totalQuizzes: attempts.length,
        averageScore,
        totalFlashcards,
        masteredFlashcards: 0,
      },
    });
  } catch (error) {
    console.error("Błąd podczas aktualizacji statystyk użytkownika:", error);
  }
}

// Middleware do weryfikacji tokena
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Brak tokena" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Nieprawidłowy token" });
    req.user = user;
    next();
  });
}

// Endpoint rejestracji
app.post("/auth/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    console.error("Błąd rejestracji:", error);
    res.status(500).json({ error: "Błąd rejestracji użytkownika" });
  }
});

// Endpoint logowania
app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "Użytkownik nie znaleziony" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Nieprawidłowe hasło" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "Logowanie udane", token });
  } catch (error) {
    console.error("Błąd logowania:", error);
    res.status(500).json({ error: "Błąd logowania" });
  }
});

// Endpoint pobierania zestawów (dostępny dla wszystkich)
app.get("/sets", async (req, res) => {
  try {
    const sets = await prisma.set.findMany({
      include: { flashcards: true, user: true }, // Dodaj `user`
    });
    res.json(sets);
  } catch (error) {
    console.error("Błąd pobierania zestawów:", error);
    res.status(500).json({ error: "Błąd pobierania zestawów" });
  }
});

// Endpoint pobierania szczegółów zestawu
app.get("/sets/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const set = await prisma.set.findUnique({
      where: { id: parseInt(id, 10) },
      include: { flashcards: true, user: true }, // Uwzględnij fiszki i użytkownika
    });

    if (!set) {
      return res.status(404).json({ error: "Zestaw nie znaleziony" });
    }

    res.json(set);
  } catch (error) {
    console.error("Błąd pobierania szczegółów zestawu:", error);
    res.status(500).json({ error: "Błąd pobierania szczegółów zestawu" });
  }
});

app.get("/users/sets", authenticateToken, async (req, res) => {
  try {
    const userSets = await prisma.set.findMany({
      where: { userId: req.user.id }, // Pobieranie zestawów dla zalogowanego użytkownika
    });
    res.json(userSets);
  } catch (error) {
    console.error("Błąd pobierania zestawów użytkownika:", error);
    res.status(500).json({ error: "Błąd pobierania zestawów użytkownika" });
  }
});

// Endpoint statystyk użytkownika
app.get("/users/stats", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Liczba zestawów
    const setsCount = await prisma.set.count({ where: { userId } });

    // Pobierz ID zestawów użytkownika
    const userSets = await prisma.set.findMany({ where: { userId } });
    const setIds = userSets.map((set) => set.id);

    // Liczba fiszek
    const flashcardsCount = await prisma.flashcard.count({
      where: { setId: { in: setIds } },
    });

    // Liczba quizów
    const quizzesCount = await prisma.quiz.count({
      where: { setId: { in: setIds } },
    });

    // Średni wynik z quizów (QuizAttempt)
    const attempts = await prisma.quizAttempt.findMany({ where: { userId } });
    const averageScore =
      attempts.length > 0
        ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length
        : 0;

    res.json({
      setsCount,
      flashcardsCount,
      quizzesCount,
      averageScore: Math.round(averageScore * 100) / 100,
    });
  } catch (error) {
    console.error("Błąd pobierania statystyk użytkownika:", error);
    res.status(500).json({
      error: "Błąd pobierania statystyk użytkownika",
      details: error.message,
    });
  }
});

// Endpoint tworzenia zestawu (tylko dla zalogowanych użytkowników)
app.post("/sets", authenticateToken, async (req, res) => {
  const { name } = req.body;

  try {
    const newSet = await prisma.set.create({
      data: { name, userId: req.user.id },
    });
    res.json(newSet);
  } catch (error) {
    console.error("Błąd tworzenia zestawu:", error);
    res.status(500).json({ error: "Błąd tworzenia zestawu" });
  }
});

app.post("/flashcards/bulk", authenticateToken, async (req, res) => {
  const { flashcards } = req.body;

  try {
    if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
      return res.status(400).json({
        error:
          "Nieprawidłowe dane wejściowe: flashcards musi być tablicą i nie może być pusta",
      });
    }

    // Sprawdź, czy wszystkie fiszki mają poprawny setId
    const setId = flashcards[0].setId;
    if (!setId || isNaN(parseInt(setId, 10))) {
      return res
        .status(400)
        .json({ error: "Nieprawidłowy setId: musi być liczbą" });
    }

    const existingSet = await prisma.set.findUnique({
      where: { id: parseInt(setId, 10) },
    });

    if (!existingSet) {
      return res
        .status(400)
        .json({ error: "Nieprawidłowy setId: zestaw nie istnieje" });
    }

    const createdFlashcards = await prisma.flashcard.createMany({
      data: flashcards.map((f) => ({
        question: f.question,
        answer: f.answer,
        setId: parseInt(f.setId, 10),
      })),
    });

    res.status(201).json({
      message: "Fiszki zostały dodane",
      count: createdFlashcards.count,
    });
  } catch (error) {
    console.error("Błąd dodawania fiszek:", error.message, error.stack);
    res
      .status(500)
      .json({ error: "Błąd dodawania fiszek", details: error.message });
  }
});
// Endpoint dodawania fiszki (z poprawką setId)
app.post("/flashcards", authenticateToken, async (req, res) => {
  const { question, answer, setId } = req.body;

  try {
    const newFlashcard = await prisma.flashcard.create({
      data: {
        question,
        answer,
        setId: parseInt(setId, 10), // Konwersja na Int
      },
    });
    res.json(newFlashcard);
  } catch (error) {
    console.error("Błąd tworzenia fiszki:", error);
    res.status(500).json({ error: "Błąd tworzenia fiszki" });
  }
});

// Endpoint edycji fiszki (tylko dla zalogowanych)
app.put("/flashcards/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  try {
    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: parseInt(id, 10) },
      data: { question, answer },
    });
    res.json(updatedFlashcard);
  } catch (error) {
    console.error("Błąd edycji fiszki:", error);
    res.status(500).json({ error: "Błąd edycji fiszki" });
  }
});

// Endpoint usuwania fiszki (tylko dla zalogowanych)
app.delete("/flashcards/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.flashcard.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Błąd usuwania fiszki:", error);
    res.status(500).json({ error: "Błąd usuwania fiszki" });
  }
});

// Endpoint edycji zestawu (tylko dla zalogowanych)
app.put("/sets/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedSet = await prisma.set.update({
      where: { id: parseInt(id, 10) },
      data: { name },
    });
    res.json(updatedSet);
  } catch (error) {
    console.error("Błąd edycji zestawu:", error);
    res.status(500).json({ error: "Błąd edycji zestawu" });
  }
});

// Endpoint usuwania zestawu (tylko dla zalogowanych)
app.delete("/sets/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.set.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Błąd usuwania zestawu:", error);
    res.status(500).json({ error: "Błąd usuwania zestawu" });
  }
});

app.put("/sets/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const updatedSet = await prisma.set.update({
      where: { id: parseInt(id, 10) },
      data: req.body,
    });
    res.json(updatedSet);
  } catch (error) {
    console.error("Błąd aktualizacji zestawu:", error);
    res.status(500).json({ error: "Błąd aktualizacji zestawu" });
  }
});

// Endpoint do zapisywania wyników quizów
app.post("/quiz-attempts", authenticateToken, async (req, res) => {
  try {
    const { quizId, score, timeSpent } = req.body;
    const userId = req.user.id;

    // Walidacja danych wejściowych
    if (!quizId || score === undefined || timeSpent === undefined) {
      return res.status(400).json({ error: "Brakujące wymagane pola" });
    }

    // Sprawdź, czy quiz istnieje
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return res.status(404).json({ error: "Quiz nie znaleziony" });
    }

    // Sprawdź, czy użytkownik istnieje
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "Użytkownik nie znaleziony" });
    }

    console.log("Próba utworzenia quizAttempt z danymi:", {
      userId,
      quizId,
      score,
      timeSpent,
    });

    const quizAttempt = await prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        score,
        timeSpent,
      },
    });

    // Aktualizuj statystyki użytkownika
    await updateUserStats(userId);

    res.status(201).json(quizAttempt);
  } catch (error) {
    console.error("Błąd podczas zapisywania wyniku quizu:", error);
    res.status(500).json({ error: "Błąd podczas zapisywania wyniku quizu" });
  }
});

// Endpoint do tworzenia quizu
app.post("/sets/:id/quiz", authenticateToken, async (req, res) => {
  try {
    const setId = parseInt(req.params.id, 10);

    // Sprawdź, czy zestaw istnieje
    const set = await prisma.set.findUnique({
      where: { id: setId },
    });

    if (!set) {
      return res.status(404).json({ error: "Zestaw nie znaleziony" });
    }

    // Utwórz quiz
    const quiz = await prisma.quiz.create({
      data: {
        name: `Quiz dla zestawu ${set.name}`,
        description: `Quiz utworzony dla zestawu ${set.name}`,
        setId: setId,
      },
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error("Błąd tworzenia quizu:", error);
    res.status(500).json({ error: "Błąd tworzenia quizu" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
