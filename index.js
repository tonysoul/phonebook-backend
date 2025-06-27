import cors from "cors";
import express from "express";
import morgan from "morgan";

const app = express();

morgan.token("type", function (req, res) {
  return JSON.stringify(req.body);
});

app.use(express.static("dist"));
app.use(cors());
app.use(express.json());
app.use(
  // morgan(":method :url :status :res[content-length] - :response-time ms")
  morgan(":method :url :status :res[content-length] - :response-time ms :type")
);

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generateId = () => {
  const maxId = persons.length > 0 ? Math.max(...persons.map((p) => p.id)) : 0;
  return maxId + 1;
};

app.get("/info", (req, res) => {
  const time = new Date();

  res.send(
    `<p><strong>Phonebook has info for ${persons.length} people</strong></p><p><strong>${time}</strong></p>`
  );
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "name or number must be required",
    });
  }

  const founded = persons.find((p) => p.name === body.name);
  if (founded) {
    return res.status(400).json({
      error: "name must be unique",
    });
  }

  const newPerson = {
    ...body,
    id: generateId(),
  };

  persons = persons.concat(newPerson);
  res.json(newPerson);
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/api/persons/:id", (req, res) => {
  const id = +req.params.id;
  const person = persons.find((p) => p.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/persons/:id", (req, res) => {
  const id = +req.params.id;

  if (Number.isNaN(id)) {
    res.status(404).end();
  } else {
    persons = persons.filter((p) => p.id !== id);

    res.status(204).end();
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
