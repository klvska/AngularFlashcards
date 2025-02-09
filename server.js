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

app.put('/sets/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { name } = req.body;
  try {
    const updatedSet = await prisma.set.update({
      where: { id },
      data: { name },
    });
    res.json(updatedSet);
  } catch (error) {
    console.error(`Error updating set with ID: ${id}`, error);
    res.status(404).send({ message: 'Set not found' });
  }
});

app.put('/flashcards/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { question, answer } = req.body;
  try {
    const updatedFlashcard = await prisma.flashcard.update({
      where: { id },
      data: { question, answer },
    });
    res.json(updatedFlashcard);
  } catch (error) {
    console.error(`Error updating flashcard with ID: ${id}`, error);
    res.status(404).send({ message: 'Flashcard not found' });
  }
});

app.delete('/sets/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  console.log(`Received DELETE request for set with ID: ${id}`);
  try {
    await prisma.set.delete({
      where: { id },
    });
    console.log(`Set with ID: ${id} deleted successfully`);
    res.status(200).send({ message: 'Set deleted successfully' });
  } catch (error) {
    console.error(`Error deleting set with ID: ${id}`, error);
    res.status(404).send({ message: 'Set not found' });
  }
});

app.delete('/flashcards/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  console.log(`Received DELETE request for flashcard with ID: ${id}`);
  try {
    await prisma.flashcard.delete({
      where: { id },
    });
    console.log(`Flashcard with ID: ${id} deleted successfully`);
    res.status(200).send({ message: 'Flashcard deleted successfully' });
  } catch (error) {
    console.error(`Error deleting flashcard with ID: ${id}`, error);
    res.status(404).send({ message: 'Flashcard not found' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
