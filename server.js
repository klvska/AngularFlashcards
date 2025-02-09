const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.post('/sets', async (req, res) => {
  const { name } = req.body;
  const newSet = await prisma.set.create({
    data: { name },
  });
  res.json(newSet);
});

app.get('/sets', async (req, res) => {
  const sets = await prisma.set.findMany({
    include: { flashcards: true },
  });
  res.json(sets);
});

app.post('/flashcards', async (req, res) => {
  const { question, answer, setId } = req.body;
  const newFlashcard = await prisma.flashcard.create({
    data: { question, answer, setId: parseInt(setId, 10) },
  });
  res.json(newFlashcard);
});


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
