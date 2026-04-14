
```bash
pnpm install
```

## Scripts

 `pnpm dev`  Run the server with hot reload  
 `pnpm test`  Run Jest tests

## ROUTES

Use:

POST `http://localhost:3823/simulations/start` - start sim

with

```
{
  "name": "Test Match 1"
}
```

GET `http://localhost:3823/simulations/{{id}}` - get sim

POST `http://localhost:3823/simulations/{{id}}/finish` - manual stop

POST `http://localhost:3823/simulations/{{id}}/restart` - restart
