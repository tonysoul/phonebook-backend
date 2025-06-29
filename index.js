require("dotenv").config();

const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const Person = require("./models/person");
const mongoose = require("mongoose");

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

  Person.countDocuments().then((count) => {
    res.send(
      `<p><strong>Phonebook has info for ${count} people</strong></p><p><strong>${time}</strong></p>`
    );
  });
});

app.post("/api/persons", (req, res) => {
  const body = req.body;

  if (body.name === undefined || body.number === undefined) {
    return res.status(400).json({ error: "name or number must be required" });
  }

  Person.findOne({ name: body.name }).then((result) => {
    if (result) {
      return res
        .status(400)
        .json({ error: `name:${body.name} must be uniqlo` });
    }

    const newPerson = new Person({
      name: body.name,
      number: body.number,
    });

    newPerson.save().then((savedPerson) => {
      res.json(savedPerson);
    });
  });

  // const body = req.body;

  // if (!body.name || !body.number) {
  //   return res.status(400).json({
  //     error: "name or number must be required",
  //   });
  // }

  // const founded = persons.find((p) => p.name === body.name);
  // if (founded) {
  //   return res.status(400).json({
  //     error: "name must be unique",
  //   });
  // }

  // const newPerson = {
  //   ...body,
  //   id: generateId(),
  // };

  // persons = persons.concat(newPerson);
  // res.json(newPerson);
});

app.get("/api/persons", (req, res) => {
  Person.find({}).then((result) => {
    res.json(result);
  });
});

app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
    .then((person) => {
      if (person) {
        res.json(person);
      } else {
        res.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(req.params.id, person, { new: true })
    .then((updatePerson) => {
      res.json(updatePerson);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  Person.findByIdAndDelete(req.params.id)
    .then((result) => {
      res.status(204).end();
    })
    .catch((error) => next(error));
});

// unknown
const unknownEndpoint = (req, res) => {
  return res.status(404).send({ error: "unknown point" });
};

app.use(unknownEndpoint);

// errorHandler
const errorHandler = (error, req, res, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return res.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
