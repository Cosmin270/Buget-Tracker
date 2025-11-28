const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const { parse } = require('dotenv');
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());


app.get('/expenses', async (req, res) => {
    const expenses = await prisma.expense.findMany({orderBy: { date: 'desc' }});
    res.json(expenses);
});

app.post('/expenses', async (req, res) => {
    const { amount, category, date } = req.body;
    const newExpense = await prisma.expense.create({
        data: {
            amount: parseFloat(amount),
            category,
            userId: 1,
            date: date ? new Date(date) : new Date(),
        },
    });
    res.json(newExpense);
});

app.post('/subscriptions', async (req, res) => {
    const {name, amout, billingDate} = req.body;

    const newSubscription = await prisma.subscription.create({
        data: {
            name,
            amount: parseFloat(amout),
            billingDate: parseInt(billingDate),
            userId: 1,
        },
    });
    res.json(newSubscription);
});

app.delete('/expenses/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.expense.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Could not delete expense" });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});