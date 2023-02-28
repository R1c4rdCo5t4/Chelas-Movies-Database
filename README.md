# CMDB - Chelas Movies DataBase <img src="https://i.ibb.co/ccj2WBc/cmdb-icon.png" alt="cmdb-icon" width="40">
<img src="https://skillicons.dev/icons?i=javascript,nodejs,express,html,css" />

## IPW LEIC31D Group 13 2223i
### Nº 49445 José Alves - [T1xo](https://github.com/t1xo)
### Nº 49449 Diogo Almeida - [wartuga](https://github.com/wartuga)
### Nº 49511 Ricardo Costa - [R1c4rdCo5t4](https://github.com/R1c4rdCo5t4)


<br>

<img src="https://i.imgur.com/jCnEnfD.png" alt="cmdb website"/>

<br>

### The CMDB web application provides a web API that follows the REST principles, with responses in JSON format supporting the following features:</h3>

- Get the list of the most popular movies. The request has an optional parameter to limit the number of returned movies (max 250)
- Search movies by name. The request has an optional parameter to limit the number of returned movies (max 250)
- Manage favorite movies groups
- Create group providing its name and description
- Edit group by changing its name and description
- List all groups
- Delete a group
- Get the details of a group, with its name, description, the names and total duration of the included movies
- Add a movie to a group
- Remove a movie from a group
- Create new user

<br>

## Documentation

### The modules from the CMDB server application are:
- <code>cmdb-server.mjs</code> - file that constitutes the entry point to the server application
- <code>cmdb-web-api.mjs</code> - implementation of the HTTP routes that make up the REST API of the web application
- <code>cmdb-services.mjs</code> - implementation of the logic of each of the application's functionalities
- <code>cmdb-movies-data.mjs</code> - access to the Internet Movies Database API
- <code>cmdb-data-mem.mjs</code> - access to cmdb data (groups and users), in this version stored in memory
- <code>cmdb-data-elastic.mjs</code> - access to cmdb data (groups and users), through the elastic search database
- <code>cmdb-web-site.mjs</code> - implementation of the HTTP routes that make up the web pages of the site

<br>
The Web API has the following paths/operations: 

- **POST** <code>/users</code> - Creates a new user
- **GET** <code>/movies/top</code> - Gets top movies from the IMDB database with 'limit' query
- **GET** <code>/movies/search</code> - Searches movie from the IMDB database with 'q' and 'limit' queries
- **GET** <code>/movies/:movieId</code> - Gets the details of a specific movie
- **GET** <code>/groups</code> - Gets all groups from a user
- **POST** <code>/groups</code> - Creates a group sent in the body
- **GET** <code>/groups/:groupId</code> - Gets a specific group by id from a user
- **PUT** <code>/groups/:groupId</code> - Updates specific group from a user
- **DELETE** <code>/groups/:groupId</code>  Deletes a group from a user
- **POST** <code>/groups/:groupId</code> - Adds a movie to a group
- **DELETE** <code>/groups/:groupId/:movieId</code> - Deletes a movie from a group

<br>
<h3>Dependency tree:</h3>

```
                                                      cmdb-data-elastic.mjs
                                                                ^
                                                                |
cmdb-server.mjs -> cmdb-web-api.mjs/cmdb-web-site.mjs -> cmdb-services.mjs -> cmdb-movies-data.mjs
                                                                |           
                                                                V
                                                        cmdb-data-mem.mjs
```


