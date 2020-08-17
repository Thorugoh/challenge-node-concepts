const express = require("express");
const cors = require("cors");

 const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());


const repositories = [];

function logRequests(request, response, next) {
  const { method, url } = request;

  const logLabel = `[${method}] ${url}`;

  console.time(logLabel);

  next();

  console.timeEnd(logLabel);
}


function validateRepositoryId(request, response, next){
  const {id} = request.params;
  
  if(!isUuid(id)){
    return response.status(400).json({error: 'Invalid repository Id'});
  }

  return next();
} 

app.use(logRequests);
app.use('/repositories/:id', validateRepositoryId);

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  }

  repositories.push(repository);

  return response.json(repository);

});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repoIndex = repositories.findIndex(repository => repository.id === id);

  if(repoIndex < 0){
    return response.status(400).json({error: 'repository id does not exist'})
  }

  const repository = {
    id,
    title,
    url,
    techs,
    likes: repositories[repoIndex].likes,    
  }

  repositories[repoIndex] = repository;

  return response.json(repository);

});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const repoIndex = repositories.findIndex(repository => repository.id === id);
  
  if(repoIndex < 0){
    return response.status(400).json({error: 'repository id does not exist'})
  }

  repositories.splice(repoIndex, 1);

  return response.status(204).send();

});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  const repoIndex = repositories.findIndex(repository => repository.id === id);

  if(repoIndex < 0){
    return response.status(400).json({error: 'repository id does not exist'})
  }
  repositories[repoIndex].likes++;
  
  return response.json(repositories[repoIndex]);
});

module.exports = app;
