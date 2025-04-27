const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = 'sekretny_klucz'; // Zmień na bezpieczny klucz w środowisku produkcyjnym

app.use(cors());
app.use(express.json());

// Middleware do weryfikacji tokena
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Brak tokena' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Nieprawidłowy token' });
    req.user = user;
    next();
  });
}

// Endpoint rejestracji
app.post('/auth/register', async (req, res) => {
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
    console.error('Błąd rejestracji:', error);
    res.status(500).json({ error: 'Błąd rejestracji użytkownika' });
  }
});

// Endpoint logowania
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Nieprawidłowe hasło' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Logowanie udane', token });
  } catch (error) {
    console.error('Błąd logowania:', error);
    res.status(500).json({ error: 'Błąd logowania' });
  }
});

// Endpoint pobierania zestawów (dostępny dla wszystkich)
app.get('/sets', async (req, res) => {
  try {
    const sets = await prisma.set.findMany({
      include: { flashcards: true, user: true }, // Dodaj `user`
    });
    res.json(sets);
  } catch (error) {
    console.error('Błąd pobierania zestawów:', error);
    res.status(500).json({ error: 'Błąd pobierania zestawów' });
  }
});

// Endpoint pobierania szczegółów zestawu
app.get('/sets/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const set = await prisma.set.findUnique({
      where: { id: parseInt(id, 10) },
      include: { flashcards: true, user: true }, // Uwzględnij fiszki i użytkownika
    });

    if (!set) {
      return res.status(404).json({ error: 'Zestaw nie znaleziony' });
    }

    res.json(set);
  } catch (error) {
    console.error('Błąd pobierania szczegółów zestawu:', error);
    res.status(500).json({ error: 'Błąd pobierania szczegółów zestawu' });
  }
});

app.get('/users/sets', authenticateToken, async (req, res) => {
  try {
    const userSets = await prisma.set.findMany({
      where: { userId: req.user.id }, // Pobieranie zestawów dla zalogowanego użytkownika
    });
    res.json(userSets);
  } catch (error) {
    console.error('Błąd pobierania zestawów użytkownika:', error);
    res.status(500).json({ error: 'Błąd pobierania zestawów użytkownika' });
  }
});

// Endpoint tworzenia zestawu (tylko dla zalogowanych użytkowników)
app.post('/sets', authenticateToken, async (req, res) => {
  const { name } = req.body;

  try {
    const newSet = await prisma.set.create({
      data: { name, userId: req.user.id },
    });
    res.json(newSet);
  } catch (error) {
    console.error('Błąd tworzenia zestawu:', error);
    res.status(500).json({ error: 'Błąd tworzenia zestawu' });
  }
});

app.post('/flashcards/bulk', authenticateToken, async (req, res) => {
  const { flashcards } = req.body;

  try {
    if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0) {
      return res.status(400).json({ error: 'Nieprawidłowe dane wejściowe: flashcards musi być tablicą i nie może być pusta' });
    }

    // Sprawdź, czy wszystkie fiszki mają poprawny setId
    const setId = flashcards[0].setId;
    if (!setId || isNaN(parseInt(setId, 10))) {
      return res.status(400).json({ error: 'Nieprawidłowy setId: musi być liczbą' });
    }

    const existingSet = await prisma.set.findUnique({
      where: { id: parseInt(setId, 10) },
    });

    if (!existingSet) {
      return res.status(400).json({ error: 'Nieprawidłowy setId: zestaw nie istnieje' });
    }

    const createdFlashcards = await prisma.flashcard.createMany({
      data: flashcards.map(f => ({
        question: f.question,
        answer: f.answer,
        setId: parseInt(f.setId, 10),
      })),
    });

    res.status(201).json({ message: 'Fiszki zostały dodane', count: createdFlashcards.count });
  } catch (error) {
    console.error('Błąd dodawania fiszek:', error.message, error.stack);
    res.status(500).json({ error: 'Błąd dodawania fiszek', details: error.message });
  }
});
// Endpoint dodawania fiszki (z poprawką setId)
app.post('/flashcards', authenticateToken, async (req, res) => {
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
    console.error('Błąd tworzenia fiszki:', error);
    res.status(500).json({ error: 'Błąd tworzenia fiszki' });
  }
});

// Endpoint edycji fiszki (tylko dla zalogowanych)
app.put('/flashcards/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { question, answer } = req.body;

  try {
    const updatedFlashcard = await prisma.flashcard.update({
      where: { id: parseInt(id, 10) },
      data: { question, answer },
    });
    res.json(updatedFlashcard);
  } catch (error) {
    console.error('Błąd edycji fiszki:', error);
    res.status(500).json({ error: 'Błąd edycji fiszki' });
  }
});

// Endpoint usuwania fiszki (tylko dla zalogowanych)
app.delete('/flashcards/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.flashcard.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Błąd usuwania fiszki:', error);
    res.status(500).json({ error: 'Błąd usuwania fiszki' });
  }
});

// Endpoint edycji zestawu (tylko dla zalogowanych)
app.put('/sets/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const updatedSet = await prisma.set.update({
      where: { id: parseInt(id, 10) },
      data: { name },
    });
    res.json(updatedSet);
  } catch (error) {
    console.error('Błąd edycji zestawu:', error);
    res.status(500).json({ error: 'Błąd edycji zestawu' });
  }
});

// Endpoint usuwania zestawu (tylko dla zalogowanych)
app.delete('/sets/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.set.delete({
      where: { id: parseInt(id, 10) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Błąd usuwania zestawu:', error);
    res.status(500).json({ error: 'Błąd usuwania zestawu' });
  }
});

app.put('/sets/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const updatedSet = await prisma.set.update({
      where: { id: parseInt(id, 10) },
      data: req.body,
    });
    res.json(updatedSet);
  } catch (error) {
    console.error('Błąd aktualizacji zestawu:', error);
    res.status(500).json({ error: 'Błąd aktualizacji zestawu' });
  }
});


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
